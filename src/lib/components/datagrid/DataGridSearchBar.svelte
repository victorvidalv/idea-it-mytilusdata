<script lang="ts">
	/**
	 * DataGridSearchBar: Barra de búsqueda y selector de filas por página.
	 */
	export let searchQuery: string = '';
	export let searchPlaceholder: string = 'Buscar...';
	export let selectedPageSize: number = 25;

	const pageSizeOptions = [10, 25, 50, 100];
</script>

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