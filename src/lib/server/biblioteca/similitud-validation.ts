/**
 * Módulo de validación para el servicio de similitud.
 */

import type { DatosUsuario } from './similitud-tipos';

const TALLA_MIN = 20;
const TALLA_MAX = 120;

export function esDiaValido(dia: number): boolean {
	return Number.isFinite(dia) && dia >= 0;
}

export function esTallaValida(talla: number): boolean {
	return Number.isFinite(talla) && talla >= TALLA_MIN && talla <= TALLA_MAX;
}

export function verificarOrdenDias(dias: number[]): boolean {
	return dias.every((dia, i) => i === 0 || dia > dias[i - 1]);
}

/**
 * Validar datos de entrada del usuario.
 */
export function validarDatosUsuario(datos: DatosUsuario): string | null {
	const { dias, tallas } = datos;

	if (dias.length !== tallas.length) return 'Los días y tallas deben tener la misma longitud';
	if (dias.length < 3) return 'Se requieren al menos 3 puntos de datos';

	const indexDiaInvalido = dias.findIndex((d) => !esDiaValido(d));
	if (indexDiaInvalido !== -1) return `Día inválido en posición ${indexDiaInvalido}: ${dias[indexDiaInvalido]}`;

	const indexTallaInvalida = tallas.findIndex((t) => !esTallaValida(t));
	if (indexTallaInvalida !== -1) {
		return `Talla inválida en posición ${indexTallaInvalida}: ${tallas[indexTallaInvalida]}. Debe estar entre ${TALLA_MIN} y ${TALLA_MAX}`;
	}

	if (!verificarOrdenDias(dias)) return 'Los días deben estar en orden ascendente y sin duplicados';

	return null;
}
