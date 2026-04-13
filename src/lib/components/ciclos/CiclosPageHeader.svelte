<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	export let activos: number;
	export let finalizados: number;
	export let canViewAll: boolean;
	export let centrosCount: number;
	export let showForm: boolean;
	export let onToggleForm: () => void;
</script>

<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
	<div>
		<p class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
			{#if canViewAll}Vista General{:else}Mis Ciclos{/if}
		</p>
		<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
			Ciclos <span class="text-gradient-ocean">Productivos</span>
		</h1>
		<p class="mt-2 font-body text-sm text-muted-foreground">
			{activos} activo{activos !== 1 ? 's' : ''} · {finalizados} finalizado{finalizados !== 1 ? 's' : ''}
		</p>
	</div>
	<Button
		onclick={onToggleForm}
		class="h-10 self-start rounded-xl bg-ocean-mid px-5 font-body text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-ocean-deep hover:shadow-lg hover:shadow-ocean-mid/20 sm:self-auto"
		disabled={centrosCount === 0}
	>
		{#if showForm}
			<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
			Cancelar
		{:else}
			<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Nuevo Ciclo
		{/if}
	</Button>
</div>