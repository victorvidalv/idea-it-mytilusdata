import { describe, it, expect } from 'vitest';
import { calcularDiaObjetivo, generarProyeccion } from './similitud-proyeccion';
import { crearModeloLogistico } from './modelado-utils';
import type { ParametrosSigmoidal } from '$lib/server/db/schema';

const PARAMS_REFERENCIA: ParametrosSigmoidal = { L: 80, k: 0.02, x0: 150, r2: 0.98 };

describe('calcularDiaObjetivo', () => {
	it('devuelve el día correcto aplicando la inversa', () => {
		const params = PARAMS_REFERENCIA;
		const tallaObjetivo = 60;
		const dia = calcularDiaObjetivo(params, tallaObjetivo);
		expect(dia).toBeDefined();
		const modelo = crearModeloLogistico([params.L, params.k, params.x0]);
		expect(Math.abs(modelo(dia!) - tallaObjetivo)).toBeLessThan(1);
	});

	it('devuelve undefined para tallas fuera de rango', () => {
		expect(calcularDiaObjetivo(PARAMS_REFERENCIA, 80)).toBeUndefined();
		expect(calcularDiaObjetivo(PARAMS_REFERENCIA, 0)).toBeUndefined();
	});
});

describe('generarProyeccion', () => {
	it('genera puntos interpolados y proyectados', () => {
		const datos = { dias: [30, 60, 90], tallas: [30, 40, 50] };
		const proyeccion = generarProyeccion(PARAMS_REFERENCIA, datos, { diasMax: 300 });

		expect(proyeccion.length).toBeGreaterThan(0);
		proyeccion.filter(p => p.dia <= 90).forEach(p => expect(p.tipo).toBe('interpolado'));
		proyeccion.filter(p => p.dia > 90).forEach(p => expect(p.tipo).toBe('proyectado'));
	});
});
