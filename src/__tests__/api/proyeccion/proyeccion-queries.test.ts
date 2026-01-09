// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { convertirMedicionesADias } from '../../../routes/api/proyeccion/queries';

describe('convertirMedicionesADias', () => {
	it('returns empty array for no mediciones', () => {
		const fechaSiembra = new Date('2024-01-01');
		expect(convertirMedicionesADias([], fechaSiembra)).toEqual([]);
	});

	it('calculates days correctly for single medicion', () => {
		const fechaSiembra = new Date('2024-01-01');
		const mediciones = [{ valor: 5.2, fechaMedicion: new Date('2024-01-11') }];
		const result = convertirMedicionesADias(mediciones, fechaSiembra);
		expect(result).toHaveLength(1);
		expect(result[0].dia).toBe(10);
		expect(result[0].talla).toBe(5.2);
	});

	it('calculates days correctly for multiple mediciones', () => {
		const fechaSiembra = new Date('2024-01-01');
		const mediciones = [
			{ valor: 2.0, fechaMedicion: new Date('2024-01-11') },
			{ valor: 4.5, fechaMedicion: new Date('2024-01-21') },
			{ valor: 7.0, fechaMedicion: new Date('2024-02-01') }
		];
		const result = convertirMedicionesADias(mediciones, fechaSiembra);
		expect(result).toHaveLength(3);
		expect(result[0].dia).toBe(10);
		expect(result[1].dia).toBe(20);
		expect(result[2].dia).toBe(31);
	});

	it('returns 0 days when measurement is same day as siembra', () => {
		const fechaSiembra = new Date('2024-01-01T12:00:00');
		const mediciones = [{ valor: 1.0, fechaMedicion: new Date('2024-01-01T12:00:00') }];
		const result = convertirMedicionesADias(mediciones, fechaSiembra);
		expect(result[0].dia).toBe(0);
	});

	it('handles fractional days (rounds correctly)', () => {
		const fechaSiembra = new Date('2024-01-01T00:00:00');
		const mediciones = [{ valor: 3.0, fechaMedicion: new Date('2024-01-02T12:00:00') }];
		const result = convertirMedicionesADias(mediciones, fechaSiembra);
		expect(result[0].dia).toBe(2);
	});

	it('preserves valor as talla in output', () => {
		const fechaSiembra = new Date('2024-01-01');
		const mediciones = [{ valor: 9.99, fechaMedicion: new Date('2024-01-02') }];
		const result = convertirMedicionesADias(mediciones, fechaSiembra);
		expect(result[0].talla).toBe(9.99);
	});

	it('handles mediciones before siembra (negative days)', () => {
		const fechaSiembra = new Date('2024-01-10');
		const mediciones = [{ valor: 1.0, fechaMedicion: new Date('2024-01-05') }];
		const result = convertirMedicionesADias(mediciones, fechaSiembra);
		expect(result[0].dia).toBe(-5);
	});
});
