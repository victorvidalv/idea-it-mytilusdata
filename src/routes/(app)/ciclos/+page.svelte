<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import toast from 'svelte-french-toast';
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

	export let data: import('./$types').PageData;
	export let form: import('./$types').ActionData;

	let showForm = false;
	let selectedLugarId = '';

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
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href="/centros" class="text-ocean-light hover:underline">Ir a Centros →</a>
						</p>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	<!-- Formulario para crear ciclo -->
	{#if showForm && data.centros.length > 0}
		<div class="animate-fade-up">
			<Card.Root class="overflow-hidden border-border/50">
				<Card.Header>
					<Card.Title class="font-display text-lg">Iniciar Ciclo Productivo</Card.Title>
					<Card.Description class="font-body text-xs"
						>Vincule un nuevo ciclo a un centro de cultivo existente</Card.Description
					>
				</Card.Header>
				<Card.Content>
					<form method="POST" action="?/create" use:enhance class="space-y-5">
						<div class="grid gap-5 md:grid-cols-3">
							<!-- Nombre del ciclo -->
							<div class="space-y-2">
								<Label
									for="nombre"
									class="font-body text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>Nombre del Ciclo</Label
								>
								<Input
									id="nombre"
									name="nombre"
									type="text"
									placeholder="Ej: Siembra Primavera 2025"
									required
									class="h-11 rounded-xl border-border/50 bg-secondary/50 font-body transition-all focus:border-ocean-light focus:ring-ocean-light/20"
								/>
							</div>

							<!-- Centro de cultivo -->
							<div class="space-y-2">
								<Label
									for="lugarId"
									class="font-body text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>Centro de Cultivo</Label
								>
								<SearchableSelect
									id="lugarId"
									name="lugarId"
									bind:value={selectedLugarId}
									required
									placeholder="Seleccionar centro..."
									options={data.centros.map((c: { id: number | string; nombre: string }) => ({
										value: c.id,
										label: c.nombre
									}))}
								/>
							</div>

							<!-- Fecha de siembra -->
							<div class="space-y-2">
								<Label
									for="fechaSiembra"
									class="font-body text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>Fecha de Siembra</Label
								>
								<Input
									id="fechaSiembra"
									name="fechaSiembra"
									type="date"
									required
									class="h-11 rounded-xl border-border/50 bg-secondary/50 font-body transition-all focus:border-ocean-light focus:ring-ocean-light/20"
								/>
							</div>
						</div>

						<div class="flex justify-end gap-3">
							<Button
								type="button"
								variant="outline"
								onclick={() => (showForm = false)}
								class="rounded-xl font-body"
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								class="rounded-xl bg-ocean-mid font-body text-white transition-all duration-300 hover:bg-ocean-deep hover:shadow-lg hover:shadow-ocean-mid/20"
							>
								<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M5 13l4 4L19 7"
									/>
								</svg>
								Iniciar Ciclo
							</Button>
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		</div>
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
						<tr class="group transition-colors hover:bg-secondary/20">
							<td class="px-5 py-3">
								{#if ciclo.activo}
									<span
										class="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-600 dark:bg-teal-900/20 dark:text-teal-400"
									>
										<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500"></span>
										Activo
									</span>
								{:else}
									<span
										class="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
									>
										Finalizado
									</span>
								{/if}
							</td>
							<td class="px-5 py-3 font-medium text-foreground">{ciclo.nombre}</td>
							<td class="px-5 py-3 text-muted-foreground">
								<div class="flex items-center gap-1.5">
									<svg
										class="h-3.5 w-3.5 text-ocean-light/60"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
									</svg>
									{ciclo.lugarNombre}
								</div>
							</td>
							<td class="px-5 py-3 whitespace-nowrap text-muted-foreground">
								{formatDate(ciclo.fechaSiembra)}
								{#if ciclo.fechaFinalizacion}
									<span class="mx-1 text-muted-foreground/40">→</span>
									{formatDate(ciclo.fechaFinalizacion)}
								{/if}
							</td>
							<td class="px-5 py-3 text-center">
								<span class="font-medium text-ocean-light tabular-nums"
									>{diasCultivo(ciclo.fechaSiembra, ciclo.fechaFinalizacion)}</span
								>
							</td>
							<td class="px-5 py-3">
								{#if ciclo.isOwner}
									<div
										class="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100"
									>
										<form method="POST" action="?/toggleActive" use:enhance class="inline">
											<input type="hidden" name="cicloId" value={ciclo.id} />
											<input type="hidden" name="activo" value={!ciclo.activo} />
											<button
												type="submit"
												class="rounded-md px-2.5 py-1 font-body text-[11px] font-medium transition-all
												{ciclo.activo
													? 'text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/15'
													: 'text-teal-600 hover:bg-teal-50 dark:text-teal-400 dark:hover:bg-teal-900/15'}"
											>
												{ciclo.activo ? 'Finalizar' : 'Reactivar'}
											</button>
										</form>
										<form method="POST" action="?/delete" use:enhance class="inline">
											<input type="hidden" name="cicloId" value={ciclo.id} />
											<button
												type="submit"
												class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
												title="Eliminar ciclo"
											>
												<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
													><path
														stroke-linecap="round"
														stroke-linejoin="round"
														stroke-width="2"
														d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
													/></svg
												>
											</button>
										</form>
									</div>
								{:else if data.canViewAll}
									<div class="flex justify-end">
										<span class="font-body text-[10px] text-muted-foreground/50">Otro usuario</span>
									</div>
								{/if}
							</td>
						</tr>
					{/each}
				</DataTable>
			</Card.Root>
		</div>
	{/if}
</div>
