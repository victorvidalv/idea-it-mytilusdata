<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import RegistroEditContextoFields from './RegistroEditContextoFields.svelte';
	import RegistroEditMedicionFields from './RegistroEditMedicionFields.svelte';
	import { initEditFormValues } from './registro-edit-utils';

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

	// Inicializar estado local de edición
	const initialValues = initEditFormValues(reg, data.origenes);
	let editLugarId = initialValues.lugarId;
	let editCicloId = initialValues.cicloId;
	let editTipoId = initialValues.tipoId;
	let editOrigenId = initialValues.origenId;
	let editValor = initialValues.valor;
	let editFecha = initialValues.fechaMedicion;
	let editNotas = initialValues.notas;
</script>

<tr class="border-b border-border/20 bg-ocean-light/[0.03]">
	<td colspan="6" class="px-6 py-4">
		<form method="POST" action="?/update" use:enhance={handleAction} class="space-y-4">
			<input type="hidden" name="id" value={reg.id} />
			<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
				<RegistroEditContextoFields
					registroId={reg.id}
					centros={data.centros}
					ciclos={data.ciclos}
					bind:selectedLugarId={editLugarId}
					bind:selectedCicloId={editCicloId}
				/>

				<RegistroEditMedicionFields
					registroId={reg.id}
					tipos={data.tipos}
					origenes={data.origenes}
					bind:selectedTipoId={editTipoId}
					bind:selectedOrigenId={editOrigenId}
					bind:valor={editValor}
					bind:fechaMedicion={editFecha}
					bind:notas={editNotas}
				/>
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