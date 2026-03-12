<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		DashboardStatCard,
		DashboardChartPlaceholder,
		DashboardActivityAlerts,
		STAT_CARDS_CONFIG
	} from '$lib/components/dashboard';

	export let data: import('./$types').PageData;
</script>

<svelte:head>
	<title>Dashboard | MytilusData</title>
</svelte:head>

<div class="space-y-8">
	<!-- Encabezado -->
	<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p
				class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
			>
				{#if data.canViewAll}
					Vista General
				{:else}
					Mis Datos
				{/if}
			</p>
			<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
				Bienvenido, <span class="text-gradient-ocean">{data.user?.nombre}</span>
			</h1>
			<p class="mt-2 font-body text-sm text-muted-foreground">
				{#if data.canViewAll}
					Resumen global de todos los centros de cultivo registrados
				{:else}
					Resumen y estado de tus centros de cultivo
				{/if}
			</p>
		</div>
		<Button
			class="h-10 self-start rounded-xl bg-ocean-mid px-5 font-body text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-ocean-deep hover:shadow-lg hover:shadow-ocean-mid/20 sm:self-auto"
		>
			<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Nuevo Registro
		</Button>
	</div>

	<!-- Tarjetas de estadísticas -->
	<div class="grid gap-5 md:grid-cols-3">
		{#each STAT_CARDS_CONFIG as config, i (i)}
			<DashboardStatCard
				label={config.label}
				value={data.stats[config.valueKey]}
				empty={config.empty}
				icon={config.icon}
				accent={config.accent}
				iconBg={config.iconBg}
				delay={(i + 1) * 75}
			/>
		{/each}
	</div>

	<!-- Paneles inferiores -->
	<div class="animate-fade-up grid gap-5 delay-300 md:grid-cols-2 lg:grid-cols-7">
		<DashboardChartPlaceholder />
		<DashboardActivityAlerts />
	</div>
</div>