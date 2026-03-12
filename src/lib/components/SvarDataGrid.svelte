<script lang="ts">
	/**
	 * SvarDataGrid: Componente de tabla de datos con búsqueda, paginación, ordenamiento y edición.
	 *
	 * Modos de operación:
	 * - mode="table": Usa <table> nativa con slots para filas personalizadas (default)
	 * - mode="grid": Usa wx-svelte-grid para datos simples con edición por celda
	 */
	import { Grid, Willow } from 'wx-svelte-grid';
	import type { IColumnConfig, IApi, IRow } from 'wx-svelte-grid';
	import DataGridEmptyState from './datagrid/DataGridEmptyState.svelte';
	import DataGridSearchBar from './datagrid/DataGridSearchBar.svelte';
	import DataGridPagination from './datagrid/DataGridPagination.svelte';

	// Tipo para filas de datos - usar any para máxima flexibilidad
	type RowData = any;

	export let data: RowData[] = [];
	export let columns: {
		key: string;
		label: string;
		sortable?: boolean;
		align?: 'left' | 'center' | 'right';
		accessor?: (row: RowData) => unknown;
		editable?: boolean;
		editorType?: 'text' | 'combo' | 'datepicker' | 'richselect';
		editorOptions?: { id: string | number; label: string }[];
		template?: (value: unknown, row: RowData, col: { key: string }) => string;
	}[] = [];
	export let pageSize: number = 25;
	export let searchPlaceholder: string = 'Buscar...';
	export let searchKeys: string[] = [];
	export let emptyIcon: string =
		'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
	export let emptyTitle: string = 'Sin datos';
	export let emptyDescription: string = '';

	// Modo de operación: 'table' para slots personalizados, 'grid' para wx-svelte-grid
	export let mode: 'table' | 'grid' = 'table';

	// Callbacks para edición (modo grid)
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
	$: if (searchQuery !== undefined || selectedPageSize) {
		currentPage = 1;
	}

	// Filtrar datos por búsqueda
	$: filteredData = searchQuery.trim()
		? data.filter((row: RowData) => {
				const q = searchQuery.toLowerCase();
				const keys = searchKeys.length > 0 ? searchKeys : columns.map((c) => c.key);
				return keys.some((key) => {
					const col = columns.find((c) => c.key === key);
					const val = col?.accessor ? col.accessor(row) : row[key];
					return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
				});
			})
		: [...data];

	// Ordenar datos (solo modo table - el grid maneja su propio ordenamiento)
	$: sortedData =
		mode === 'table' && sortKey && sortDirection
			? [...filteredData].sort((a: RowData, b: RowData) => {
					const col = columns.find((c) => c.key === sortKey);
					const valA = col?.accessor ? col.accessor(a) : a[sortKey];
					const valB = col?.accessor ? col.accessor(b) : b[sortKey];

					if (valA == null && valB == null) return 0;
					if (valA == null) return 1;
					if (valB == null) return -1;

					let comparison = 0;
					if (typeof valA === 'number' && typeof valB === 'number') {
						comparison = valA - valB;
					} else {
						comparison = String(valA).localeCompare(String(valB), 'es-CL', { numeric: true });
					}
					return sortDirection === 'desc' ? -comparison : comparison;
				})
			: filteredData;

	// Datos para paginación (usar sortedData en modo table, filteredData en modo grid)
	$: dataForPagination = mode === 'table' ? sortedData : filteredData;

	// Paginación
	$: totalPages = Math.max(1, Math.ceil(dataForPagination.length / selectedPageSize));
	$: if (currentPage > totalPages) currentPage = totalPages;
	$: startIndex = dataForPagination.length > 0 ? (currentPage - 1) * selectedPageSize + 1 : 0;
	$: endIndex = Math.min(currentPage * selectedPageSize, dataForPagination.length);
	$: paginatedData = dataForPagination.slice(
		(currentPage - 1) * selectedPageSize,
		currentPage * selectedPageSize
	);

	// Alternar ordenamiento (modo table)
	function toggleSort(key: string) {
		const col = columns.find((c) => c.key === key);
		if (!col?.sortable) return;

		if (sortKey !== key) {
			sortKey = key;
			sortDirection = 'asc';
		} else if (sortDirection === 'asc') {
			sortDirection = 'desc';
		} else {
			sortKey = '';
			sortDirection = '';
		}
		currentPage = 1;
	}

	// Convertir columnas al formato de Svar Grid (modo grid)
	$: svarColumns = columns.map((col): IColumnConfig => {
		const result: IColumnConfig = {
			id: col.key,
			header: col.label,
			sort: col.sortable ?? false,
			width: 150,
			flexgrow: 1,
		};

		// Alineación
		if (col.align === 'center') {
			result.css = 'text-center';
		} else if (col.align === 'right') {
			result.css = 'text-right';
		}

		// Template personalizado
		if (col.template) {
			result.template = (value: unknown, row: IRow, _col: unknown) => {
				return col.template!(value, row as RowData, col);
			};
		}

		// Editor para celdas editables
		if (col.editable) {
			if (col.editorType === 'combo' && col.editorOptions) {
				result.editor = {
					type: 'combo',
					config: {
						options: col.editorOptions
					}
				};
			} else if (col.editorType === 'richselect' && col.editorOptions) {
				result.editor = {
					type: 'richselect',
					config: {
						options: col.editorOptions
					}
				};
			} else if (col.editorType === 'datepicker') {
				result.editor = {
					type: 'datepicker'
				};
			} else {
				result.editor = 'text';
			}
		}

		return result;
	});

	// Inicializar API del grid (modo grid)
	function initGrid(api: IApi) {
		gridApi = api;

		// Escuchar eventos de edición
		api.on('after-edit', (ev: { row: IRow; column: { id: string }; value: unknown }) => {
			if (onCellEdit) {
				const originalRow = data.find(r => r.id === ev.row.id) as RowData;
				if (originalRow) {
					onCellEdit(originalRow, ev.column.id, ev.value);
				}
			}
		});

		api.on('after-edit-end', (ev: { row: IRow; column: { id: string }; value: unknown }) => {
			if (onCellEditEnd) {
				const originalRow = data.find(r => r.id === ev.row.id) as RowData;
				if (originalRow) {
					onCellEditEnd(originalRow, ev.column.id, ev.value);
				}
			}
		});
	}

	// Manejar cambios en celdas editables (modo grid)
	function handleCellAction(ev: { action?: string; data?: Record<string, unknown> }) {
		if (ev.action === 'save' && ev.data) {
			// El cambio se propaga automáticamente al data
		}
	}
</script>

<div class="svar-datagrid-wrapper">
	<!-- Barra de controles: búsqueda + filas por página -->
	<DataGridSearchBar
		bind:searchQuery
		bind:selectedPageSize
		{searchPlaceholder}
	/>

	{#if mode === 'table'}
		<!-- Modo Table: Tabla nativa con slots -->
		<div class="overflow-x-auto">
			<table class="w-full font-body text-sm">
				<thead>
					<tr class="border-b border-border/40 bg-secondary/30">
						{#each columns as col (col.key)}
							<th
								class="px-5 py-3 text-xs font-medium tracking-wider whitespace-nowrap text-muted-foreground uppercase
									{col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'}
									{col.sortable ? 'group cursor-pointer transition-colors select-none hover:text-foreground' : ''}"
								onclick={() => col.sortable && toggleSort(col.key)}
							>
								<span class="inline-flex items-center gap-1">
									{col.label}
									{#if col.sortable}
										<span
											class="inline-flex flex-col -space-y-0.5 opacity-40 transition-opacity group-hover:opacity-80"
										>
											{#if sortKey === col.key && sortDirection === 'asc'}
												<svg
													class="h-3 w-3 text-ocean-light opacity-100"
													fill="currentColor"
													viewBox="0 0 20 20"
													><path
														d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z"
													/></svg
												>
											{:else if sortKey === col.key && sortDirection === 'desc'}
												<svg
													class="h-3 w-3 text-ocean-light opacity-100"
													fill="currentColor"
													viewBox="0 0 20 20"
													><path
														d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z"
													/></svg
												>
											{:else}
												<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"
													><path
														d="M7 7l3-3 3 3m0 6l-3 3-3-3"
														fill="none"
														stroke="currentColor"
														stroke-width="1.5"
														stroke-linecap="round"
														stroke-linejoin="round"
													/></svg
												>
											{/if}
										</span>
									{/if}
								</span>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody class="divide-y divide-border/20">
					{#if paginatedData.length === 0}
						<tr>
							<td colspan={columns.length} class="py-12">
								<DataGridEmptyState
									{searchQuery}
									{emptyIcon}
									{emptyTitle}
									{emptyDescription}
								/>
							</td>
						</tr>
					{:else}
						<slot items={paginatedData} />
					{/if}
				</tbody>
			</table>
		</div>
	{:else}
		<!-- Modo Grid: wx-svelte-grid -->
		<div class="svar-grid-container overflow-hidden rounded-b-xl border border-border/50">
			{#if paginatedData.length === 0}
				<DataGridEmptyState
					{searchQuery}
					{emptyIcon}
					{emptyTitle}
					{emptyDescription}
				/>
			{:else}
				<Willow>
					<Grid
						data={paginatedData}
						columns={svarColumns}
						header={true}
						footer={false}
						init={initGrid}
						onaction={handleCellAction}
						sizes={{
							rowHeight: 44,
							headerHeight: 40,
							columnWidth: 150
						}}
					/>
				</Willow>
			{/if}
		</div>
	{/if}

	<!-- Pie: paginación + contador -->
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

	.svar-grid-container {
		min-height: 200px;
	}

	/* Estilos para el Grid de Svar (modo grid) */
	:global(.svar-grid-container .wx-grid) {
		font-family: inherit !important;
		border: none !important;
	}

	:global(.svar-grid-container .wx-grid-header) {
		background-color: rgb(248 250 252 / 0.5) !important;
		border-bottom: 1px solid rgb(229 231 235 / 0.4) !important;
	}

	:global(.svar-grid-container .wx-grid-cell) {
		border-bottom: 1px solid rgb(229 231 235 / 0.2) !important;
		padding: 0.75rem 1.25rem !important;
		font-size: 0.875rem !important;
	}

	:global(.svar-grid-container .wx-grid-header-cell) {
		font-size: 0.75rem !important;
		font-weight: 500 !important;
		text-transform: uppercase !important;
		letter-spacing: 0.05em !important;
		color: rgb(107 114 128) !important;
		padding: 0.75rem 1.25rem !important;
	}

	:global(.svar-grid-container .wx-grid-row:hover .wx-grid-cell) {
		background-color: rgb(248 250 252 / 0.5) !important;
	}

	:global(.svar-grid-container .wx-grid-cell-editor) {
		border: 1px solid rgb(59 130 246) !important;
		border-radius: 0.375rem !important;
	}

	.text-center {
		text-align: center;
	}

	.text-right {
		text-align: right;
	}
</style>