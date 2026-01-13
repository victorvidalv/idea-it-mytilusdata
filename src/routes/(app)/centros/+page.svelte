<script lang="ts">
	import { enhance } from '$app/forms';
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';

	export let data: any;
	export let form: any;

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

	function startEdit(centro: any) {
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
			import('$lib/components/LeafletMap.svelte').then(mod => {
				MapComponent = mod.default;
			});
		}
	}

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
	<div class="animate-fade-up flex flex-col sm:flex-row sm:items-end justify-between gap-4">
		<div>
			<p class="text-xs font-body font-medium text-muted-foreground uppercase tracking-[0.2em] mb-2">
				{#if data.canViewAll}Vista General{:else}Mis Centros{/if}
			</p>
			<h1 class="text-3xl md:text-4xl font-display text-foreground leading-tight">
				Centros de <span class="text-gradient-ocean">Cultivo</span>
			</h1>
		</div>
		<Button 
			onclick={() => { showCreateForm = !showCreateForm; if (!showCreateForm) showMap = false; }}
			class="bg-ocean-mid hover:bg-ocean-deep text-white rounded-xl h-10 px-5 font-body text-sm transition-all duration-300 hover:shadow-lg hover:shadow-ocean-mid/20 hover:-translate-y-0.5 self-start sm:self-auto"
		>
			{#if showCreateForm}
				<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
				Cancelar
			{:else}
				<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
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
								<label for="new-nombre" class="text-xs font-medium uppercase tracking-wider text-muted-foreground font-body block">Nombre</label>
								<input
									id="new-nombre"
									name="nombre"
									type="text"
									bind:value={newNombre}
									placeholder="Ej: Centro Calbuco Norte"
									required
									class="w-full h-10 rounded-lg bg-background border border-border/60 px-3 text-sm font-body focus:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light/20 transition-all"
								/>
							</div>
							<div class="space-y-1.5">
								<label for="new-lat" class="text-xs font-medium uppercase tracking-wider text-muted-foreground font-body block">Latitud</label>
								<input
									id="new-lat"
									name="latitud"
									type="text"
									bind:value={newLat}
									placeholder="-41.4689"
									class="w-full h-10 rounded-lg bg-background border border-border/60 px-3 text-sm font-body tabular-nums focus:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light/20 transition-all"
								/>
							</div>
							<div class="space-y-1.5">
								<label for="new-lng" class="text-xs font-medium uppercase tracking-wider text-muted-foreground font-body block">Longitud</label>
								<input
									id="new-lng"
									name="longitud"
									type="text"
									bind:value={newLng}
									placeholder="-72.9411"
									class="w-full h-10 rounded-lg bg-background border border-border/60 px-3 text-sm font-body tabular-nums focus:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light/20 transition-all"
								/>
							</div>
						</div>

						<!-- Botón para mostrar mapa -->
						<div>
							<button
								type="button"
								onclick={toggleMap}
								class="text-xs font-body text-ocean-light hover:text-ocean-mid transition-colors inline-flex items-center gap-1.5"
							>
								<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
								</svg>
								{showMap ? 'Ocultar mapa' : 'Seleccionar desde mapa'}
							</button>

							{#if showMap && MapComponent}
								<div class="mt-3">
									<svelte:component
										this={MapComponent}
										height="280px"
										onselect={handleMapSelect}
									/>
									<p class="text-[11px] text-muted-foreground font-body mt-1.5">Haga clic en el mapa para seleccionar coordenadas</p>
								</div>
							{/if}
						</div>

						<div class="flex justify-end gap-2 pt-1">
							<Button type="button" variant="outline" onclick={() => { showCreateForm = false; showMap = false; }} class="rounded-lg font-body h-9 text-xs">
								Cancelar
							</Button>
							<button
								type="submit"
								disabled={!newNombre.trim()}
								class="h-9 px-4 rounded-lg bg-ocean-mid hover:bg-ocean-deep disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-body font-medium transition-all"
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
		<Card.Root class="border-border/50 overflow-hidden">
			<div class="overflow-x-auto">
				<table class="w-full text-sm font-body">
					<thead>
						<tr class="border-b border-border/40 bg-secondary/30">
							<th class="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Nombre</th>
							<th class="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Latitud</th>
							<th class="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Longitud</th>
							<th class="text-center py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Ciclos</th>
							<th class="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Creado</th>
							<th class="text-right py-3 px-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{#if data.centros.length === 0}
							<tr>
								<td colspan="6" class="text-center py-12 text-muted-foreground">
									<div class="flex flex-col items-center gap-2">
										<svg class="w-8 h-8 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
										</svg>
										<p class="text-xs">Sin centros registrados</p>
									</div>
								</td>
							</tr>
						{:else}
							{#each data.centros as centro (centro.id)}
								{#if editingId === centro.id}
									<!-- Fila en modo edición -->
									<tr class="border-b border-border/20 bg-ocean-light/[0.03]">
										<td colspan="6" class="py-3 px-4">
											<form method="POST" action="?/update" use:enhance class="flex flex-wrap items-end gap-3">
												<input type="hidden" name="centroId" value={centro.id} />
												<div class="flex-1 min-w-[150px] space-y-1">
													<label class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block">Nombre</label>
													<input
														name="nombre"
														type="text"
														bind:value={editNombre}
														required
														class="w-full h-9 rounded-lg bg-background border border-border/60 px-3 text-sm font-body focus:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light/20"
													/>
												</div>
												<div class="w-28 space-y-1">
													<label class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block">Latitud</label>
													<input
														name="latitud"
														type="text"
														bind:value={editLat}
														placeholder="-41.4689"
														class="w-full h-9 rounded-lg bg-background border border-border/60 px-3 text-sm font-body tabular-nums focus:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light/20"
													/>
												</div>
												<div class="w-28 space-y-1">
													<label class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block">Longitud</label>
													<input
														name="longitud"
														type="text"
														bind:value={editLng}
														placeholder="-72.9411"
														class="w-full h-9 rounded-lg bg-background border border-border/60 px-3 text-sm font-body tabular-nums focus:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light/20"
													/>
												</div>
												<div class="flex gap-1.5">
													<button type="submit" class="h-9 px-3 rounded-lg bg-ocean-mid hover:bg-ocean-deep text-white text-xs font-body font-medium transition-all">
														Guardar
													</button>
													<button type="button" onclick={cancelEdit} class="h-9 px-3 rounded-lg border border-border/60 text-xs font-body hover:bg-secondary transition-all">
														Cancelar
													</button>
												</div>
											</form>
										</td>
									</tr>
								{:else}
									<!-- Fila normal -->
									<tr class="border-b border-border/20 hover:bg-secondary/20 transition-colors group">
										<td class="py-3 px-4">
											<span class="font-medium text-foreground">{centro.nombre}</span>
											{#if !centro.isOwner && data.canViewAll}
												<span class="text-[10px] text-ocean-light ml-1.5">otro</span>
											{/if}
										</td>
										<td class="py-3 px-4 tabular-nums text-muted-foreground">
											{centro.latitud?.toFixed(4) ?? '—'}
										</td>
										<td class="py-3 px-4 tabular-nums text-muted-foreground">
											{centro.longitud?.toFixed(4) ?? '—'}
										</td>
										<td class="py-3 px-4 text-center">
											<span class="inline-flex items-center justify-center h-6 min-w-6 rounded-full text-xs font-medium {centro.totalCiclos > 0 ? 'bg-teal-glow/10 text-teal-glow' : 'bg-secondary text-muted-foreground'}">
												{centro.totalCiclos}
											</span>
										</td>
										<td class="py-3 px-4 text-xs text-muted-foreground">
											{#if centro.createdAt}
												{new Date(centro.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
											{:else}
												—
											{/if}
										</td>
										<td class="py-3 px-4">
											{#if centro.isOwner}
												<div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
													<button
														type="button"
														onclick={() => startEdit(centro)}
														class="p-1.5 rounded-md text-muted-foreground hover:text-ocean-light hover:bg-ocean-light/10 transition-all"
														title="Editar"
													>
														<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
															<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
														</svg>
													</button>
													{#if centro.totalCiclos === 0}
														<form method="POST" action="?/delete" use:enhance class="inline">
															<input type="hidden" name="centroId" value={centro.id} />
															<button
																type="submit"
																class="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
																title="Eliminar"
															>
																<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																	<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
																</svg>
															</button>
														</form>
													{/if}
												</div>
											{/if}
										</td>
									</tr>
								{/if}
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
			{#if data.centros.length > 0}
				<div class="px-4 py-2.5 border-t border-border/30 bg-secondary/20">
					<p class="text-[11px] text-muted-foreground font-body">
						{data.centros.length} centro{data.centros.length !== 1 ? 's' : ''} registrado{data.centros.length !== 1 ? 's' : ''}
					</p>
				</div>
			{/if}
		</Card.Root>
	</div>
</div>
