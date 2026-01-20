<script lang="ts">
	import { enhance } from '$app/forms';
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let reg: {
		id: number;
		centroId?: number | null;
		centroNombre: string;
		cicloId?: number | null;
		cicloNombre?: string | null;
		tipoId?: number | null;
		tipoNombre?: string | null;
		origenNombre?: string | null;
		valor: number;
		unidad?: string | null;
		fechaMedicion: Date | string | null;
		notas?: string | null;
		isOwner: boolean;
	};
	export let editingId: number | null;
	export let data: {
		centros: Array<{ id: number; nombre: string }>;
		ciclos: Array<{ id: number; nombre: string; lugarId: number }>;
		tipos: Array<{ id: number; codigo: string; unidadBase: string }>;
		origenes: Array<{ id: number; nombre: string }>;
	};
	export let onEdit: (reg: unknown) => void;
	export let onCancel: () => void;
	export let handleAction: SubmitFunction;
	export let formatDateTime: (d: string | Date | null) => string;

	// Local edit variables
	let editLugarId = '';
	let editCicloId = '';
	let editTipoId = '';
	let editOrigenId = '';
	let editValor = '';
	let editFecha = '';
	let editNotas = '';

	$: isEditing = editingId === reg.id;

	// Update local state when editing starts for THIS row
	$: if (isEditing && editLugarId === '') {
		initEditState();
	}

	function initEditState() {
		editLugarId = reg.centroId?.toString() || '';
		editCicloId = reg.cicloId?.toString() || '';
		editTipoId = reg.tipoId?.toString() || '';
		const origenMatch = data.origenes.find((o) => o.nombre === reg.origenNombre);
		editOrigenId = origenMatch?.id?.toString() || '';
		editValor = reg.valor?.toString() || '';
		editFecha = reg.fechaMedicion ? new Date(reg.fechaMedicion).toISOString().slice(0, 16) : '';
		editNotas = reg.notas || '';
	}

	// Ciclos disponibles para el centro seleccionado en edición
	$: editCiclosDisponibles = editLugarId
		? data.ciclos.filter((c) => c.lugarId?.toString() === editLugarId?.toString())
		: [];

	// Unidad del tipo seleccionado en edición
	$: editUnidad = editTipoId
		? data.tipos.find((t) => t.id?.toString() === editTipoId?.toString())?.unidadBase
		: '';

	function handleStartEdit() {
		onEdit(reg);
	}
</script>

{#if isEditing}
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
						onclick={onCancel}
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
						onclick={handleStartEdit}
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
								if (!confirm('¿Seguro que deseas eliminar este registro?')) e.preventDefault();
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
