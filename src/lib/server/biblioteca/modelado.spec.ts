import { describe, it, expect } from 'vitest';
import { validarDegradacionTemporal } from './modelado';
import { generarMockDatosCrecimiento } from './modelado-test-helpers';

describe('validarDegradacionTemporal', () => {
	it('divide correctamente los datos históricos en ventanas secuenciales por mes', () => {
		const { dias, tallas } = generarMockDatosCrecimiento();
		const resultado = validarDegradacionTemporal(dias, tallas);

		expect(resultado).not.toBeNull();
		expect(Array.isArray(resultado!.degradacionM1)).toBe(true);
		expect(Array.isArray(resultado!.degradacionM2)).toBe(true);
		expect(Array.isArray(resultado!.degradacionM3)).toBe(true);

		// Con datos de ~12 meses debe haber al menos algunas ventanas evaluadas
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

	it('cumple realidad física: RMSE t+3 es mayor o igual a RMSE t+1 en cada ventana', () => {
		const { dias, tallas } = generarMockDatosCrecimiento();
		const resultado = validarDegradacionTemporal(dias, tallas);

		expect(resultado).not.toBeNull();

		// Comparar punto a punto para las ventanas que tengan los 3 horizontes
		const minLength = Math.min(
			resultado!.degradacionM1.length,
			resultado!.degradacionM3.length
		);

		expect(minLength).toBeGreaterThan(0);

		for (let i = 0; i < minLength; i++) {
			const rmse1 = resultado!.degradacionM1[i];
			const rmse3 = resultado!.degradacionM3[i];
			expect(rmse3).toBeGreaterThanOrEqual(rmse1);
		}
	});

	it('retorna null para datos insuficientes', () => {
		const resultado = validarDegradacionTemporal([1], [10]);
		expect(resultado).toBeNull();
	});
});
