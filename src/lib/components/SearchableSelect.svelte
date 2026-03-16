<script lang="ts">
	/** Componente Select con búsqueda integrada (estilo Select2) - Svelte 5 */

	interface Props {
		value?: string | number | null;
		options?: { value: string | number; label: string }[];
		placeholder?: string;
		name?: string;
		id?: string;
		disabled?: boolean;
		required?: boolean;
		class?: string;
	}

	let {
		value = $bindable(''),
		options = [],
		placeholder = 'Seleccionar...',
		name = '',
		id = '',
		disabled = false,
		required = false,
		class: className = ''
	}: Props = $props();

	let open = $state(false);
	let searchQuery = $state('');

	const selectedOption = $derived(options.find((o) => o.value?.toString() === value?.toString()));
	const filteredOptions = $derived(options.filter((o) => o.label.toLowerCase().includes(searchQuery.toLowerCase())));

	function toggleOpen() {
		if (disabled) return;
		open = !open;
		if (open) searchQuery = '';
	}

	function select(v: string | number) {
		value = v;
		open = false;
		searchQuery = '';
	}
</script>

<svelte:window onclick={() => { open = false; }} />

<div class="relative w-full {className}" onclick={(e) => e.stopPropagation()} role="presentation">
	<input type="hidden" {name} {id} bind:value {required} {disabled} />

	<button type="button" onclick={toggleOpen} {disabled} class="flex h-11 w-full items-center justify-between rounded-lg border px-3 py-2 font-body text-sm transition-all {disabled ? 'cursor-not-allowed border-border/40 bg-secondary/30 text-muted-foreground opacity-50' : open ? 'border-ocean-light bg-background text-foreground ring-2 ring-ocean-light/20' : 'border-border/60 bg-background text-foreground hover:border-ocean-light/50 focus:ring-2 focus:ring-ocean-light/20 focus:outline-none'}">
		<span class="truncate {selectedOption ? 'text-foreground' : 'text-muted-foreground'}">{selectedOption?.label ?? placeholder}</span>
		<svg class="ml-2 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200 {open ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
	</button>

	{#if open}
		<div class="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border/60 bg-background/95 shadow-xl backdrop-blur-md">
			<div class="border-b border-border/40 bg-secondary/20 p-2">
				<div class="relative">
					<svg class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
					<input type="text" bind:value={searchQuery} placeholder="Buscar..." class="h-9 w-full rounded-md border border-border/50 bg-background pr-3 pl-9 font-body text-sm transition-colors placeholder:text-muted-foreground/50 focus:border-ocean-light focus:ring-1 focus:ring-ocean-light focus:outline-none" />
				</div>
			</div>
			<ul class="custom-scrollbar max-h-56 space-y-0.5 overflow-auto p-1">
				{#if filteredOptions.length === 0}
					<li class="px-3 py-4 text-center font-body text-sm text-muted-foreground">No hay resultados</li>
				{:else}
					{#each filteredOptions as opt (opt.value)}
						<li>
							<button type="button" onclick={() => select(opt.value)} class="flex w-full items-center justify-between rounded-sm px-3 py-2 text-left font-body text-sm transition-colors hover:bg-ocean-light/10 hover:text-ocean-light {opt.value?.toString() === value?.toString() ? 'bg-ocean-light/15 font-medium text-ocean-light' : 'text-foreground'}">
								<span class="truncate">{opt.label}</span>
								{#if opt.value?.toString() === value?.toString()}<svg class="ml-2 h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>{/if}
							</button>
						</li>
					{/each}
				{/if}
			</ul>
		</div>
	{/if}
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar { width: 4px; }
	.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
	.custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border) / 0.5); border-radius: 4px; }
	.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: hsl(var(--border)); }
</style>