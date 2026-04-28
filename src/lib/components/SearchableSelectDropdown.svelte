<script lang="ts">
	/** Dropdown del SearchableSelect con búsqueda y lista de opciones */
	import SearchableSelectOption from './SearchableSelectOption.svelte';

	interface Props {
		options: { value: string | number; label: string }[];
		currentValue: string | number | null | undefined;
		onSelect: (value: string | number) => void;
	}

	let { options, currentValue, onSelect }: Props = $props();
	let searchQuery = $state('');

	const filteredOptions = $derived(
		options.filter((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
	);
</script>

<div class="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border/60 bg-background/95 shadow-xl backdrop-blur-md">
	<div class="border-b border-border/40 bg-secondary/20 p-2">
		<div class="relative">
			<svg class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
			</svg>
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Buscar..."
				class="h-9 w-full rounded-md border border-border/50 bg-background pr-3 pl-9 font-body text-sm transition-colors placeholder:text-muted-foreground/50 focus:border-ocean-light focus:ring-1 focus:ring-ocean-light focus:outline-none"
			/>
		</div>
	</div>
	<ul class="custom-scrollbar max-h-56 space-y-0.5 overflow-auto p-1">
		{#if filteredOptions.length === 0}
			<li class="px-3 py-4 text-center font-body text-sm text-muted-foreground">No hay resultados</li>
		{:else}
			{#each filteredOptions as opt (opt.value)}
				<li>
					<SearchableSelectOption option={opt} currentValue={currentValue} onSelect={onSelect} />
				</li>
			{/each}
		{/if}
	</ul>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar { width: 4px; }
	.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
	.custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border) / 0.5); border-radius: 4px; }
	.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--border)); }
</style>