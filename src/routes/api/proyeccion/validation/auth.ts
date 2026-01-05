/**
 * Validación de autenticación para el endpoint de proyección.
 */

import type { AppLocals } from '../../app.d';

/**
 * Resultado de una validación.
 */
export interface ValidacionResult {
	valido: boolean;
	error?: string;
}

/**
 * Verificar que el usuario está autenticado.
 * @returns userId si está autenticado, null si no lo está
 */
export function verificarAutenticacion(locals: AppLocals): number | null {
	if (!locals.user) {
		return null;
	}
	return locals.user.userId;
}
