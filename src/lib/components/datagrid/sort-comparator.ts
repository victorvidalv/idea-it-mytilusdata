/**
 * Utilidades de comparación de valores para ordenamiento.
 * Funciones puras para facilitar testing y reutilización.
 */

/**
 * Calcula el modificador de dirección para ordenamiento.
 */
function getDirectionModifier(direction: 'asc' | 'desc'): number {
	return direction === 'desc' ? -1 : 1;
}

/**
 * Maneja casos donde uno o ambos valores son nulos.
 * Retorna null si no aplica, o el resultado de comparación si aplica.
 */
function handleNullValues(
	valA: unknown,
	valB: unknown,
	direction: 'asc' | 'desc'
): number | null {
	if (valA == null && valB == null) return 0;
	if (valA == null) return getDirectionModifier(direction);
	if (valB == null) return -getDirectionModifier(direction);
	return null;
}

/**
 * Compara dos valores para ordenamiento.
 * Maneja nulos, números y strings con localeCompare.
 */
export function compareValues(
	valA: unknown,
	valB: unknown,
	direction: 'asc' | 'desc'
): number {
	const nullResult = handleNullValues(valA, valB, direction);
	if (nullResult !== null) return nullResult;

	let comparison: number;
	if (typeof valA === 'number' && typeof valB === 'number') {
		comparison = valA - valB;
	} else {
		comparison = String(valA).localeCompare(String(valB), 'es-CL', { numeric: true });
	}

	return getDirectionModifier(direction) * comparison;
}