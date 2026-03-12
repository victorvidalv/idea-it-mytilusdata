<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import toast from 'svelte-french-toast';
	import type { SubmitFunction } from '@sveltejs/kit';
	import RegistroFormContexto from './RegistroFormContexto.svelte';
	import RegistroFormMedicion from './RegistroFormMedicion.svelte';

	export let data: {
		centros: Array<{ id: number; nombre: string }>;
		ciclos: Array<{ id: number; nombre: string; lugarId: number }>;
		tipos: Array<{ id: number; codigo: string; unidadBase: string }>;
		origenes: Array<{ id: number; nombre: string }>;
	};
	export let onCancel: () => void;
	export let onSuccess: () => void;

	// Form bind variables
	let selectedLugarId = '';
	let selectedCicloId = '';
	let selectedTipoId = '';
	let selectedOrigenId = '';
	let valor = '';
	let fechaMedicion = new Date().toISOString().slice(0, 16);
	let notas = '';

	const handleAction: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				toast.success(result.data?.message || 'Operación exitosa');
				// Limpieza
				selectedLugarId = '';
				selectedCicloId = '';
				selectedTipoId = '';
				selectedOrigenId = '';
				valor = '';
				notas = '';
				fechaMedicion = new Date().toISOString().slice(0, 16);
				onSuccess();
				await update();
			} else if (result.type === 'failure') {
				toast.error(result.data?.message || 'Ocurrió un error');
			}
		};
	};
</script>

<div class="animate-fade-up">
	<Card.Root class="border-border/50">
		<form method="POST" action="?/create" use:enhance={handleAction}>
			<Card.Content class="space-y-6 p-6 md:p-8">
				<RegistroFormContexto
						centros={data.centros}
						ciclos={data.ciclos}
						bind:selectedLugarId
						bind:selectedCicloId
					/>
	
					<RegistroFormMedicion
						tipos={data.tipos}
						origenes={data.origenes}
						bind:selectedTipoId
						bind:selectedOrigenId
						bind:valor
						bind:fechaMedicion
						bind:notas
					/>
			</Card.Content>

			<div
				class="flex flex-col justify-end gap-3 rounded-b-xl border-t border-border/50 bg-secondary/30 px-6 py-4 sm:flex-row md:px-8"
			>
				<Button
					type="button"
					variant="outline"
					onclick={onCancel}
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