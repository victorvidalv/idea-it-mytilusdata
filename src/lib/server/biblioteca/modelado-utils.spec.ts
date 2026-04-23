import { describe, it, expect } from 'vitest';
import {
	crearModeloLogistico,
	crearModeloLogisticoEstacional,
	calcularProyeccionBootstrap,
	ejecutarAjusteEstacional,
	calcularR2Generico,
	calcularValoresIniciales,
	calcularValoresInicialesEstacionales,
	validarDatosEntrada
} from './modelado-utils';
import { generarMockDatosCrecimiento } from './modelado-test-helpers';

describe('generarMockDatosCrecimiento', () => {
	it('provee al menos 15 puntos y pasa validación de entrada', () => {
		const { dias, tallas } = generarMockDatosCrecimiento();
		expect(dias.length).toBeGreaterThanOrEqual(15);
		expect(validarDatosEntrada(dias, tallas)).toBe(true);
	});
});

describe('calcularProyeccionBootstrap', () => {
	it('se ejecuta sin bloquearse y retorna percentiles coherentes', async () => {
		const { dias, tallas } = generarMockDatosCrecimiento();
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
		const { dias, tallas } = generarMockDatosCrecimiento();
		const resultado = await calcularProyeccionBootstrap(dias, tallas, 0);
		expect(resultado).toBeNull();
	});

	it('cumple rendimiento crítico: 1.000 remuestreos en menos de 300 ms', async () => {
		const { dias, tallas } = generarMockDatosCrecimiento();
		const t0 = performance.now();
		await calcularProyeccionBootstrap(dias, tallas, 30);
		const t1 = performance.now();
		const duracion = t1 - t0;
		expect(duracion).toBeLessThan(300);
	});
});

describe('crearModeloLogisticoEstacional', () => {
	it('la optimización converge sin NaN ni Infinity y retorna 5 parámetros finitos', () => {
		const { dias, tallas } = generarMockDatosCrecimiento();
		const initialBase = calcularValoresIniciales(dias, tallas);
		const initialEstacional = calcularValoresInicialesEstacionales(initialBase);

		const params = ejecutarAjusteEstacional(dias, tallas, initialEstacional);

		expect(params).not.toBeNull();
		expect(params!.length).toBe(5);
		expect(params!.every(Number.isFinite)).toBe(true);

		const [L, k0, k1, k2, x0] = params!;
		expect(Number.isFinite(L)).toBe(true);
		expect(Number.isFinite(k0)).toBe(true);
		expect(Number.isFinite(k1)).toBe(true);
		expect(Number.isFinite(k2)).toBe(true);
		expect(Number.isFinite(x0)).toBe(true);

		const modelo = crearModeloLogisticoEstacional(params!);
		const r2 = calcularR2Generico(dias, tallas, modelo);
		expect(Number.isFinite(r2)).toBe(true);
		expect(r2).toBeGreaterThan(0.8);
	});

	it('con k1=k2=0 se comporta idéntico al modelo base de 3 parámetros', () => {
		const paramsBase = [88, 0.024, 190];
		const paramsEstacional = [88, 0.024, 0, 0, 190];
		const modeloBase = crearModeloLogistico(paramsBase);
		const modeloEst = crearModeloLogisticoEstacional(paramsEstacional);

		const diasPrueba = [0, 50, 100, 180, 250, 365];
		for (const d of diasPrueba) {
			expect(modeloEst(d)).toBeCloseTo(modeloBase(d), 6);
		}
	});
});
