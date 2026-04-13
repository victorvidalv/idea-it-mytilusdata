<script lang="ts">
	import { enhance } from '$app/forms';
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let reg: {
		id: number;
		centroId?: number | null;
		cicloId?: number | null;
		tipoId?: number | null;
		origenNombre?: string | null;
		valor: number;
		fechaMedicion: Date | string | null;
		notas?: string | null;
	};
	export let data: {
		centros: Array<{ id: number; nombre: string }>;
		ciclos: Array<{ id: number; nombre: string; lugarId: number }>;
		tipos: Array<{ id: number; codigo: string; unidadBase: string }>;
		origenes: Array<{ id: number; nombre: string }>;
	};
	export let onCancel: () => void;
	export let handleAction: SubmitFunction;

	// Local edit variables
	let editLugarId = '';
	let editCicloId = '';
	let editTipoId = '';
	let editOrigenId = '';
	let editValor = '';
	let editFecha = '';
	let editNotas = '';

	// Initialize edit state on mount
	$: if (editLugarId === '') {
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

	// Ciclos disponibles para el centro seleccionado
	$: editCiclosDisponibles = editLugarId
		? data.ciclos.filter((c) => c.lugarId?.toString() === editLugarId?.toString())
		: [];

	// Unidad del tipo seleccionado
	$: editUnidad = editTipoId
		? data.tipos.find((t) => t.id?.toString() === editTipoId?.toString())?.unidadBase
		: '';
</script>

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