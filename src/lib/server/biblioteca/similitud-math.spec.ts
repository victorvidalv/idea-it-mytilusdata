import { describe, it, expect } from 'vitest';
import {
	calcularSSE,
	calcularSSENormalizado,
	calcularR2,
	escalarParametros
} from './similitud-utils';
import { crearModeloLogistico } from './modelado-utils';
import type { BibliotecaRecord } from './queries';
import type { ParametrosSigmoidal } from '$lib/server/db/schema';

const PARAMS_REFERENCIA: ParametrosSigmoidal = { L: 80, k: 0.02, x0: 150, r2: 0.98 };

function generarDatosPerfectos(params: ParametrosSigmoidal, diasArr: number[]) {
	const modelo = crearModeloLogistico([params.L, params.k, params.x0]);
	return { dias: diasArr, tallas: diasArr.map((d) => modelo(d)) };
}

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

describe('calcularSSENormalizado', () => {
	it('devuelve ~0 cuando los datos coinciden exactamente con la curva', () => {
		const dias = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
		const datos = generarDatosPerfectos(PARAMS_REFERENCIA, dias);
		const curva = crearCurvaFalsa(PARAMS_REFERENCIA);
		expect(calcularSSENormalizado(datos, curva)).toBeCloseTo(0, 5);
	});

	it('devuelve valor bajo cuando la curva tiene forma similar pero distinta escala', () => {
		const dias = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
		const paramsEscalados: ParametrosSigmoidal = { L: 50, k: 0.02, x0: 150, r2: 0.95 };
		const datos = generarDatosPerfectos(paramsEscalados, dias);
		const curva = crearCurvaFalsa(PARAMS_REFERENCIA);
		expect(calcularSSENormalizado(datos, curva)).toBeCloseTo(0, 3);
	});
});

describe('escalarParametros', () => {
	it('encuentra el L óptimo', () => {
		const dias = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
		const paramsOriginal: ParametrosSigmoidal = { L: 50, k: 0.02, x0: 150, r2: 0.95 };
		const datos = generarDatosPerfectos(paramsOriginal, dias);
		const paramsEscalados = escalarParametros(PARAMS_REFERENCIA, datos);
		expect(paramsEscalados.L).toBeCloseTo(50, 0);
	});
});

describe('calcularR2', () => {
	it('devuelve ~1 para datos perfectos', () => {
		const dias = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300];
		const datos = generarDatosPerfectos(PARAMS_REFERENCIA, dias);
		expect(calcularR2(datos, PARAMS_REFERENCIA)).toBeCloseTo(1, 5);
	});
});
