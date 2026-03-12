/**
 * Utilidades de ordenamiento para DataGrid.
 * Gestión de estado de ordenamiento y aplicación de orden.
 */
import type { RowData, ColumnConfig, SortState } from './datagrid-types';
import { compareValues } from './sort-comparator';

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