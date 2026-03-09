// Validación de selecciones de filtros

import type { Centro, Ciclo } from './types';

/**
 * Verifica si un centro es válido dentro de los centros filtrados
 */
export function isCentroValido(centrosFiltrados: Centro[], centroId: number): boolean {
	if (!centroId) return false;
	return centrosFiltrados.some((c) => c.id === centroId);
}

/**
 * Verifica si un ciclo es válido dentro de los ciclos filtrados
 */
export function isCicloValido(ciclosFiltrados: Ciclo[], cicloId: number): boolean {
	if (!cicloId) return false;
	return ciclosFiltrados.some((c) => c.id === cicloId);
}