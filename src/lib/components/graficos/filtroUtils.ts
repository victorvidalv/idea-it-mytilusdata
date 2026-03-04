// Utilidades de filtrado para el dashboard de gráficos

import type { Centro, Ciclo, Registro, TipoRegistro, FiltrosState } from './types';

// Colores para las series del gráfico (hasta 10)
export const SERIES_COLORS = [
	'oklch(0.55 0.18 200)', // ocean-light
	'oklch(0.72 0.15 185)', // teal-glow
	'oklch(0.65 0.17 170)', // chart-2
	'oklch(0.7 0.18 140)', // chart-3
	'oklch(0.6 0.22 280)', // chart-4
	'oklch(0.65 0.22 30)', // chart-5
	'oklch(0.55 0.15 300)',
	'oklch(0.60 0.20 60)',
	'oklch(0.50 0.18 120)',
	'oklch(0.70 0.12 250)'
];

/**
 * Crea un mapa estable de tipo.id → color
 */
export function buildTipoColorMap(tipos: TipoRegistro[]): Map<number, string> {
	return new Map(tipos.map((t, i) => [t.id, SERIES_COLORS[i % SERIES_COLORS.length]]));
}

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