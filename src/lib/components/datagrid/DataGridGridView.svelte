<script lang="ts">
	/**
	 * DataGridGridView: Vista de grid editable para DataGrid.
	 * Renderiza wx-svelte-grid con edición por celda.
	 */
	import { Grid, Willow } from 'wx-svelte-grid';
	import type { IApi } from 'wx-svelte-grid';
	import { DataGridEmptyState, convertToSvarColumns, initGridApi } from './index';
	import type { EditableColumnConfig, RowData, GridEditHandlers } from './datagrid-types';

	export let paginatedData: RowData[] = [];
	export let columns: EditableColumnConfig[] = [];
	export let data: RowData[] = [];
	export let searchQuery: string = '';
	export let emptyIcon: string = 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
	export let emptyTitle: string = 'Sin datos';
	export let emptyDescription: string = '';
	export let onCellEdit: ((row: RowData, column: string, value: unknown) => void | Promise<void>) | null = null;
	export let onCellEditEnd: ((row: RowData, column: string, value: unknown) => void | Promise<void>) | null = null;

	$: svarColumns = convertToSvarColumns(columns);

	function initGrid(api: IApi): void {
		initGridApi(api, data, { onCellEdit, onCellEditEnd });
	}

	function handleCellAction(ev: { action?: string; data?: Record<string, unknown> }): void {
		// El cambio se propaga automáticamente al data
	}
</script>

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

<style>
	.svar-grid-container {
		min-height: 200px;
	}
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
</style>