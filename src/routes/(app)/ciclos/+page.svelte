<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import toast from 'svelte-french-toast';
	import DataTable from '$lib/components/DataTable.svelte';
	import CicloCreateForm from '$lib/components/ciclos/CicloCreateForm.svelte';
	import CicloRow from '$lib/components/ciclos/CicloRow.svelte';

	export let data: import('./$types').PageData;
	export let form: import('./$types').ActionData;

	let showForm = false;

	$: if (form?.success) {
		toast.success('¡Operación exitosa! ' + (form?.message || ''));
		showForm = false;
	} else if (form?.error) {
		toast.error('Error: ' + (form?.message || ''));
	}

	// Estadísticas
	$: activos = data.ciclos.filter((c: { activo: boolean | null }) => c.activo).length;
	$: finalizados = data.ciclos.filter((c: { activo: boolean | null }) => !c.activo).length;

	// Formatear fecha
	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		return new Date(dateStr).toLocaleDateString('es-CL', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	// Calcular días de cultivo
	function diasCultivo(fechaSiembra: string | null, fechaFin: string | null): string {
		if (!fechaSiembra) return '—';
		const inicio = new Date(fechaSiembra);
		const fin = fechaFin ? new Date(fechaFin) : new Date();
		const dias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
		return `${dias}d`;
	}
</script>

<svelte:head>
	<title>Ciclos Productivos | Plataforma Idea 2025</title>
</svelte:head>

<div class="space-y-8">
	<!-- Encabezado -->
	<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p
				class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
			>
				{#if data.canViewAll}Vista General{:else}Mis Ciclos{/if}
			</p>
			<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
				Ciclos <span class="text-gradient-ocean">Productivos</span>
			</h1>
			<p class="mt-2 font-body text-sm text-muted-foreground">
				{activos} activo{activos !== 1 ? 's' : ''} · {finalizados} finalizado{finalizados !== 1
					? 's'
					: ''}
			</p>
		</div>
		<Button
			onclick={() => (showForm = !showForm)}
			class="h-10 self-start rounded-xl bg-ocean-mid px-5 font-body text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-ocean-deep hover:shadow-lg hover:shadow-ocean-mid/20 sm:self-auto"
			disabled={data.centros.length === 0}
		>
			{#if showForm}
				<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
				Cancelar
			{:else}
				<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 4v16m8-8H4"
					/>
				</svg>
				Nuevo Ciclo
			{/if}
		</Button>
	</div>

	<!-- Aviso si no hay centros -->
	{#if data.centros.length === 0}
		<div class="animate-fade-up">
			<Card.Root class="border-border/50 border-ocean-light/15 bg-ocean-light/[0.04]">
				<Card.Content class="flex items-start gap-3 py-4">
					<div
						class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-ocean-light/15"
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
						<p class="font-body text-sm font-medium text-foreground">Primero registre un centro</p>
						<p class="mt-0.5 font-body text-xs text-muted-foreground">
							Necesita al menos un centro de cultivo para poder crear ciclos productivos.
							<a href="/centros" class="text-ocean-light hover:underline">Ir a Centros →</a>
						</p>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	<!-- Formulario para crear ciclo -->
	{#if showForm && data.centros.length > 0}
		<CicloCreateForm {data} onCancel={() => (showForm = false)} />
	{/if}

	<!-- Lista de ciclos -->
	{#if data.ciclos.length === 0 && data.centros.length > 0}
		<div class="animate-fade-up delay-150">
			<Card.Root class="border-dashed border-border/50">
				<Card.Content class="flex flex-col items-center justify-center py-16">
					<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-glow/10">
						<svg
							class="h-8 w-8 text-teal-glow/60"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
					</div>
					<p class="mb-1 font-body text-sm font-medium text-foreground">Sin ciclos productivos</p>
					<p class="font-body text-xs text-muted-foreground">Inicie su primer ciclo de cultivo</p>
				</Card.Content>
			</Card.Root>
		</div>
	{:else if data.ciclos.length > 0}
		<div class="animate-fade-up delay-150">
			<Card.Root class="overflow-hidden border-border/50">
				<DataTable
					data={data.ciclos}
					columns={[
						{ key: 'activo', label: 'Estado', sortable: true },
						{ key: 'nombre', label: 'Nombre', sortable: true },
						{ key: 'lugarNombre', label: 'Centro', sortable: true },
						{ key: 'fechaSiembra', label: 'Siembra', sortable: true },
						{
							key: 'duracion',
							label: 'Duración',
							sortable: true,
							align: 'center',
							accessor: (c) => {
								if (!c.fechaSiembra) return 0;
								const inicio = new Date(c.fechaSiembra);
								const fin = c.fechaFinalizacion ? new Date(c.fechaFinalizacion) : new Date();
								return Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
							}
						},
						{ key: 'acciones', label: 'Acciones', sortable: false, align: 'right' }
					]}
					searchKeys={['nombre', 'lugarNombre']}
					searchPlaceholder="Buscar ciclos..."
					emptyTitle="Sin ciclos productivos"
					emptyIcon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
					pageSize={10}
					let:items
				>
					{#each items as ciclo (ciclo.id)}
						<CicloRow {ciclo} canViewAll={data.canViewAll} {formatDate} {diasCultivo} />
					{/each}
				</DataTable>
			</Card.Root>
		</div>
	{/if}
</div>
