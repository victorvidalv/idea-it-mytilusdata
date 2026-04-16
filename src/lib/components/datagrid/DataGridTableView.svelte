<script lang="ts">
	/**
	 * DataGridTableView: Vista de tabla nativa para DataGrid.
	 * Renderiza una tabla HTML con slots para filas personalizadas.
	 */
	import { createEventDispatcher } from 'svelte';
	import { DataGridEmptyState, DataGridTableHeader } from './index';
	import type { EditableColumnConfig, RowData } from './datagrid-types';

	export let columns: EditableColumnConfig[] = [];
	export let paginatedData: RowData[] = [];
	export let sortKey: string = '';
	export let sortDirection: 'asc' | 'desc' | '' = '';
	export let searchQuery: string = '';
	export let emptyIcon: string = 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
	export let emptyTitle: string = 'Sin datos';
	export let emptyDescription: string = '';

	const dispatch = createEventDispatcher<{ sort: string }>();

	function handleSort(key: string): void {
		dispatch('sort', key);
	}
</script>

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