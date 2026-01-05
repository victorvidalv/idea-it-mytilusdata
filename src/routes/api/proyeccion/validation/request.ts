/**
 * Validación de request body para el endpoint de proyección.
 */

import type { ProyeccionRequest } from '../types';
import type { ValidacionResult } from './auth';

/**
 * Validar que los campos requeridos existan en el body.
 */
export function validarCamposRequeridos(body: Partial<ProyeccionRequest>): ValidacionResult {
	if (!body.dias || !Array.isArray(body.dias)) {
		return {
			valido: false,
			error: 'Campo requerido: dias (array de números)'
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
	if (body.dias.length !== body.tallas.length) {
		return {
			valido: false,
			error: 'Los arrays dias y tallas deben tener la misma longitud'
		};
	}

	return { valido: true };
}

/**
 * Validar cantidad mínima de puntos para proyección.
 */
export function validarMinimoPuntos(body: ProyeccionRequest): ValidacionResult {
	if (body.dias.length < 3) {
		return {
			valido: false,
			error: 'Se requieren al menos 3 puntos de datos para proyectar'
		};
	}

	return { valido: true };
}
