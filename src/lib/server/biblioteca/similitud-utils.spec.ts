/**
 * Tests unitarios para las funciones matemáticas del sistema de similitud y proyección.
 * Verifican que las correcciones matemáticas sean correctas.
 */

import { describe, it, expect } from 'vitest';
import {
	calcularDiaObjetivo,
	calcularSSE,
	calcularSSENormalizado,
	calcularR2,
	generarProyeccion,
	escalarParametros,
	validarDatosUsuario
} from './similitud-utils';
import { crearModeloLogistico } from './modelado-utils';
import type { BibliotecaRecord } from './queries';
import type { ParametrosSigmoidal } from '$lib/server/db/schema';

// --- Datos de prueba ---
const PARAMS_REFERENCIA: ParametrosSigmoidal = { L: 80, k: 0.02, x0: 150, r2: 0.98 };

// Generar datos "perfectos" a partir de una curva conocida
function generarDatosPerfectos(params: ParametrosSigmoidal, diasArr: number[]) {
	const modelo = crearModeloLogistico([params.L, params.k, params.x0]);
	return {
		dias: diasArr,
		tallas: diasArr.map((d) => modelo(d))
	};
}

// Crear un BibliotecaRecord falso para testing
function crearCurvaFalsa(params: ParametrosSigmoidal, id = 1): BibliotecaRecord {
	return {
		id,
		codigoReferencia: `test-${id}`,
		cicloId: 1,
		puntosJson: {},
		parametrosCalculados: params,
		formulaTipo: 'LOGISTICO',
		metadatos: null,
		userId: 1,
		createdAt: new Date(),
		updatedAt: new Date()
	};
}

// --- Tests ---

describe('calcularDiaObjetivo', () => {
	it('devuelve el día correcto aplicando la inversa de la logística', () => {
		const params = PARAMS_REFERENCIA;
		const tallaObjetivo = 60; // Debe estar en (0, L=80)

		const dia = calcularDiaObjetivo(params, tallaObjetivo);
		expect(dia).toBeDefined();

		// Verificar: evaluar la sigmoidal en el día calculado debe dar ≈ tallaObjetivo
		const modelo = crearModeloLogistico([params.L, params.k, params.x0]);
		const tallaCalculada = modelo(dia!);
		// ceil introduce hasta 1 día de error, lo cual da un error de talla < k*L/4 ≈ 0.4
		expect(Math.abs(tallaCalculada - tallaObjetivo)).toBeLessThan(1);
	});

	it('devuelve undefined si la talla objetivo >= L', () => {
		expect(calcularDiaObjetivo(PARAMS_REFERENCIA, 80)).toBeUndefined();
		expect(calcularDiaObjetivo(PARAMS_REFERENCIA, 100)).toBeUndefined();
	});

	it('devuelve undefined si la talla objetivo <= 0', () => {
		expect(calcularDiaObjetivo(PARAMS_REFERENCIA, 0)).toBeUndefined();
		expect(calcularDiaObjetivo(PARAMS_REFERENCIA, -5)).toBeUndefined();
	});

	it('devuelve undefined si el día calculado está fuera de rango', () => {
		// Con x0=150 y talla muy cercana a 0, el día sería muy negativo
		const params: ParametrosSigmoidal = { L: 80, k: 0.02, x0: 150, r2: 0.98 };
		expect(calcularDiaObjetivo(params, 0.01)).toBeUndefined();
	});

	it('el punto de inflexión (x0) corresponde a L/2', () => {
		const params = PARAMS_REFERENCIA;
		const dia = calcularDiaObjetivo(params, params.L / 2);
		// x0 = 150 → ceil(150) = 150
		expect(dia).toBe(150);
	});
});

describe('calcularSSENormalizado', () => {
	it('devuelve ~0 cuando los datos coinciden exactamente con la curva', () => {
		const dias = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
		const datos = generarDatosPerfectos(PARAMS_REFERENCIA, dias);
		const curva = crearCurvaFalsa(PARAMS_REFERENCIA);

		const sse = calcularSSENormalizado(datos, curva);
		expect(sse).toBeCloseTo(0, 5);
	});

	it('devuelve valor bajo cuando la curva tiene forma similar pero distinta escala', () => {
		const dias = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
		// Misma forma (k, x0) pero L diferente → misma curva normalizada
		const paramsEscalados: ParametrosSigmoidal = { L: 50, k: 0.02, x0: 150, r2: 0.95 };
		const datos = generarDatosPerfectos(paramsEscalados, dias);
		const curva = crearCurvaFalsa(PARAMS_REFERENCIA); // L=80

		const sse = calcularSSENormalizado(datos, curva);
		// Deben tener la misma forma normalizada → SSE ≈ 0
		expect(sse).toBeCloseTo(0, 3);
	});

	it('devuelve valor alto cuando las formas son distintas', () => {
		const dias = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
		const datos = generarDatosPerfectos(PARAMS_REFERENCIA, dias);
		// Curva con forma muy diferente
		const paramsDistintos: ParametrosSigmoidal = { L: 80, k: 0.06, x0: 50, r2: 0.90 };
		const curva = crearCurvaFalsa(paramsDistintos);

		const sse = calcularSSENormalizado(datos, curva);
		expect(sse).toBeGreaterThan(0.01);
	});
});

describe('escalarParametros', () => {
	it('encuentra el L óptimo que minimiza el error cuadrático', () => {
		const dias = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
		// Datos generados con L=50
		const paramsOriginal: ParametrosSigmoidal = { L: 50, k: 0.02, x0: 150, r2: 0.95 };
		const datos = generarDatosPerfectos(paramsOriginal, dias);

		// Partir de curva con L=80
		const paramsEscalados = escalarParametros(PARAMS_REFERENCIA, datos);

		// El L escalado debe acercarse a 50
		expect(paramsEscalados.L).toBeCloseTo(50, 0);
		// k y x0 deben conservarse
		expect(paramsEscalados.k).toBe(PARAMS_REFERENCIA.k);
		expect(paramsEscalados.x0).toBe(PARAMS_REFERENCIA.x0);
	});

	it('devuelve parámetros originales si no hay datos', () => {
		const resultado = escalarParametros(PARAMS_REFERENCIA, { dias: [], tallas: [] });
		expect(resultado).toEqual(PARAMS_REFERENCIA);
	});
});

describe('calcularR2', () => {
	it('devuelve ~1 para datos que coinciden perfectamente con la curva', () => {
		const dias = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
		const datos = generarDatosPerfectos(PARAMS_REFERENCIA, dias);

		const r2 = calcularR2(datos, PARAMS_REFERENCIA);
		expect(r2).toBeCloseTo(1, 5);
	});
});

describe('generarProyeccion', () => {
	it('genera puntos interpolados y proyectados correctamente', () => {
		const datos = { dias: [30, 60, 90], tallas: [30, 40, 50] };
		const proyeccion = generarProyeccion(PARAMS_REFERENCIA, datos, { diasMax: 300 });

		expect(proyeccion.length).toBeGreaterThan(0);

		// Todos los puntos hasta día 90 son interpolados
		const interpolados = proyeccion.filter((p) => p.dia <= 90);
		interpolados.forEach((p) => expect(p.tipo).toBe('interpolado'));

		// Puntos después de día 90 son proyectados
		const proyectados = proyeccion.filter((p) => p.dia > 90);
		proyectados.forEach((p) => expect(p.tipo).toBe('proyectado'));
	});

	it('los valores de talla siguen la logística', () => {
		const modelo = crearModeloLogistico([PARAMS_REFERENCIA.L, PARAMS_REFERENCIA.k, PARAMS_REFERENCIA.x0]);
		const datos = { dias: [30], tallas: [30] };
		const proyeccion = generarProyeccion(PARAMS_REFERENCIA, datos, { diasMax: 300 });

		for (const p of proyeccion) {
			const esperado = modelo(p.dia);
			expect(p.talla).toBeCloseTo(esperado, 1);
		}
	});
});

describe('validarDatosUsuario', () => {
	it('retorna null para datos válidos', () => {
		const datos = { dias: [0, 30, 60], tallas: [25, 35, 45] };
		expect(validarDatosUsuario(datos)).toBeNull();
	});

	it('rechaza menos de 3 puntos', () => {
		const datos = { dias: [0, 30], tallas: [25, 35] };
		expect(validarDatosUsuario(datos)).toBeTruthy();
	});

	it('rechaza longitudes distintas', () => {
		const datos = { dias: [0, 30, 60], tallas: [25, 35] };
		expect(validarDatosUsuario(datos)).toBeTruthy();
	});

	it('rechaza días desordenados', () => {
		const datos = { dias: [60, 30, 0], tallas: [45, 35, 25] };
		expect(validarDatosUsuario(datos)).toBeTruthy();
	});
});
