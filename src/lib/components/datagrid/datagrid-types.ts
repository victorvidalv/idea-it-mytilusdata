/**
 * Tipos compartidos para el componente DataGrid.
 * Define las estructuras de datos usadas en filtrado, ordenamiento y visualización.
 */

/** Tipo para filas de datos - usar any para máxima flexibilidad */
export type RowData = Record<string, unknown>;

/** Configuración de columna para operaciones de datos */
export interface ColumnConfig {
	key: string;
	label: string;
	sortable?: boolean;
	align?: 'left' | 'center' | 'right';
	accessor?: (row: RowData) => unknown;
}

/** Estado de ordenamiento para toggle de columna */
export interface SortState {
	sortKey: string;
	sortDirection: 'asc' | 'desc' | '';
}