<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import toast from 'svelte-french-toast';
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';
	import DataTable from '$lib/components/DataTable.svelte';

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
		if (
			selectedCicloId &&
			!ciclosDisponibles.find((c: any) => c.id.toString() === selectedCicloId.toString())
		) {
			selectedCicloId = '';
		}
	}

	// Saber qué unidad mostrar junto al input "Valor"
	$: unidadSeleccionada = selectedTipoId
		? data.tipos.find((t: any) => t.id.toString() === selectedTipoId.toString())?.unidadBase
		: '';

	function handleAction() {
		return async ({ result, update }: { result: any; update: any }) => {
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
	<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p
				class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
			>
				Data Entry
			</p>
			<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
				Gestión de <span class="text-gradient-ocean">Registros</span>
			</h1>
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
				Nuevo Registro
			{/if}
		</Button>
	</div>

	<!-- Advertencia Centros Vacíos -->
	{#if data.centros.length === 0}
		<div
			class="animate-fade-up flex gap-3 rounded-xl border border-ocean-light/20 bg-ocean-light/10 p-4 text-ocean-light"
		>
			<svg
				class="mt-0.5 h-5 w-5 flex-shrink-0"
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
			<div class="font-body text-sm">
				<p class="font-medium">No tienes Centros de Cultivo registrados.</p>
				<p class="mt-1 opacity-80">
					Para ingresar registros o mediciones, primero debes configurar al menos un Centro en el
					sistema.
				</p>
				<div class="mt-3">
					<Button
						href="/centros"
						variant="outline"
						class="h-8 border-ocean-light/30 bg-transparent px-3 text-xs text-ocean-light hover:bg-ocean-light/10"
						>Ir a Centros de Cultivo</Button
					>
				</div>
			</div>
		</div>
	{/if}

	<!-- Formulario de Nuevo Registro -->
	{#if showForm}
		<div class="animate-fade-up">
			<Card.Root class="border-border/50">
				<form method="POST" action="?/create" use:enhance={handleAction}>
					<Card.Content class="space-y-6 p-6 md:p-8">
						<!-- Bloque de Contexto (Dónde y Cuándo) -->
						<div class="border-b border-border/50 pb-6">
							<h3
								class="mb-4 flex items-center gap-2 font-display text-sm font-medium text-foreground"
							>
								<div class="h-6 w-1 rounded-full bg-ocean-light"></div>
								Contexto del Registro
							</h3>

							<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div class="space-y-0 text-left">
									<label
										for="lugarId"
										class="mb-2 block font-body text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
										>Centro de Cultivo *</label
									>
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
									<label
										for="cicloId"
										class="mb-2 block font-body text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
									>
										Ciclo Productivo
										<span class="ml-1 lowercase opacity-50">(Opcional)</span>
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
										<p class="mt-1 text-[10px] text-muted-foreground">
											No hay ciclos activos para este centro.
										</p>
									{/if}
								</div>
							</div>
						</div>

						<!-- Bloque de Medición (Qué y Cuánto) -->
						<div class="pt-2">
							<h3
								class="mb-4 flex items-center gap-2 font-display text-sm font-medium text-foreground"
							>
								<div class="h-6 w-1 rounded-full bg-ocean-light"></div>
								Detalles de la Medición
							</h3>

							<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
								<div class="space-y-0 text-left lg:col-span-2">
									<label
										for="tipoId"
										class="mb-2 block font-body text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
										>Qué se midió *</label
									>
									<SearchableSelect
										id="tipoId"
										name="tipoId"
										bind:value={selectedTipoId}
										required
										placeholder="Seleccione el tipo... (ej. TALLA, TEMPERATURA)"
										options={data.tipos.map((t: any) => ({
											value: t.id,
											label: `${t.codigo} (${t.unidadBase})`
										}))}
									/>
								</div>

								<div class="space-y-2">
									<label
										for="valor"
										class="block font-body text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
										>Valor *</label
									>
									<div class="relative">
										<input
											id="valor"
											name="valor"
											type="number"
											step="0.001"
											bind:value={valor}
											required
											placeholder="0.00"
											class="h-11 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none {unidadSeleccionada
												? 'pr-12'
												: ''}"
										/>
										{#if unidadSeleccionada}
											<div
												class="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-muted-foreground"
											>
												{unidadSeleccionada}
											</div>
										{/if}
									</div>
								</div>

								<div class="space-y-0 text-left">
									<label
										for="origenId"
										class="mb-2 block font-body text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
										>Origen *</label
									>
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
									<label
										for="fechaMedicion"
										class="block font-body text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
										>Fecha y Hora *</label
									>
									<input
										id="fechaMedicion"
										name="fechaMedicion"
										type="datetime-local"
										bind:value={fechaMedicion}
										required
										class="h-11 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
									/>
								</div>

								<div class="space-y-2 lg:col-span-4">
									<label
										for="notas"
										class="block font-body text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
										>Notas u Observaciones</label
									>
									<textarea
										id="notas"
										name="notas"
										bind:value={notas}
										rows="2"
										placeholder="Información adicional relevante..."
										class="min-h-[44px] w-full resize-y rounded-lg border border-border/60 bg-background px-3 py-2 font-body text-sm transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
									></textarea>
								</div>
							</div>
						</div>
					</Card.Content>
					<div
						class="flex flex-col justify-end gap-3 rounded-b-xl border-t border-border/50 bg-secondary/30 px-6 py-4 sm:flex-row md:px-8"
					>
						<Button
							type="button"
							variant="outline"
							onclick={() => (showForm = false)}
							class="w-full rounded-xl font-body sm:w-auto"
						>
							Cancelar
						</Button>
						<Button
							type="submit"
							class="w-full rounded-xl bg-ocean-mid font-body text-white hover:bg-ocean-deep sm:w-auto"
						>
							Guardar Registro
						</Button>
					</div>
				</form>
			</Card.Root>
		</div>
	{/if}

	<!-- Lista de Registros -->
	<div class="animate-fade-up delay-100">
		<Card.Root class="overflow-hidden border-border/50">
			<DataTable
				data={data.registros}
				columns={[
					{
						key: 'fechaMedicion',
						label: 'Fecha',
						sortable: true,
						accessor: (r) => new Date(r.fechaMedicion).getTime()
					},
					{ key: 'centroNombre', label: 'Centro / Ciclo', sortable: true },
					{ key: 'tipoNombre', label: 'Medición', sortable: true },
					{ key: 'valor', label: 'Valor', sortable: true, align: 'right' },
					{ key: 'origenNombre', label: 'Origen', sortable: true },
					{ key: 'acciones', label: 'Acciones', sortable: false, align: 'right' }
				]}
				searchKeys={['centroNombre', 'cicloNombre', 'tipoNombre', 'origenNombre', 'notas']}
				searchPlaceholder="Buscar por centro, tipo, origen..."
				emptyTitle="No hay registros ingresados"
				emptyDescription="Ingresa el primer registro usando el botón superior."
				let:items
			>
				{#each items as reg}
					{#if editingId === reg.id}
						<!-- Fila de edición inline -->
						<tr class="border-b border-border/20 bg-ocean-light/[0.03]">
							<td colspan="6" class="px-6 py-4">
								<form method="POST" action="?/update" use:enhance={handleAction} class="space-y-4">
									<input type="hidden" name="id" value={reg.id} />
									<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
										<div class="space-y-1">
											<label
												for="edit-centro-{reg.id}"
												class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
												>Centro *</label
											>
											<SearchableSelect
												id="edit-centro-{reg.id}"
												name="lugarId"
												bind:value={editLugarId}
												required
												placeholder="Centro..."
												options={data.centros.map((c) => ({ value: c.id, label: c.nombre }))}
											/>
										</div>
										<div class="space-y-1">
											<label
												for="edit-ciclo-{reg.id}"
												class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
												>Ciclo</label
											>
											<SearchableSelect
												id="edit-ciclo-{reg.id}"
												name="cicloId"
												bind:value={editCicloId}
												disabled={!editLugarId || editCiclosDisponibles.length === 0}
												placeholder="-- Sin ciclo --"
												options={editCiclosDisponibles.map((c) => ({
													value: c.id,
													label: c.nombre
												}))}
											/>
										</div>
										<div class="space-y-1">
											<label
												for="edit-tipo-{reg.id}"
												class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
												>Tipo *</label
											>
											<SearchableSelect
												id="edit-tipo-{reg.id}"
												name="tipoId"
												bind:value={editTipoId}
												required
												placeholder="Tipo..."
												options={data.tipos.map((t) => ({
													value: t.id,
													label: `${t.codigo} (${t.unidadBase})`
												}))}
											/>
										</div>
										<div class="space-y-1">
											<label
												for="edit-valor-{reg.id}"
												class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
												>Valor * {editUnidad ? `(${editUnidad})` : ''}</label
											>
											<input
												id="edit-valor-{reg.id}"
												name="valor"
												type="number"
												step="0.001"
												bind:value={editValor}
												required
												placeholder="0.00"
												class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
											/>
										</div>
										<div class="space-y-1">
											<label
												for="edit-origen-{reg.id}"
												class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
												>Origen *</label
											>
											<SearchableSelect
												id="edit-origen-{reg.id}"
												name="origenId"
												bind:value={editOrigenId}
												required
												placeholder="Origen..."
												options={data.origenes.map((o) => ({ value: o.id, label: o.nombre }))}
											/>
										</div>
										<div class="space-y-1">
											<label
												for="edit-fecha-{reg.id}"
												class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
												>Fecha *</label
											>
											<input
												id="edit-fecha-{reg.id}"
												name="fechaMedicion"
												type="datetime-local"
												bind:value={editFecha}
												required
												class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
											/>
										</div>
										<div class="space-y-1 lg:col-span-3">
											<label
												for="edit-notas-{reg.id}"
												class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
												>Notas</label
											>
											<input
												id="edit-notas-{reg.id}"
												name="notas"
												type="text"
												bind:value={editNotas}
												placeholder="Observaciones..."
												class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
											/>
										</div>
									</div>
									<div class="flex justify-end gap-2">
										<button
											type="submit"
											class="h-8 rounded-lg bg-ocean-mid px-4 font-body text-xs font-medium text-white transition-all hover:bg-ocean-deep"
											>Guardar</button
										>
										<button
											type="button"
											onclick={cancelEdit}
											class="h-8 rounded-lg border border-border/60 px-4 font-body text-xs transition-all hover:bg-secondary"
											>Cancelar</button
										>
									</div>
								</form>
							</td>
						</tr>
					{:else}
						<!-- Fila normal -->
						<tr class="group transition-colors hover:bg-secondary/20">
							<td class="px-5 py-3 whitespace-nowrap">
								<div class="flex items-center gap-2">
									<svg
										class="h-4 w-4 text-ocean-light/70"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										/></svg
									>
									<span class="text-muted-foreground">{formatDateTime(reg.fechaMedicion)}</span>
								</div>
							</td>
							<td class="px-5 py-3">
								<p class="font-medium text-foreground">{reg.centroNombre}</p>
								{#if reg.cicloNombre}
									<p class="mt-0.5 text-xs text-muted-foreground">{reg.cicloNombre}</p>
								{:else}
									<span
										class="mt-0.5 inline-flex items-center rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
										>Solo Centro</span
									>
								{/if}
							</td>
							<td class="px-5 py-3">
								<p class="font-medium tracking-wide text-ocean-light">{reg.tipoNombre}</p>
							</td>
							<td class="px-5 py-3 text-right">
								<span class="font-semibold text-foreground tabular-nums"
									>{reg.valor.toLocaleString('es-CL', { maximumFractionDigits: 3 })}</span
								>
								<span class="ml-1 text-xs text-muted-foreground">{reg.unidad}</span>
							</td>
							<td class="px-5 py-3 text-sm text-muted-foreground">
								{reg.origenNombre}
								{#if reg.notas}
									<div class="mt-1 flex items-center gap-1 opacity-70" title={reg.notas}>
										<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
											/></svg
										>
										<span class="max-w-[120px] truncate text-[11px]">Tiene nota</span>
									</div>
								{/if}
							</td>
							<td class="px-5 py-3">
								{#if reg.isOwner}
									<div
										class="flex items-center justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100"
									>
										<button
											type="button"
											class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-ocean-light/10 hover:text-ocean-light"
											title="Editar registro"
											onclick={() => startEdit(reg)}
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
										<form method="POST" action="?/delete" use:enhance={handleAction} class="inline">
											<input type="hidden" name="id" value={reg.id} />
											<button
												type="submit"
												class="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
												title="Eliminar registro"
												onclick={(e) => {
													if (!confirm('¿Seguro que deseas eliminar este registro?'))
														e.preventDefault();
												}}
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
								{:else}
									<div class="flex justify-end opacity-50" title="Registro de otro usuario">
										<svg
											class="h-4 w-4 text-muted-foreground"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											><path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
											/></svg
										>
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
