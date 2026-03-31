// Filtrado de registros

import type { Registro, FiltrosState } from './types';

/**
 * Verifica si un registro pasa los filtros espaciales/técnicos (centro, ciclo, tipo)
 */
function pasaFiltrosEspaciales(
	r: Registro,
	selectedCentroId: number,
	selectedCicloId: number,
	selectedTipoIds: Set<number>
): boolean {
	if (selectedCentroId && r.lugarId !== selectedCentroId) return false;
	if (selectedCicloId && r.cicloId !== selectedCicloId) return false;
	if (!selectedTipoIds.has(r.tipoId)) return false;
	return true;
}

/**
 * Verifica si un registro pasa el filtro de usuario
 */
function pasaFiltroUsuario(
	userId: number | undefined,
	selectedUserId: string
): boolean {
	// Sin userId en registro: no filtrar por usuario
	if (userId === undefined) return true;
	// Sin selección: rechazar
	if (selectedUserId === '') return false;
	// "Todos": aceptar
	if (selectedUserId === 'all') return true;
	// Usuario específico: comparar
	return userId === Number(selectedUserId);
}

/**
 * Filtra registros según todos los criterios activos
 */
export function filterRegistros(
	registros: Registro[],
	filtros: FiltrosState
): Registro[] {
	const { selectedUserId, selectedCentroId, selectedCicloId, selectedTipoIds } = filtros;

	return registros.filter((r) =>
		pasaFiltroUsuario(r.userId, selectedUserId) &&
		pasaFiltrosEspaciales(r, selectedCentroId, selectedCicloId, selectedTipoIds)
	);
}