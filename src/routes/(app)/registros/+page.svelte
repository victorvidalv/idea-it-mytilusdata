<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import toast from 'svelte-french-toast';
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';

	export let data: any;

	let showForm = false;
	
	// Form bind variables
	let selectedLugarId = '';
	let selectedCicloId = '';
	let selectedTipoId = '';
	let selectedOrigenId = '';
	let valor = '';
	let fechaMedicion = new Date().toISOString().slice(0, 16); // Formato YYYY-MM-DDThh:mm adaptado para type="datetime-local"
	let notas = '';

	// Derivar opciones de ciclos basado en el centro seleccionado
	$: ciclosDisponibles = selectedLugarId 
		? data.ciclos.filter((c: any) => c.lugarId.toString() === selectedLugarId.toString())
		: [];

    // Resetear el ciclo si se cambia el centro
    $: if (selectedLugarId) {
        if (selectedCicloId && !ciclosDisponibles.find((c: any) => c.id.toString() === selectedCicloId.toString())) {
            selectedCicloId = ''; 
        }
    }

	// Saber qué unidad mostrar junto al input "Valor"
	$: unidadSeleccionada = selectedTipoId
		? data.tipos.find((t: any) => t.id.toString() === selectedTipoId.toString())?.unidadBase
		: '';

	function handleAction() {
		return async ({ result, update }: { result: any, update: any }) => {
			if (result.type === 'success') {
				toast.success(result.data?.message || 'Operación exitosa');
				showForm = false;
				// Limpieza
				selectedLugarId = '';
				selectedCicloId = '';
				selectedTipoId = '';
				selectedOrigenId = '';
				valor = '';
				notas = '';
				fechaMedicion = new Date().toISOString().slice(0, 16);
				await update();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message || 'Ocurrió un error');
			}
		};
	}

	function formatDateTime(dateString: string) {
		const date = new Date(dateString);
		return date.toLocaleString('es-CL', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// Variables para edición inline
	let editingId: number | null = null;
	let editLugarId = '';
	let editCicloId = '';
	let editTipoId = '';
	let editOrigenId = '';
	let editValor = '';
	let editFecha = '';
	let editNotas = '';

	// Ciclos disponibles para el centro seleccionado en edición
	$: editCiclosDisponibles = editLugarId
		? data.ciclos.filter((c: any) => c.lugarId?.toString() === editLugarId?.toString())
		: [];

	// Unidad del tipo seleccionado en edición
	$: editUnidad = editTipoId
		? data.tipos.find((t: any) => t.id?.toString() === editTipoId?.toString())?.unidadBase
		: '';

	function startEdit(reg: any) {
		editingId = reg.id;
		editLugarId = reg.centroId?.toString() || '';
		editCicloId = reg.cicloId?.toString() || '';
		editTipoId = reg.tipoId?.toString() || '';
		editOrigenId = ''; // Buscar el origenId por nombre
		const origenMatch = data.origenes.find((o: any) => o.nombre === reg.origenNombre);
		editOrigenId = origenMatch?.id?.toString() || '';
		editValor = reg.valor?.toString() || '';
		editFecha = reg.fechaMedicion ? new Date(reg.fechaMedicion).toISOString().slice(0, 16) : '';
		editNotas = reg.notas || '';
	}

	function cancelEdit() {
		editingId = null;
	}
</script>

<svelte:head>
	<title>Registros y Mediciones | Plataforma Idea 2025</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="animate-fade-up flex flex-col sm:flex-row sm:items-end justify-between gap-4">
		<div>
			<p class="text-xs font-body font-medium text-muted-foreground uppercase tracking-[0.2em] mb-2">Data Entry</p>
			<h1 class="text-3xl md:text-4xl font-display text-foreground leading-tight">
				Gestión de <span class="text-gradient-ocean">Registros</span>
			</h1>
		</div>
		<Button 
			onclick={() => showForm = !showForm}
			class="bg-ocean-mid hover:bg-ocean-deep text-white rounded-xl h-10 px-5 font-body text-sm transition-all duration-300 hover:shadow-lg hover:shadow-ocean-mid/20 hover:-translate-y-0.5 self-start sm:self-auto"
			disabled={data.centros.length === 0}
		>
			{#if showForm}
				<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
				Cancelar
			{:else}
				<svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
				</svg>
				Nuevo Registro
			{/if}
		</Button>
	</div>

	<!-- Advertencia Centros Vacíos -->
	{#if data.centros.length === 0}
		<div class="animate-fade-up bg-ocean-light/10 border border-ocean-light/20 rounded-xl p-4 flex gap-3 text-ocean-light">
			<svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<div class="font-body text-sm">
				<p class="font-medium">No tienes Centros de Cultivo registrados.</p>
				<p class="opacity-80 mt-1">Para ingresar registros o mediciones, primero debes configurar al menos un Centro en el sistema.</p>
				<div class="mt-3">
					<Button href="/centros" variant="outline" class="h-8 px-3 text-xs bg-transparent border-ocean-light/30 hover:bg-ocean-light/10 text-ocean-light">Ir a Centros de Cultivo</Button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Formulario de Nuevo Registro -->
	{#if showForm}
		<div class="animate-fade-up">
			<Card.Root class="border-border/50">
				<form method="POST" action="?/create" use:enhance={handleAction}>
					<Card.Content class="p-6 md:p-8 space-y-6">
						<!-- Bloque de Contexto (Dónde y Cuándo) -->
						<div class="pb-6 border-b border-border/50">
							<h3 class="text-sm font-display font-medium text-foreground mb-4 flex items-center gap-2">
								<div class="h-6 w-1 bg-ocean-light rounded-full"></div>
								Contexto del Registro
							</h3>
							
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div class="space-y-0 text-left">
									<label for="lugarId" class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block font-body mb-2">Centro de Cultivo *</label>
									<SearchableSelect
										id="lugarId"
										name="lugarId"
										bind:value={selectedLugarId}
										required
										placeholder="Seleccionar un centro..."
										options={data.centros.map((c: any) => ({ value: c.id, label: c.nombre }))}
									/>
								</div>

								<div class="space-y-0 text-left">
									<label for="cicloId" class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block font-body mb-2">
										Ciclo Productivo 
										<span class="opacity-50 lowercase ml-1">(Opcional)</span>
									</label>
									<SearchableSelect
										id="cicloId"
										name="cicloId"
										bind:value={selectedCicloId}
										disabled={!selectedLugarId || ciclosDisponibles.length === 0}
										placeholder="-- Sin ligar a un ciclo --"
										options={ciclosDisponibles.map((c: any) => ({ value: c.id, label: c.nombre }))}
									/>
									{#if selectedLugarId && ciclosDisponibles.length === 0}
										<p class="text-[10px] text-muted-foreground mt-1">No hay ciclos activos para este centro.</p>
									{/if}
								</div>
							</div>
						</div>

						<!-- Bloque de Medición (Qué y Cuánto) -->
						<div class="pt-2">
							<h3 class="text-sm font-display font-medium text-foreground mb-4 flex items-center gap-2">
								<div class="h-6 w-1 bg-ocean-light rounded-full"></div>
								Detalles de la Medición
							</h3>

							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
								
								<div class="space-y-0 text-left lg:col-span-2">
									<label for="tipoId" class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block font-body mb-2">Qué se midió *</label>
									<SearchableSelect
										id="tipoId"
										name="tipoId"
										bind:value={selectedTipoId}
										required
										placeholder="Seleccione el tipo... (ej. TALLA, TEMPERATURA)"
										options={data.tipos.map((t: any) => ({ value: t.id, label: `${t.codigo} (${t.unidadBase})` }))}
									/>
								</div>

								<div class="space-y-2">
									<label for="valor" class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block font-body">Valor *</label>
									<div class="relative">
										<input
											id="valor"
											name="valor"
											type="number"
											step="0.001"
											bind:value={valor}
											required
											placeholder="0.00"
											class="w-full h-11 rounded-lg bg-background border border-border/60 px-3 text-sm font-body focus:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light/20 transition-all {unidadSeleccionada ? 'pr-12' : ''}"
										/>
										{#if unidadSeleccionada}
											<div class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
												{unidadSeleccionada}
											</div>
										{/if}
									</div>
								</div>

								<div class="space-y-0 text-left">
									<label for="origenId" class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block font-body mb-2">Origen *</label>
									<SearchableSelect
										id="origenId"
										name="origenId"
										bind:value={selectedOrigenId}
										required
										placeholder="Origen del dato..."
										options={data.origenes.map((o: any) => ({ value: o.id, label: o.nombre }))}
									/>
								</div>

								<div class="space-y-2 lg:col-span-2">
									<label for="fechaMedicion" class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block font-body">Fecha y Hora *</label>
									<input
										id="fechaMedicion"
										name="fechaMedicion"
										type="datetime-local"
										bind:value={fechaMedicion}
										required
										class="w-full h-11 rounded-lg bg-background border border-border/60 px-3 text-sm font-body focus:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light/20 transition-all"
									/>
								</div>

								<div class="space-y-2 lg:col-span-4">
									<label for="notas" class="text-[11px] font-medium uppercase tracking-wider text-muted-foreground block font-body">Notas u Observaciones</label>
									<textarea
										id="notas"
										name="notas"
										bind:value={notas}
										rows="2"
										placeholder="Información adicional relevante..."
										class="w-full rounded-lg bg-background border border-border/60 px-3 py-2 text-sm font-body focus:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light/20 transition-all resize-y min-h-[44px]"
									></textarea>
								</div>
							</div>
						</div>
					</Card.Content>
					<div class="px-6 md:px-8 py-4 bg-secondary/30 border-t border-border/50 flex flex-col sm:flex-row justify-end gap-3 rounded-b-xl">
						<Button type="button" variant="outline" onclick={() => showForm = false} class="w-full sm:w-auto rounded-xl font-body">
							Cancelar
						</Button>
						<Button type="submit" class="w-full sm:w-auto bg-ocean-mid hover:bg-ocean-deep text-white rounded-xl font-body">
							Guardar Registro
						</Button>
					</div>
				</form>
			</Card.Root>
		</div>
	{/if}

	<!-- Lista de Registros Recientes -->
	<div class="animate-fade-up delay-100">
		<Card.Root class="border-border/50 overflow-hidden">
			<div class="px-6 py-5 border-b border-border/40 bg-secondary/10 flex justify-between items-center">
				<h3 class="font-display font-medium text-foreground">Últimos Registros</h3>
				<span class="text-xs font-body text-muted-foreground">{data.registros.length} / 100 mostrados</span>
			</div>
			
			<div class="overflow-x-auto">
				<table class="w-full text-sm font-body">
					<thead>
						<tr class="border-b border-border/40 bg-secondary/30">
							<th class="text-left py-3 px-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">Fecha</th>
							<th class="text-left py-3 px-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">Centro / Ciclo</th>
							<th class="text-left py-3 px-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">Medición</th>
							<th class="text-left py-3 px-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">Origen</th>
							<th class="text-right py-3 px-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">Acciones</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border/20">
						{#if data.registros.length === 0}
							<tr>
								<td colspan="5" class="py-12">
									<div class="flex flex-col items-center justify-center text-muted-foreground">
										<svg class="w-12 h-12 mb-3 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
										</svg>
										<p class="font-medium text-sm">No hay registros ingresados</p>
										<p class="text-xs mt-1">Ingresa el primer registro usando el botón superior.</p>
									</div>
								</td>
							</tr>
						{:else}
							{#each data.registros as reg}
						{#if editingId === reg.id}
							<!-- Fila de edición inline -->
							<tr class="bg-ocean-light/[0.03] border-b border-border/20">
								<td colspan="5" class="py-4 px-6">
									<form method="POST" action="?/update" use:enhance={handleAction} class="space-y-4">
										<input type="hidden" name="id" value={reg.id} />
										<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											<div class="space-y-1">
												<label class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block font-body">Centro *</label>
												<SearchableSelect
													name="lugarId"
													bind:value={editLugarId}
													required
													placeholder="Centro..."
													options={data.centros.map((c: any) => ({ value: c.id, label: c.nombre }))}
												/>
											</div>
											<div class="space-y-1">
												<label class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block font-body">Ciclo</label>
												<SearchableSelect
													name="cicloId"
													bind:value={editCicloId}
													disabled={!editLugarId || editCiclosDisponibles.length === 0}
													placeholder="-- Sin ciclo --"
													options={editCiclosDisponibles.map((c: any) => ({ value: c.id, label: c.nombre }))}
												/>
											</div>
											<div class="space-y-1">
												<label class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block font-body">Tipo *</label>
												<SearchableSelect
													name="tipoId"
													bind:value={editTipoId}
													required
													placeholder="Tipo..."
													options={data.tipos.map((t: any) => ({ value: t.id, label: `${t.codigo} (${t.unidadBase})` }))}
												/>
											</div>
											<div class="space-y-1">
												<label class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block font-body">Valor * {editUnidad ? `(${editUnidad})` : ''}</label>
												<input name="valor" type="number" step="0.001" bind:value={editValor} required placeholder="0.00" class="w-full h-9 rounded-lg bg-background border border-border/60 px-3 text-sm font-body focus:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light/20" />
											</div>
											<div class="space-y-1">
												<label class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block font-body">Origen *</label>
												<SearchableSelect
													name="origenId"
													bind:value={editOrigenId}
													required
													placeholder="Origen..."
													options={data.origenes.map((o: any) => ({ value: o.id, label: o.nombre }))}
												/>
											</div>
											<div class="space-y-1">
												<label class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block font-body">Fecha *</label>
												<input name="fechaMedicion" type="datetime-local" bind:value={editFecha} required class="w-full h-9 rounded-lg bg-background border border-border/60 px-3 text-sm font-body focus:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light/20" />
											</div>
											<div class="space-y-1 lg:col-span-3">
												<label class="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block font-body">Notas</label>
												<input name="notas" type="text" bind:value={editNotas} placeholder="Observaciones..." class="w-full h-9 rounded-lg bg-background border border-border/60 px-3 text-sm font-body focus:border-ocean-light focus:outline-none focus:ring-2 focus:ring-ocean-light/20" />
											</div>
										</div>
										<div class="flex gap-2 justify-end">
											<button type="submit" class="h-8 px-4 rounded-lg bg-ocean-mid hover:bg-ocean-deep text-white text-xs font-body font-medium transition-all">Guardar</button>
											<button type="button" on:click={cancelEdit} class="h-8 px-4 rounded-lg border border-border/60 text-xs font-body hover:bg-secondary transition-all">Cancelar</button>
										</div>
									</form>
								</td>
							</tr>
						{:else}
							<!-- Fila normal -->
							<tr class="hover:bg-secondary/20 transition-colors group">
							<td class="py-3 px-6 whitespace-nowrap">
								<div class="flex items-center gap-2">
									<svg class="w-4 h-4 text-ocean-light/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
									<span class="text-muted-foreground">{formatDateTime(reg.fechaMedicion)}</span>
								</div>
							</td>
							<td class="py-3 px-6">
								<p class="font-medium text-foreground">{reg.centroNombre}</p>
								{#if reg.cicloNombre}
									<p class="text-xs text-muted-foreground mt-0.5">{reg.cicloNombre}</p>
								{:else}
									<span class="inline-flex items-center px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground border border-border">
										Solo Centro
									</span>
								{/if}
							</td>
							<td class="py-3 px-6">
								<p class="font-medium text-ocean-light tracking-wide">{reg.tipoNombre}</p>
								<p class="text-sm font-semibold text-foreground mt-0.5 flex items-baseline gap-1">
									{reg.valor.toLocaleString('es-CL', { maximumFractionDigits: 3 })}
									<span class="text-xs text-muted-foreground font-normal">{reg.unidad}</span>
								</p>
							</td>
							<td class="py-3 px-6 text-muted-foreground text-sm">
								{reg.origenNombre}
								{#if reg.notas}
									<div class="mt-1 flex items-center gap-1 opacity-70" title={reg.notas}>
										<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
										<span class="text-[11px] truncate max-w-[120px]">Tiene nota</span>
									</div>
								{/if}
							</td>
							<td class="py-3 px-6">
								{#if reg.isOwner}
									<div class="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
										<!-- Botón Editar -->
										<button
											type="button"
											class="p-1.5 rounded-md text-muted-foreground hover:text-ocean-light hover:bg-ocean-light/10 transition-all"
											title="Editar registro"
											on:click={() => startEdit(reg)}
										>
											<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
										</button>
										<!-- Botón Eliminar -->
										<form method="POST" action="?/delete" use:enhance={handleAction} class="inline">
											<input type="hidden" name="id" value={reg.id} />
											<button
												type="submit"
												class="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
												title="Eliminar registro"
												on:click|preventDefault={(e) => { if (confirm('¿Seguro que deseas eliminar este registro?')) e.target.closest('form').requestSubmit(); }}
											>
												<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
											</button>
										</form>
									</div>
								{:else}
									<div class="flex justify-end opacity-50" title="Registro de otro usuario">
										<svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
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
		</Card.Root>
	</div>
</div>
