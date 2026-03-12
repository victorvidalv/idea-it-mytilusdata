// Re-export subcomponentes de DataGrid
export { default as DataGridEmptyState } from './DataGridEmptyState.svelte';
export { default as DataGridSearchBar } from './DataGridSearchBar.svelte';
export { default as DataGridPagination } from './DataGridPagination.svelte';
export { default as DataGridTableHeader } from './DataGridTableHeader.svelte';

// Tipos compartidos
export { type RowData, type ColumnConfig, type SortState } from './datagrid-types';

// Utilidades de filtrado
export { filterData } from './filter-utils';

// Utilidades de ordenamiento
export { sortData, toggleSort } from './sort-utils';
export { compareValues } from './sort-comparator';

// Utilidades de wx-svelte-grid
export { convertToSvarColumns, type EditableColumnConfig } from './svar-column-converter';
export { initGridApi, type GridEditHandlers } from './svar-grid-api';