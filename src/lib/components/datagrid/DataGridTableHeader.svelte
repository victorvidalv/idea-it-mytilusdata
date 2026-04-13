<script lang="ts">
	/**
	 * Encabezado de tabla con soporte para ordenamiento.
	 */
	import { createEventDispatcher } from 'svelte';
	import type { ColumnConfig } from './datagrid-utils';

	export let columns: ColumnConfig[];
	export let sortKey: string;
	export let sortDirection: 'asc' | 'desc' | '';

	const dispatch = createEventDispatcher<{ sort: string }>();

	function getHeaderClasses(col: ColumnConfig): string {
		const base = 'px-5 py-3 text-xs font-medium tracking-wider whitespace-nowrap text-muted-foreground uppercase';
		const align = col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left';
		const sortable = col.sortable ? 'group cursor-pointer transition-colors select-none hover:text-foreground' : '';
		return `${base} ${align} ${sortable}`.trim();
	}

	function handleClick(col: ColumnConfig): void {
		if (col.sortable) {
			dispatch('sort', col.key);
		}
	}
</script>

<thead>
	<tr class="border-b border-border/40 bg-secondary/30">
		{#each columns as col (col.key)}
			<th
				class={getHeaderClasses(col)}
				onclick={() => handleClick(col)}
			>
				<span class="inline-flex items-center gap-1">
					{col.label}
					{#if col.sortable}
						<span class="inline-flex flex-col -space-y-0.5 opacity-40 transition-opacity group-hover:opacity-80">
							{#if sortKey === col.key && sortDirection === 'asc'}
								<svg class="h-3 w-3 text-ocean-light opacity-100" fill="currentColor" viewBox="0 0 20 20">
									<path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" />
								</svg>
							{:else if sortKey === col.key && sortDirection === 'desc'}
								<svg class="h-3 w-3 text-ocean-light opacity-100" fill="currentColor" viewBox="0 0 20 20">
									<path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" />
								</svg>
							{:else}
								<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
									<path d="M7 7l3-3 3 3m0 6l-3 3-3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
								</svg>
							{/if}
						</span>
					{/if}
				</span>
			</th>
		{/each}
	</tr>
</thead>