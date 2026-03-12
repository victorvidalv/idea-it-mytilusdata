<script lang="ts">
	/**
	 * DataGridEmptyState: Componente para mostrar estado vacío en DataGrid.
	 * Se usa cuando no hay datos o la búsqueda no retorna resultados.
	 */
	export let searchQuery: string = '';
	export let emptyIcon: string =
		'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
	export let emptyTitle: string = 'Sin datos';
	export let emptyDescription: string = '';
</script>

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