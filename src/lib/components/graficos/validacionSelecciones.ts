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

/**
 * Resultado de la validación de selecciones
 */
export interface ResultadoValidacion {
	resetCentro: boolean;
	resetCiclo: boolean;
}

/**
 * Valida las selecciones actuales contra las listas filtradas
 * y determina si deben resetearse
 */
export function validarSelecciones(
	centrosFiltrados: Centro[],
	ciclosFiltrados: Ciclo[],
	selectedUserId: string,
	selectedCentroId: number,
	selectedCicloId: number
): ResultadoValidacion {
	// Si no hay usuario seleccionado, no hay nada que validar
	if (!selectedUserId) {
		return { resetCentro: false, resetCiclo: false };
	}

	// Verificar si el centro seleccionado sigue siendo válido
	const centroInvalido = selectedCentroId && !isCentroValido(centrosFiltrados, selectedCentroId);
	if (centroInvalido) {
		return { resetCentro: true, resetCiclo: true };
	}

	// Verificar si el ciclo seleccionado sigue siendo válido
	const cicloInvalido = selectedCentroId && !isCicloValido(ciclosFiltrados, selectedCicloId);
	if (cicloInvalido) {
		return { resetCentro: false, resetCiclo: true };
	}

	return { resetCentro: false, resetCiclo: false };
}