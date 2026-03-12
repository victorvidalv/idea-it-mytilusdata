<script lang="ts">
	/**
	 * SvarDataGrid: Tabla de datos con búsqueda, paginación, ordenamiento y edición.
	 * Modos: 'table' (tabla nativa con slots) | 'grid' (wx-svelte-grid con edición por celda)
	 */
	import { Grid, Willow } from 'wx-svelte-grid';
	import type { IApi } from 'wx-svelte-grid';
	import {
		DataGridEmptyState,
		DataGridSearchBar,
		DataGridPagination,
		DataGridTableHeader,
		filterData,
		sortData,
		toggleSort,
		convertToSvarColumns,
		initGridApi,
		type RowData,
		type EditableColumnConfig,
		type GridEditHandlers
	} from './datagrid';

	// Props públicas
	export let data: RowData[] = [];
	export let columns: EditableColumnConfig[] = [];
	export let pageSize: number = 25;
	export let searchPlaceholder: string = 'Buscar...';
	export let searchKeys: string[] = [];
	export let emptyIcon: string = 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
	export let emptyTitle: string = 'Sin datos';
	export let emptyDescription: string = '';
	export let mode: 'table' | 'grid' = 'table';
	export let onCellEdit: ((row: RowData, column: string, value: unknown) => void | Promise<void>) | null = null;
	export let onCellEditEnd: ((row: RowData, column: string, value: unknown) => void | Promise<void>) | null = null;

	// Estado interno
	let searchQuery = '';
	let sortKey = '';
	let sortDirection: 'asc' | 'desc' | '' = '';
	let currentPage = 1;
	let selectedPageSize = pageSize;
	let gridApi: IApi | null = null;

	// Resetear página al cambiar búsqueda o tamaño
	$: if (searchQuery !== undefined || selectedPageSize) currentPage = 1;

	// Filtrar y ordenar datos
	$: filteredData = filterData(data, searchQuery, searchKeys, columns);
	$: sortedData = mode === 'table' ? sortData(filteredData, sortKey, sortDirection, columns) : filteredData;
	$: dataForPagination = mode === 'table' ? sortedData : filteredData;

	// Paginación
	$: totalPages = Math.max(1, Math.ceil(dataForPagination.length / selectedPageSize));
	$: if (currentPage > totalPages) currentPage = totalPages;
	$: startIndex = dataForPagination.length > 0 ? (currentPage - 1) * selectedPageSize + 1 : 0;
	$: endIndex = Math.min(currentPage * selectedPageSize, dataForPagination.length);
	$: paginatedData = dataForPagination.slice((currentPage - 1) * selectedPageSize, currentPage * selectedPageSize);

	// Columnas para wx-svelte-grid
	$: svarColumns = convertToSvarColumns(columns);

	function handleSort(key: string): void {
		const col = columns.find((c) => c.key === key);
		const result = toggleSort(sortKey, sortDirection, key, col?.sortable ?? false);
		sortKey = result.sortKey;
		sortDirection = result.sortDirection;
		currentPage = 1;
	}

	function initGrid(api: IApi): void {
		gridApi = api;
		initGridApi(api, data, { onCellEdit, onCellEditEnd });
	}

	function handleCellAction(ev: { action?: string; data?: Record<string, unknown> }): void {
		// El cambio se propaga automáticamente al data
	}
</script>

<div class="svar-datagrid-wrapper">
	<DataGridSearchBar bind:searchQuery bind:selectedPageSize {searchPlaceholder} />

	{#if mode === 'table'}
		<div class="overflow-x-auto">
			<table class="w-full font-body text-sm">
				<DataGridTableHeader {columns} {sortKey} {sortDirection} onsort={(e) => handleSort(e.detail)} />
				<tbody class="divide-y divide-border/20">
					{#if paginatedData.length === 0}
						<tr>
							<td colspan={columns.length} class="py-12">
								<DataGridEmptyState {searchQuery} {emptyIcon} {emptyTitle} {emptyDescription} />
							</td>
						</tr>
					{:else}
						<slot items={paginatedData} />
					{/if}
				</tbody>
			</table>
		</div>
	{:else}
		<div class="svar-grid-container overflow-hidden rounded-b-xl border border-border/50">
			{#if paginatedData.length === 0}
				<DataGridEmptyState {searchQuery} {emptyIcon} {emptyTitle} {emptyDescription} />
			{:else}
				<Willow>
					<Grid
						data={paginatedData}
						columns={svarColumns}
						header={true}
						footer={false}
						init={initGrid}
						onaction={handleCellAction}
						sizes={{ rowHeight: 44, headerHeight: 40, columnWidth: 150 }}
					/>
				</Willow>
			{/if}
		</div>
	{/if}

	<DataGridPagination
		{currentPage}
		{totalPages}
		{startIndex}
		{endIndex}
		filteredCount={dataForPagination.length}
		totalCount={data.length}
	/>
</div>

<style>
	.svar-datagrid-wrapper { display: flex; flex-direction: column; }
	.svar-grid-container { min-height: 200px; }
	:global(.svar-grid-container .wx-grid) { font-family: inherit !important; border: none !important; }
	:global(.svar-grid-container .wx-grid-header) { background-color: rgb(248 250 252 / 0.5) !important; border-bottom: 1px solid rgb(229 231 235 / 0.4) !important; }
	:global(.svar-grid-container .wx-grid-cell) { border-bottom: 1px solid rgb(229 231 235 / 0.2) !important; padding: 0.75rem 1.25rem !important; font-size: 0.875rem !important; }
	:global(.svar-grid-container .wx-grid-header-cell) { font-size: 0.75rem !important; font-weight: 500 !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; color: rgb(107 114 128) !important; padding: 0.75rem 1.25rem !important; }
	:global(.svar-grid-container .wx-grid-row:hover .wx-grid-cell) { background-color: rgb(248 250 252 / 0.5) !important; }
	:global(.svar-grid-container .wx-grid-cell-editor) { border: 1px solid rgb(59 130 246) !important; border-radius: 0.375rem !important; }
</style>