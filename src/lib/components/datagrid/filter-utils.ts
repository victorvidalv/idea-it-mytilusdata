/**
 * Utilidades de filtrado para DataGrid.
 * Funciones puras para facilitar testing y reutilización.
 */
import type { RowData, ColumnConfig } from './datagrid-types';

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