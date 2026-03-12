/**
 * Utilidades para filtrado y ordenamiento de datos en DataGrid.
 * Funciones puras para facilitar testing y reutilización.
 */

// Tipo para filas de datos - usar any para máxima flexibilidad
export type RowData = Record<string, unknown>;

/** Configuración de columna para operaciones de datos */
export interface ColumnConfig {
	key: string;
	label: string;
	sortable?: boolean;
	align?: 'left' | 'center' | 'right';
	accessor?: (row: RowData) => unknown;
}

/**
 * Filtra datos según query de búsqueda.
 * Busca en las claves especificadas o en todas las columnas.
 */
export function filterData(
	data: RowData[],
	searchQuery: string,
	searchKeys: string[],
	columns: ColumnConfig[]
): RowData[] {
	if (!searchQuery.trim()) {
		return [...data];
	}

	const q = searchQuery.toLowerCase();
	const keys = searchKeys.length > 0 ? searchKeys : columns.map((c) => c.key);

	return data.filter((row) => {
		return keys.some((key) => {
			const col = columns.find((c) => c.key === key);
			const val = col?.accessor ? col.accessor(row) : row[key];
			return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
		});
	});
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
	if (valA == null && valB == null) return 0;
	if (valA == null) return direction === 'asc' ? 1 : -1;
	if (valB == null) return direction === 'asc' ? -1 : 1;

	let comparison = 0;
	if (typeof valA === 'number' && typeof valB === 'number') {
		comparison = valA - valB;
	} else {
		comparison = String(valA).localeCompare(String(valB), 'es-CL', { numeric: true });
	}

	return direction === 'desc' ? -comparison : comparison;
}

/**
 * Ordena datos según clave y dirección.
 */
export function sortData(
	data: RowData[],
	sortKey: string,
	sortDirection: 'asc' | 'desc' | '',
	columns: ColumnConfig[]
): RowData[] {
	if (!sortKey || !sortDirection) {
		return data;
	}

	return [...data].sort((a, b) => {
		const col = columns.find((c) => c.key === sortKey);
		const valA = col?.accessor ? col.accessor(a) : a[sortKey];
		const valB = col?.accessor ? col.accessor(b) : b[sortKey];
		return compareValues(valA, valB, sortDirection);
	});
}

/**
 * Estado de ordenamiento para toggle de columna.
 */
export interface SortState {
	sortKey: string;
	sortDirection: 'asc' | 'desc' | '';
}

/**
 * Calcula el nuevo estado de ordenamiento al hacer clic en una columna.
 * Cicla: sin orden → asc → desc → sin orden.
 */
export function toggleSort(
	currentKey: string,
	currentDirection: 'asc' | 'desc' | '',
	clickedKey: string,
	isSortable: boolean
): SortState {
	if (!isSortable) {
		return { sortKey: currentKey, sortDirection: currentDirection };
	}

	if (currentKey !== clickedKey) {
		return { sortKey: clickedKey, sortDirection: 'asc' };
	}

	if (currentDirection === 'asc') {
		return { sortKey: clickedKey, sortDirection: 'desc' };
	}

	return { sortKey: '', sortDirection: '' };
}