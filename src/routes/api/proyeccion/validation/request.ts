/**
 * Validación de request body para el endpoint de proyección.
 */

import type { ProyeccionRequest } from '../types';
import type { ValidacionResult } from './auth';

/**
 * Validar que los campos requeridos existan en el body.
 */
export function validarCamposRequeridos(body: Partial<ProyeccionRequest>): ValidacionResult {
	if (!body.fechas || !Array.isArray(body.fechas)) {
		return {
			valido: false,
			error: 'Campo requerido: fechas (array de fechas ISO)'
		};
	}

	if (!body.tallas || !Array.isArray(body.tallas)) {
		return {
			valido: false,
			error: 'Campo requerido: tallas (array de números)'
		};
	}

	return { valido: true };
}

/**
 * Validar que los arrays tengan la misma longitud.
 */
export function validarLongitudArrays(body: ProyeccionRequest): ValidacionResult {
	if (body.fechas.length !== body.tallas.length) {
		return {
			valido: false,
			error: 'Los arrays fechas y tallas deben tener la misma longitud'
		};
	}

	return { valido: true };
}

/**
 * Validar cantidad mínima de puntos para proyección.
 */
export function validarMinimoPuntos(body: ProyeccionRequest): ValidacionResult {
	if (body.fechas.length < 5) {
		return {
			valido: false,
			error: 'Se requieren al menos 5 mediciones para ejecutar una proyección estable'
		};
	}

	return { valido: true };
}
