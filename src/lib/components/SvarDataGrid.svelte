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

	const pageSizeOptions = [10, 25, 50, 100];

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

	// Páginas visibles para navegación
	$: visiblePages = (() => {
		const pages: number[] = [];
		const maxVisible = 5;
		let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
		let end = Math.min(totalPages, start + maxVisible - 1);
		if (end - start < maxVisible - 1) {
			start = Math.max(1, end - maxVisible + 1);
		}
		for (let i = start; i <= end; i++) pages.push(i);
		return pages;
	})();

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
	<div
		class="flex flex-col justify-between gap-3 rounded-t-xl border-b border-border/40 bg-secondary/10 px-5 py-3 sm:flex-row sm:items-center"
	>
		<!-- Búsqueda -->
		<div class="relative max-w-sm flex-1">
			<svg
				class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/50"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder={searchPlaceholder}
				class="h-9 w-full rounded-lg border border-border/60 bg-background pr-3 pl-9 font-body text-sm transition-all placeholder:text-muted-foreground/50 focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => {
						searchQuery = '';
					}}
					class="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-foreground"
					aria-label="Limpiar búsqueda"
				>
					<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			{/if}
		</div>

		<!-- Filas por página -->
		<div class="flex items-center gap-2 font-body text-xs text-muted-foreground">
			<span>Filas:</span>
			<select
				bind:value={selectedPageSize}
				class="h-8 cursor-pointer rounded-md border border-border/60 bg-background px-2 font-body text-xs transition-all focus:border-ocean-light focus:outline-none"
			>
				{#each pageSizeOptions as size (size)}
					<option value={size}>{size}</option>
				{/each}
			</select>
		</div>
	</div>

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
								<div class="flex flex-col items-center justify-center text-muted-foreground">
									<svg
										class="mb-3 h-12 w-12 text-muted-foreground/30"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="1"
											d={emptyIcon}
										/>
									</svg>
									<p class="text-sm font-medium">{searchQuery ? 'Sin resultados' : emptyTitle}</p>
									<p class="mt-1 text-xs">
										{searchQuery
											? `No se encontraron coincidencias para "${searchQuery}"`
											: emptyDescription}
									</p>
								</div>
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
				<div class="flex flex-col items-center justify-center py-12 text-muted-foreground">
					<svg
						class="mb-3 h-12 w-12 text-muted-foreground/30"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="1"
							d={emptyIcon}
						/>
					</svg>
					<p class="text-sm font-medium">{searchQuery ? 'Sin resultados' : emptyTitle}</p>
					<p class="mt-1 text-xs">
						{searchQuery
							? `No se encontraron coincidencias para "${searchQuery}"`
							: emptyDescription}
					</p>
				</div>
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
	{#if data.length > 0}
		<div
			class="flex flex-col items-center justify-between gap-2 rounded-b-xl border-t border-border/30 bg-secondary/10 px-5 py-3 sm:flex-row"
		>
			<p class="font-body text-[11px] text-muted-foreground">
				{#if dataForPagination.length === 0}
					0 resultados
				{:else}
					{startIndex}–{endIndex} de {dataForPagination.length}
					{#if dataForPagination.length !== data.length}
						<span class="opacity-60">(filtro: {data.length} total)</span>
					{/if}
				{/if}
			</p>

			{#if totalPages > 1}
				<div class="flex items-center gap-1">
					<button
						onclick={() => {
							currentPage = 1;
						}}
						disabled={currentPage === 1}
						class="flex h-7 w-7 items-center justify-center rounded-md text-xs text-muted-foreground transition-all hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
						aria-label="Primera página"
					>
						<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
							/></svg
						>
					</button>
					<button
						onclick={() => {
							currentPage = Math.max(1, currentPage - 1);
						}}
						disabled={currentPage === 1}
						class="flex h-7 w-7 items-center justify-center rounded-md text-xs text-muted-foreground transition-all hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
						aria-label="Página anterior"
					>
						<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/></svg
						>
					</button>

					{#each visiblePages as page (page)}
						<button
							onclick={() => {
								currentPage = page;
							}}
							class="flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 font-body text-xs font-medium transition-all
								{page === currentPage
								? 'bg-ocean-mid text-white shadow-sm'
								: 'text-muted-foreground hover:bg-secondary'}"
						>
							{page}
						</button>
					{/each}

					<button
						onclick={() => {
							currentPage = Math.min(totalPages, currentPage + 1);
						}}
						disabled={currentPage === totalPages}
						class="flex h-7 w-7 items-center justify-center rounded-md text-xs text-muted-foreground transition-all hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
						aria-label="Página siguiente"
					>
						<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/></svg
						>
					</button>
					<button
						onclick={() => {
							currentPage = totalPages;
						}}
						disabled={currentPage === totalPages}
						class="flex h-7 w-7 items-center justify-center rounded-md text-xs text-muted-foreground transition-all hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
						aria-label="Última página"
					>
						<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M13 5l7 7-7 7M5 5l7 7-7 7"
							/></svg
						>
					</button>
				</div>
			{/if}
		</div>
	{/if}
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