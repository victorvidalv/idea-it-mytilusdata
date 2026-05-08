/**
 * Módulo de validación para el servicio de similitud.
 * Funciones auxiliares para validar datos de entrada del usuario.
 */

import type { DatosUsuario } from './similitud';

// Límites biológicos
const TALLA_MIN = 20;
const TALLA_MAX = 120;

/**
 * Validar día individual.
 */
export function esDiaValido(dia: number): boolean {
	return Number.isFinite(dia) && dia >= 0;
}

/**
 * Validar talla individual.
 */
export function esTallaValida(talla: number): boolean {
	return Number.isFinite(talla) && talla >= TALLA_MIN && talla <= TALLA_MAX;
}

/**
 * Verificar que los días estén en orden ascendente sin duplicados.
 */
export function verificarOrdenDias(dias: number[]): boolean {
	for (let i = 1; i < dias.length; i++) {
		if (dias[i] <= dias[i - 1]) {
			return false;
		}
	}
	return true;
}

/**
 * Validar datos de entrada del usuario.
 * Verifica que los datos sean numéricos y estén en rango válido.
 */
export function validarDatosUsuario(datos: DatosUsuario): string | null {
	const { dias, tallas } = datos;

	if (dias.length !== tallas.length) {
		return 'Los días y tallas deben tener la misma longitud';
	}

	if (dias.length < 3) {
		return 'Se requieren al menos 3 puntos de datos';
	}

	// Validar cada día y talla
	for (let i = 0; i < dias.length; i++) {
		if (!esDiaValido(dias[i])) {
			return `Día inválido en posición ${i}: ${dias[i]}`;
		}
		if (!esTallaValida(tallas[i])) {
			return `Talla inválida en posición ${i}: ${tallas[i]}. Debe estar entre ${TALLA_MIN} y ${TALLA_MAX}`;
		}
	}

	// Verificar que los días están en orden ascendente
	if (!verificarOrdenDias(dias)) {
		return 'Los días deben estar en orden ascendente y sin duplicados';
	}

	return null;
}
