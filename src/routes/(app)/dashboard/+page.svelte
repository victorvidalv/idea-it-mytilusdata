<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	
	export let data: any;
</script>

<svelte:head>
	<title>Dashboard | Plataforma Idea 2025</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Bienvenido(a), {data.user?.nombre}</h1>
			<p class="text-slate-500">Resumen y estado de tus centros de cultivo</p>
		</div>
		<Button>Nuevo Registro</Button>
	</div>

	<div class="grid gap-4 md:grid-cols-3">
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Centros Activos</Card.Title>
				<svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
				</svg>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.centros}</div>
				<p class="text-xs text-slate-500">Sin centros registrados aún</p>
			</Card.Content>
		</Card.Root>
		
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Ciclos en Curso</Card.Title>
				<svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.ciclosActivos}</div>
				<p class="text-xs text-slate-500">Ningún ciclo iniciado</p>
			</Card.Content>
		</Card.Root>
		
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Mediciones este mes</Card.Title>
				<svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
				</svg>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">{data.stats.medicionesMes}</div>
				<p class="text-xs text-slate-500">Debe registrar Talla o Biomasa</p>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
		<Card.Root class="md:col-span-4">
			<Card.Header>
				<Card.Title>Evolución de Talla / Biomasa</Card.Title>
			</Card.Header>
			<Card.Content class="pl-2 flex h-[300px] items-center justify-center text-slate-500 border-2 border-dashed m-4 rounded-lg">
				Aún no hay suficientes datos para generar proyecciones
			</Card.Content>
		</Card.Root>
		
		<Card.Root class="md:col-span-3">
			<Card.Header>
				<Card.Title>Alertas Recientes</Card.Title>
				<Card.Description>Actividad que requiere su atención</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-8">
					<div class="flex items-center">
						<div class="ml-4 space-y-1">
							<p class="text-sm font-medium leading-none">Complete su perfil</p>
							<p class="text-sm text-slate-500">Registre un primer centro de cultivo para iniciar.</p>
						</div>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
