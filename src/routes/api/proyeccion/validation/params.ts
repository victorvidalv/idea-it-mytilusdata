/**
 * Validación de parámetros de query para el endpoint de proyección.
 */

import type { ValidacionResult } from './auth';

/**
 * Validar que cicloId sea un número válido.
 */
export function validarCicloIdParam(cicloIdParam: string | null): ValidacionResult {
	if (!cicloIdParam) {
		return {
			valido: false,
			error: 'Parámetro requerido: cicloId'
		};
	}

	const cicloId = parseInt(cicloIdParam, 10);
	if (isNaN(cicloId)) {
		return {
			valido: false,
			error: 'Parámetro cicloId debe ser un número válido'
		};
	}

	return { valido: true };
}

/**
 * Obtener cicloId parseado del parámetro string.
 */
export function obtenerCicloId(cicloIdParam: string | null): number | null {
	if (!cicloIdParam) {
		return null;
	}

	const cicloId = parseInt(cicloIdParam, 10);
	if (isNaN(cicloId)) {
		return null;
	}

	return cicloId;
}
