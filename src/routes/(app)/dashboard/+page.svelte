<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	export let data: import('./$types').PageData;

	const statCards = [
		{
			label: 'Centros Activos',
			value: data.stats.centros,
			empty: 'Sin centros registrados',
			icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
			accent: 'from-ocean-light to-teal-glow',
			iconBg: 'bg-ocean-light/10 text-ocean-light'
		},
		{
			label: 'Ciclos en Curso',
			value: data.stats.ciclosActivos,
			empty: 'Ningún ciclo iniciado',
			icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
			accent: 'from-teal-glow to-green-400',
			iconBg: 'bg-teal-glow/10 text-teal-glow'
		},
		{
			label: 'Mediciones este Mes',
			value: data.stats.medicionesMes,
			empty: 'Registre Talla o Biomasa',
			icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
			accent: 'from-blue-400 to-ocean-light',
			iconBg: 'bg-blue-500/10 text-blue-500'
		}
	];
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
		{#each statCards as card, i (i)}
			<div class="animate-fade-up delay-{(i + 1) * 75} card-hover group">
				<Card.Root
					class="overflow-hidden border-border/50 transition-colors duration-300 hover:border-border"
				>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="font-body text-sm font-medium text-muted-foreground"
							>{card.label}</Card.Title
						>
						<div
							class="h-9 w-9 rounded-xl {card.iconBg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
						>
							<svg class="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.75"
									d={card.icon}
								/>
							</svg>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="font-display text-3xl text-foreground">{card.value}</div>
						<p class="mt-1 font-body text-xs text-muted-foreground">
							{card.value === 0
								? card.empty
								: `${card.value} registrado${card.value > 1 ? 's' : ''}`}
						</p>
						<!-- Barra decorativa -->
						<div class="mt-4 h-1 overflow-hidden rounded-full bg-secondary/80">
							<div
								class="h-full rounded-full bg-gradient-to-r {card.accent} transition-all duration-700"
								style="width: {Math.min(card.value * 10, 100)}%"
							></div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		{/each}
	</div>

	<!-- Paneles inferiores -->
	<div class="animate-fade-up grid gap-5 delay-300 md:grid-cols-2 lg:grid-cols-7">
		<!-- Gráfico de evolución -->
		<Card.Root class="overflow-hidden border-border/50 md:col-span-4">
			<Card.Header>
				<div class="flex items-center justify-between">
					<div>
						<Card.Title class="font-display text-lg">Evolución de Talla / Biomasa</Card.Title>
						<Card.Description class="mt-1 font-body text-xs"
							>Curvas sigmoidales predictivas</Card.Description
						>
					</div>
					<div class="flex gap-2">
						<div class="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
							<div class="h-2 w-2 rounded-full bg-ocean-light"></div>
							Talla
						</div>
						<div class="flex items-center gap-1.5 font-body text-xs text-muted-foreground">
							<div class="h-2 w-2 rounded-full bg-teal-glow"></div>
							Biomasa
						</div>
					</div>
				</div>
			</Card.Header>
			<Card.Content>
				<div
					class="relative flex h-[280px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-border/50 bg-secondary/30"
				>
					<!-- Patrón de fondo decorativo -->
					<div class="absolute inset-0 opacity-[0.03]">
						<svg width="100%" height="100%">
							<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
							{#each Array(8) as _, i (i)}
								<line
									x1="0"
									y1="{(i + 1) * 12.5}%"
									x2="100%"
									y2="{(i + 1) * 12.5}%"
									stroke="currentColor"
									stroke-width="1"
								/>
							{/each}
						</svg>
					</div>
					<div class="relative z-10 text-center">
						<div
							class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-ocean-light/10"
						>
							<svg
								class="h-6 w-6 text-ocean-light/60"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
								/>
							</svg>
						</div>
						<p class="font-body text-sm text-muted-foreground">Aún no hay datos suficientes</p>
						<p class="mt-1 font-body text-xs text-muted-foreground/60">
							Registre mediciones para ver proyecciones
						</p>
					</div>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Alertas -->
		<Card.Root class="border-border/50 md:col-span-3">
			<Card.Header>
				<Card.Title class="font-display text-lg">Actividad Reciente</Card.Title>
				<Card.Description class="font-body text-xs"
					>Notificaciones que requieren su atención</Card.Description
				>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					<!-- Alerta de bienvenida -->
					<div
						class="flex items-start gap-3 rounded-xl border border-ocean-light/10 bg-ocean-light/[0.06] p-3"
					>
						<div
							class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-ocean-light/15"
						>
							<svg
								class="h-4 w-4 text-ocean-light"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div>
							<p class="font-body text-sm font-medium text-foreground">Complete su perfil</p>
							<p class="mt-0.5 font-body text-xs leading-relaxed text-muted-foreground">
								Registre su primer centro de cultivo para comenzar a monitorear datos.
							</p>
						</div>
					</div>

					<!-- Alerta de modelo -->
					<div
						class="flex items-start gap-3 rounded-xl border border-teal-glow/10 bg-teal-glow/[0.04] p-3"
					>
						<div
							class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-teal-glow/15"
						>
							<svg
								class="h-4 w-4 text-teal-glow"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
								/>
							</svg>
						</div>
						<div>
							<p class="font-body text-sm font-medium text-foreground">Modelo predictivo</p>
							<p class="mt-0.5 font-body text-xs leading-relaxed text-muted-foreground">
								Se requieren al menos 10 mediciones para activar las proyecciones sigmoidales.
							</p>
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
