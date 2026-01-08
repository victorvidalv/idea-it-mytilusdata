<script lang="ts">
	/** Componente Select con búsqueda integrada (estilo Select2) - Svelte 4 */
	export let value: any = '';
	export let options: Array<{ value: string | number; label: string }> = [];
	export let placeholder: string = 'Seleccionar...';
	export let name: string = '';
	export let id: string = '';
	export let disabled: boolean = false;
	export let required: boolean = false;
	let className: string = '';
	export { className as class };

	let open = false;
	let searchQuery = '';

	// Derivar opción seleccionada para mostrar su label
	$: selectedOption = options.find(opt => opt.value?.toString() === value?.toString());

	// Filtrar opciones basado en búsqueda
	$: filteredOptions = options.filter(opt =>
		opt.label.toLowerCase().includes(searchQuery.toLowerCase())
	);

	function toggleOpen() {
		if (!disabled) {
			open = !open;
			if (open) {
				searchQuery = '';
			}
		}
	}

	function selectOption(optValue: string | number) {
		value = optValue;
		open = false;
		searchQuery = '';
	}

	// Acción de Svelte para detectar clics fuera del componente
	function clickOutsideAction(node: HTMLElement) {
		const handleClick = (e: MouseEvent) => {
			if (!node.contains(e.target as Node)) {
				open = false;
			}
		};
		document.addEventListener('click', handleClick, true);
		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}

	// Acción para enfocar automáticamente al montar
	function focusOnMount(node: HTMLInputElement) {
		setTimeout(() => node.focus(), 10);
	}
</script>

<div class="relative w-full {className}" use:clickOutsideAction>
	<!-- Input hidden para formularios y validación nativa -->
	<input type="hidden" {name} {id} bind:value {required} {disabled} />

	<!-- Botón del Select -->
	<button
		type="button"
		class="flex h-11 w-full items-center justify-between rounded-lg border px-3 py-2 text-sm font-body transition-all
			{disabled ? 'opacity-50 cursor-not-allowed bg-secondary/30 border-border/40 text-muted-foreground' :
			 open ? 'border-ocean-light ring-2 ring-ocean-light/20 bg-background text-foreground' :
			 'bg-background border-border/60 text-foreground hover:border-ocean-light/50 focus:outline-none focus:ring-2 focus:ring-ocean-light/20'}"
		on:click={toggleOpen}
		{disabled}
	>
		<span class="truncate {selectedOption ? 'text-foreground' : 'text-muted-foreground'}">
			{selectedOption ? selectedOption.label : placeholder}
		</span>
		<svg
			class="h-4 w-4 ml-2 flex-shrink-0 text-muted-foreground transition-transform duration-200 {open ? 'rotate-180' : ''}"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	<!-- Dropdown Popover -->
	{#if open}
		<div
			class="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border/60 bg-background/95 backdrop-blur-md shadow-xl"
		>
			<div class="p-2 border-b border-border/40 bg-secondary/20">
				<div class="relative">
					<svg class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Buscar..."
						class="w-full h-9 rounded-md bg-background border border-border/50 pl-9 pr-3 text-sm font-body focus:border-ocean-light focus:outline-none focus:ring-1 focus:ring-ocean-light placeholder:text-muted-foreground/50 transition-colors"
						use:focusOnMount
					/>
				</div>
			</div>

			<ul class="max-h-56 overflow-auto py-1 p-1 space-y-0.5 custom-scrollbar">
				{#if filteredOptions.length === 0}
					<li class="px-3 py-4 text-center text-sm font-body text-muted-foreground">
						No hay resultados
					</li>
				{:else}
					{#each filteredOptions as option}
						<li>
							<button
								type="button"
								class="w-full flex items-center justify-between rounded-sm px-3 py-2 text-left text-sm font-body transition-colors hover:bg-ocean-light/10 hover:text-ocean-light
									{option.value?.toString() === value?.toString() ? 'bg-ocean-light/15 text-ocean-light font-medium' : 'text-foreground'}"
								on:click={() => selectOption(option.value)}
							>
								<span class="truncate">{option.label}</span>
								{#if option.value?.toString() === value?.toString()}
									<svg class="h-4 w-4 ml-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</button>
						</li>
					{/each}
				{/if}
			</ul>
		</div>
	{/if}
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: hsl(var(--border) / 0.5);
		border-radius: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--border));
	}
</style>
