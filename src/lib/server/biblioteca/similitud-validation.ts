/**
 * Módulo de validación para el servicio de similitud.
 */

import type { DatosUsuario } from './similitud-tipos';

const TALLA_MIN_COMPUTABLE = 0;
const TALLA_MAX_COMPUTABLE = 200;
const MIN_PUNTOS_PROYECCION = 5;

export function esDiaValido(dia: number): boolean {
	return Number.isFinite(dia) && dia >= 0;
}

export function esTallaValida(talla: number): boolean {
	return Number.isFinite(talla) && talla > TALLA_MIN_COMPUTABLE && talla <= TALLA_MAX_COMPUTABLE;
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
	if (dias.length < MIN_PUNTOS_PROYECCION) {
		return `Se requieren al menos ${MIN_PUNTOS_PROYECCION} mediciones para ejecutar una proyección estable`;
	}

	const indexDiaInvalido = dias.findIndex((d) => !esDiaValido(d));
	if (indexDiaInvalido !== -1)
		return `Día inválido en posición ${indexDiaInvalido}: ${dias[indexDiaInvalido]}`;

	const indexTallaInvalida = tallas.findIndex((t) => !esTallaValida(t));
	if (indexTallaInvalida !== -1) {
		return `Talla inválida en posición ${indexTallaInvalida}: ${tallas[indexTallaInvalida]}. Debe ser mayor a ${TALLA_MIN_COMPUTABLE} y menor o igual a ${TALLA_MAX_COMPUTABLE}`;
	}

	if (!verificarOrdenDias(dias)) return 'Los días deben estar en orden ascendente y sin duplicados';

	return null;
}
