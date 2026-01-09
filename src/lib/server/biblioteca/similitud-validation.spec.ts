import { describe, it, expect } from 'vitest';
import { validarDatosUsuario } from './similitud-validation';

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
