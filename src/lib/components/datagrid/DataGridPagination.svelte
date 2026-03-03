<script lang="ts">
	/**
	 * DataGridPagination: Controles de paginación y contador de resultados.
	 */
	export let currentPage: number = 1;
	export let totalPages: number = 1;
	export let startIndex: number = 0;
	export let endIndex: number = 0;
	export let filteredCount: number = 0;
	export let totalCount: number = 0;

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
</script>

{#if totalCount > 0}
	<div
		class="flex flex-col items-center justify-between gap-2 rounded-b-xl border-t border-border/30 bg-secondary/10 px-5 py-3 sm:flex-row"
	>
		<p class="font-body text-[11px] text-muted-foreground">
			{#if filteredCount === 0}
				0 resultados
			{:else}
				{startIndex}–{endIndex} de {filteredCount}
				{#if filteredCount !== totalCount}
					<span class="opacity-60">(filtro: {totalCount} total)</span>
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