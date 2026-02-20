<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	export let data: import('./$types').PageData;

	const statCards = [
		{
			label: 'Usuarios Registrados',
			value: data.stats.usuariosTotales,
			empty: 'Sin usuarios',
			icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
			accent: 'from-purple-400 to-ocean-light',
			iconBg: 'bg-purple-500/10 text-purple-400'
		},
		{
			label: 'Centros Globales',
			value: data.stats.centros,
			empty: 'Ningún centro',
			icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
			accent: 'from-ocean-light to-teal-glow',
			iconBg: 'bg-ocean-light/10 text-ocean-light'
		},
		{
			label: 'Ciclos Productivos',
			value: data.stats.ciclosActivos,
			empty: 'Sin ciclos activos',
			icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
			accent: 'from-teal-glow to-green-400',
			iconBg: 'bg-teal-glow/10 text-teal-glow'
		},
		{
			label: 'Mediciones (Este Mes)',
			value: data.stats.medicionesMes,
			empty: 'Sin datos recientes',
			icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
			accent: 'from-blue-400 to-ocean-light',
			iconBg: 'bg-blue-500/10 text-blue-500'
		}
	];
</script>

<svelte:head>
	<title>Panel de Investigador | MytilusData</title>
</svelte:head>

<div class="space-y-8">
	<!-- Encabezado -->
	<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p
				class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
			>
				Área Investigador
			</p>
			<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
				Panel y <span class="text-gradient-ocean">Auditoría Global</span>
			</h1>
			<p class="mt-2 font-body text-sm text-muted-foreground">
				Bienvenido. Aquí puedes visualizar y auditar los datos consolidados de todos los usuarios de
				la plataforma.
			</p>
		</div>
	</div>

	<!-- Tarjetas de estadísticas -->
	<div class="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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
							{card.value === 0 ? card.empty : `Total registrado a nivel global`}
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
		<Card.Root class="border-border/50 md:col-span-4">
			<Card.Header>
				<Card.Title class="font-display text-lg">Acerca de las Vistas de Investigador</Card.Title>
			</Card.Header>
			<Card.Content>
				<p class="mb-4 font-body text-sm text-foreground">
					Tu rol de investigador te confiere permisos de <strong>solo lectura</strong> sobre un corpus
					agregado de datos anonimizados o directos. No puedes mutar, crear o borrar datos que pertenezcan
					a usuarios finales.
				</p>
				<ul class="space-y-2 font-body text-sm text-muted-foreground">
					<li class="flex items-center gap-2">
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
								d="M5 13l4 4L19 7"
							/>
						</svg>
						Puedes analizar <strong>Centros Globales</strong> filtrando por propietario.
					</li>
					<li class="flex items-center gap-2">
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
								d="M5 13l4 4L19 7"
							/>
						</svg>
						Puedes visualizar los <strong>Ciclos Productivos</strong> y estado histórico.
					</li>
					<li class="flex items-center gap-2">
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
								d="M5 13l4 4L19 7"
							/>
						</svg>
						Puedes auditar las <strong>Mediciones</strong> y construir predicciones.
					</li>
				</ul>
			</Card.Content>
		</Card.Root>
	</div>
</div>
