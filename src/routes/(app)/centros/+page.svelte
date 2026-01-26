<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import toast from 'svelte-french-toast';
	import DataTable from '$lib/components/DataTable.svelte';

	export let data: import('./$types').PageData;
	export let form: import('./$types').ActionData;

	// Estado del formulario
	let showCreateForm = false;
	let editingId: number | null = null;
	let editNombre = '';
	let editLat = '';
	let editLng = '';

	// Estado del formulario de creación
	let newNombre = '';
	let newLat = '';
	let newLng = '';
	let showMap = false;

	function startEdit(centro: {
		id: number;
		nombre: string;
		latitud?: number | null;
		longitud?: number | null;
	}) {
		editingId = centro.id;
		editNombre = centro.nombre;
		editLat = centro.latitud?.toString() ?? '';
		editLng = centro.longitud?.toString() ?? '';
	}

	function cancelEdit() {
		editingId = null;
	}

	function handleMapSelect(coords: { lat: number; lng: number }) {
		const lat = Math.round(coords.lat * 10000) / 10000;
		const lng = Math.round(coords.lng * 10000) / 10000;
		newLat = lat.toString();
		newLng = lng.toString();
	}

	function toggleMap() {
		showMap = !showMap;
		if (showMap && browser) {
			// Importar el componente Leaflet dinámicamente
			import('$lib/components/LeafletMap.svelte').then((mod) => {
				MapComponent = mod.default;
			});
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let MapComponent: any = null;

	$: if (form?.success) {
		toast.success(form.message);
		showCreateForm = false;
		editingId = null;
		newNombre = '';
		newLat = '';
		newLng = '';
		showMap = false;
	} else if (form?.error) {
		toast.error(form.message);
	}
</script>

<svelte:head>
	<title>Centros de Cultivo | Plataforma Idea 2025</title>
</svelte:head>

<div class="space-y-6">
	<!-- Encabezado -->
	<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p
				class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
			>
				{#if data.canViewAll}Vista General{:else}Mis Centros{/if}
			</p>
			<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
				Centros de <span class="text-gradient-ocean">Cultivo</span>
			</h1>
		</div>
		<Button
			onclick={() => {
				showCreateForm = !showCreateForm;
				if (!showCreateForm) showMap = false;
			}}
			class="h-10 self-start rounded-xl bg-ocean-mid px-5 font-body text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-ocean-deep hover:shadow-lg hover:shadow-ocean-mid/20 sm:self-auto"
		>
			{#if showCreateForm}
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
				Nuevo Centro
			{/if}
		</Button>
	</div>

	<!-- Formulario de creación -->
	{#if showCreateForm}
		<div class="animate-fade-up">
			<Card.Root class="border-border/50">
				<Card.Content class="pt-6">
					<form method="POST" action="?/create" use:enhance class="space-y-4">
						<div class="grid gap-4 sm:grid-cols-3">
							<div class="space-y-1.5">
								<label
									for="new-nombre"
									class="block font-body text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>Nombre</label
								>
								<input
									id="new-nombre"
									name="nombre"
									type="text"
									bind:value={newNombre}
									placeholder="Ej: Centro Calbuco Norte"
									required
									class="h-10 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
								/>
							</div>
							<div class="space-y-1.5">
								<label
									for="new-lat"
									class="block font-body text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>Latitud</label
								>
								<input
									id="new-lat"
									name="latitud"
									type="text"
									bind:value={newLat}
									placeholder="-41.4689"
									class="h-10 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm tabular-nums transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
								/>
							</div>
							<div class="space-y-1.5">
								<label
									for="new-lng"
									class="block font-body text-xs font-medium tracking-wider text-muted-foreground uppercase"
									>Longitud</label
								>
								<input
									id="new-lng"
									name="longitud"
									type="text"
									bind:value={newLng}
									placeholder="-72.9411"
									class="h-10 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm tabular-nums transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
								/>
							</div>
						</div>

						<!-- Botón para mostrar mapa -->
						<div>
							<button
								type="button"
								onclick={toggleMap}
								class="inline-flex items-center gap-1.5 font-body text-xs text-ocean-light transition-colors hover:text-ocean-mid"
							>
								<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
									/>
								</svg>
								{showMap ? 'Ocultar mapa' : 'Seleccionar desde mapa'}
							</button>

							{#if showMap && MapComponent}
								<div class="mt-3">
									<svelte:component this={MapComponent} height="280px" onselect={handleMapSelect} />
									<p class="mt-1.5 font-body text-[11px] text-muted-foreground">
										Haga clic en el mapa para seleccionar coordenadas
									</p>
								</div>
							{/if}
						</div>

						<div class="flex justify-end gap-2 pt-1">
							<Button
								type="button"
								variant="outline"
								onclick={() => {
									showCreateForm = false;
									showMap = false;
								}}
								class="h-9 rounded-lg font-body text-xs"
							>
								Cancelar
							</Button>
							<button
								type="submit"
								disabled={!newNombre.trim()}
								class="h-9 rounded-lg bg-ocean-mid px-4 font-body text-xs font-medium text-white transition-all hover:bg-ocean-deep disabled:cursor-not-allowed disabled:opacity-50"
							>
								Guardar
							</button>
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}

	<!-- Tabla de centros -->
	<div class="animate-fade-up delay-100">
		<Card.Root class="overflow-hidden border-border/50">
			<DataTable
				data={data.centros}
				columns={[
					{ key: 'nombre', label: 'Nombre', sortable: true },
					{ key: 'latitud', label: 'Latitud', sortable: true },
					{ key: 'longitud', label: 'Longitud', sortable: true },
					{ key: 'totalCiclos', label: 'Ciclos', sortable: true, align: 'center' },
					{ key: 'createdAt', label: 'Creado', sortable: true },
					{ key: 'acciones', label: 'Acciones', sortable: false, align: 'right' }
				]}
				searchKeys={['nombre']}
				searchPlaceholder="Buscar centros..."
				emptyTitle="Sin centros registrados"
				emptyIcon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
				pageSize={10}
				let:items
			>
				{#each items as centro (centro.id)}
					{#if editingId === centro.id}
						<!-- Fila en modo edición -->
						<tr class="border-b border-border/20 bg-ocean-light/[0.03]">
							<td colspan="6" class="px-4 py-3">
								<form
									method="POST"
									action="?/update"
									use:enhance
									class="flex flex-wrap items-end gap-3"
								>
									<input type="hidden" name="centroId" value={centro.id} />
									<div class="min-w-[150px] flex-1 space-y-1">
										<label
											for="edit-nombre-{centro.id}"
											class="block text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
											>Nombre</label
										>
										<input
											id="edit-nombre-{centro.id}"
											name="nombre"
											type="text"
											bind:value={editNombre}
											required
											class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
										/>
									</div>
									<div class="w-28 space-y-1">
										<label
											for="edit-lat-{centro.id}"
											class="block text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
											>Latitud</label
										>
										<input
											id="edit-lat-{centro.id}"
											name="latitud"
											type="text"
											bind:value={editLat}
											placeholder="-41.4689"
											class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm tabular-nums focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
										/>
									</div>
									<div class="w-28 space-y-1">
										<label
											for="edit-lng-{centro.id}"
											class="block text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
											>Longitud</label
										>
										<input
											id="edit-lng-{centro.id}"
											name="longitud"
											type="text"
											bind:value={editLng}
											placeholder="-72.9411"
											class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm tabular-nums focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
										/>
									</div>
									<div class="flex gap-1.5">
										<button
											type="submit"
											class="h-9 rounded-lg bg-ocean-mid px-3 font-body text-xs font-medium text-white transition-all hover:bg-ocean-deep"
											>Guardar</button
										>
										<button
											type="button"
											onclick={cancelEdit}
											class="h-9 rounded-lg border border-border/60 px-3 font-body text-xs transition-all hover:bg-secondary"
											>Cancelar</button
										>
									</div>
								</form>
							</td>
						</tr>
					{:else}
						<!-- Fila normal -->
						<tr class="group border-b border-border/20 transition-colors hover:bg-secondary/20">
							<td class="px-4 py-3">
								<span class="font-medium text-foreground">{centro.nombre}</span>
								{#if !centro.isOwner && data.canViewAll}
									<span class="ml-1.5 text-[10px] text-ocean-light">otro</span>
								{/if}
							</td>
							<td class="px-4 py-3 text-muted-foreground tabular-nums"
								>{centro.latitud?.toFixed(4) ?? '—'}</td
							>
							<td class="px-4 py-3 text-muted-foreground tabular-nums"
								>{centro.longitud?.toFixed(4) ?? '—'}</td
							>
							<td class="px-4 py-3 text-center">
								<span
									class="inline-flex h-6 min-w-6 items-center justify-center rounded-full text-xs font-medium {centro.totalCiclos >
									0
										? 'bg-teal-glow/10 text-teal-glow'
										: 'bg-secondary text-muted-foreground'}">{centro.totalCiclos}</span
								>
							</td>
							<td class="px-4 py-3 text-xs text-muted-foreground">
								{#if centro.createdAt}
									{new Date(centro.createdAt).toLocaleDateString('es-CL', {
										day: '2-digit',
										month: 'short',
										year: 'numeric'
									})}
								{:else}
									—
								{/if}
							</td>
							<td class="px-4 py-3">
								{#if centro.isOwner}
									<div
										class="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100"
									>
										<button
											type="button"
											onclick={() => startEdit(centro)}
											class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-ocean-light/10 hover:text-ocean-light"
											title="Editar"
										>
											<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
												><path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
												/></svg
											>
										</button>
										{#if centro.totalCiclos === 0}
											<form method="POST" action="?/delete" use:enhance class="inline">
												<input type="hidden" name="centroId" value={centro.id} />
												<button
													type="submit"
													class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
													title="Eliminar"
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
										{/if}
									</div>
								{/if}
							</td>
						</tr>
					{/if}
				{/each}
			</DataTable>
		</Card.Root>
	</div>
</div>
