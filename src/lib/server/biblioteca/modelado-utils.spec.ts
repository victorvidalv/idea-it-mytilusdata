import { describe, it, expect } from 'vitest';
import {
	crearModeloLogistico,
	crearModeloLogisticoEstacional,
	calcularProyeccionBootstrap,
	ejecutarAjusteEstacional,
	calcularR2Generico,
	calcularValoresIniciales,
	calcularValoresInicialesEstacionales
} from './modelado-utils';
import { validarDegradacionTemporal } from './modelado';

/**
 * Genera datos simulados de crecimiento de Mytilus chilensis
 * basados en una sigmoide teórica con ruido gaussiano leve.
 */
function generarMockData(): { dias: number[]; tallas: number[] } {
	const L = 85;
	const k = 0.025;
	const x0 = 180;
	const dias = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360];
	const modelo = crearModeloLogistico([L, k, x0]);
	const tallas = dias.map((d) => modelo(d) + (Math.random() - 0.5) * 1.5);
	return { dias, tallas };
}

describe('calcularProyeccionBootstrap', () => {
	it('se ejecuta sin bloquearse y retorna percentiles coherentes', async () => {
		const { dias, tallas } = generarMockData();
		const resultado = await calcularProyeccionBootstrap(dias, tallas, 30);

		expect(resultado).not.toBeNull();
		expect(resultado!.mediana.length).toBe(30);
		expect(resultado!.limiteInferior.length).toBe(30);
		expect(resultado!.limiteSuperior.length).toBe(30);

		for (let i = 0; i < 30; i++) {
			expect(resultado!.limiteInferior[i]).toBeLessThanOrEqual(resultado!.mediana[i]);
			expect(resultado!.mediana[i]).toBeLessThanOrEqual(resultado!.limiteSuperior[i]);
			expect(Number.isFinite(resultado!.mediana[i])).toBe(true);
			expect(Number.isFinite(resultado!.limiteInferior[i])).toBe(true);
			expect(Number.isFinite(resultado!.limiteSuperior[i])).toBe(true);
		}
	});

	it('retorna null para datos insuficientes', async () => {
		const resultado = await calcularProyeccionBootstrap([1, 2], [10, 12], 10);
		expect(resultado).toBeNull();
	});

	it('retorna null para horizonte no positivo', async () => {
		const { dias, tallas } = generarMockData();
		const resultado = await calcularProyeccionBootstrap(dias, tallas, 0);
		expect(resultado).toBeNull();
	});
});

describe('crearModeloLogisticoEstacional', () => {
	it('la optimización converge sin NaN ni Infinity', () => {
		const { dias, tallas } = generarMockData();
		const initialBase = calcularValoresIniciales(dias, tallas);
		const initialEstacional = calcularValoresInicialesEstacionales(initialBase);

		const params = ejecutarAjusteEstacional(dias, tallas, initialEstacional);

		expect(params).not.toBeNull();
		expect(params!.length).toBe(5);
		expect(params!.every(Number.isFinite)).toBe(true);

		const modelo = crearModeloLogisticoEstacional(params!);
		const r2 = calcularR2Generico(dias, tallas, modelo);
		expect(Number.isFinite(r2)).toBe(true);
		expect(r2).toBeGreaterThan(0.8);
	});

	it('con k1=k2=0 se comporta igual al modelo base', () => {
		const paramsBase = [85, 0.025, 180];
		const paramsEstacional = [85, 0.025, 0, 0, 180];
		const modeloBase = crearModeloLogistico(paramsBase);
		const modeloEst = crearModeloLogisticoEstacional(paramsEstacional);

		const diasPrueba = [0, 50, 100, 180, 250, 365];
		for (const d of diasPrueba) {
			expect(modeloEst(d)).toBeCloseTo(modeloBase(d), 6);
		}
	});
});

describe('validarDegradacionTemporal', () => {
	it('divide correctamente en periodos y retorna estructura de error', () => {
		const { dias, tallas } = generarMockData();
		const resultado = validarDegradacionTemporal(dias, tallas);

		expect(resultado).not.toBeNull();
		expect(Array.isArray(resultado!.degradacionM1)).toBe(true);
		expect(Array.isArray(resultado!.degradacionM2)).toBe(true);
		expect(Array.isArray(resultado!.degradacionM3)).toBe(true);

		// Con 12 meses de datos debe haber al menos algunos RMSE calculados
		expect(resultado!.degradacionM1.length).toBeGreaterThan(0);

		// Todos los RMSE deben ser finitos y no negativos
		for (const v of resultado!.degradacionM1) {
			expect(Number.isFinite(v)).toBe(true);
			expect(v).toBeGreaterThanOrEqual(0);
		}
		for (const v of resultado!.degradacionM2) {
			expect(Number.isFinite(v)).toBe(true);
			expect(v).toBeGreaterThanOrEqual(0);
		}
		for (const v of resultado!.degradacionM3) {
			expect(Number.isFinite(v)).toBe(true);
			expect(v).toBeGreaterThanOrEqual(0);
		}
	});

	it('retorna null para datos insuficientes', () => {
		const resultado = validarDegradacionTemporal([1], [10]);
		expect(resultado).toBeNull();
	});
});
