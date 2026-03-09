// Filtrado de entidades (centros y ciclos)

import type { Centro, Ciclo } from './types';

/**
 * Filtra centros por usuario seleccionado
 */
export function filterCentrosByUser(
	centros: Centro[],
	selectedUserId: string
): Centro[] {
	if (selectedUserId === '') return [];
	if (selectedUserId === 'all') return centros;
	return centros.filter((c) => c.userId === Number(selectedUserId));
}

/**
 * Filtra ciclos por centro seleccionado
 */
export function filterCiclosByCentro(ciclos: Ciclo[], selectedCentroId: number): Ciclo[] {
	if (!selectedCentroId) return ciclos;
	return ciclos.filter((c) => c.lugarId === selectedCentroId);
}