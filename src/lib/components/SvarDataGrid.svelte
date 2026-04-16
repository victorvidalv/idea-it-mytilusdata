<script lang="ts">
	/**
	 * SvarDataGrid: Tabla de datos con búsqueda, paginación, ordenamiento y edición.
	 * Modos: 'table' (tabla nativa con slots) | 'grid' (wx-svelte-grid con edición por celda)
	 */
	import {
		DataGridSearchBar,
		DataGridPagination,
		DataGridTableView,
		DataGridGridView,
		filterData,
		sortData,
		toggleSort,
		type RowData,
		type EditableColumnConfig
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

	function handleSort(key: string): void {
		const col = columns.find((c) => c.key === key);
		const result = toggleSort(sortKey, sortDirection, key, col?.sortable ?? false);
		sortKey = result.sortKey;
		sortDirection = result.sortDirection;
		currentPage = 1;
	}
</script>

<div class="svar-datagrid-wrapper">
	<DataGridSearchBar bind:searchQuery bind:selectedPageSize {searchPlaceholder} />

	{#if mode === 'table'}
		<DataGridTableView
			{columns}
			{paginatedData}
			{sortKey}
			{sortDirection}
			{searchQuery}
			{emptyIcon}
			{emptyTitle}
			{emptyDescription}
			onsort={handleSort}
		>
			<slot items={paginatedData} />
		</DataGridTableView>
	{:else}
		<DataGridGridView
			{paginatedData}
			{columns}
			{data}
			{searchQuery}
			{emptyIcon}
			{emptyTitle}
			{emptyDescription}
			{onCellEdit}
			{onCellEditEnd}
		/>
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
	.svar-datagrid-wrapper {
		display: flex;
		flex-direction: column;
	}
</style>