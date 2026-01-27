<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import toast from 'svelte-french-toast';
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

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

	// Derivar opciones de ciclos basado en el centro seleccionado
	$: ciclosDisponibles = selectedLugarId
		? data.ciclos.filter((c) => c.lugarId.toString() === selectedLugarId.toString())
		: [];

	// Resetear el ciclo si se cambia el centro
	$: if (selectedLugarId) {
		if (
			selectedCicloId &&
			!ciclosDisponibles.find((c) => c.id.toString() === selectedCicloId.toString())
		) {
			selectedCicloId = '';
		}
	}

	// Saber qué unidad mostrar junto al input "Valor"
	$: unidadSeleccionada = selectedTipoId
		? data.tipos.find((t) => t.id.toString() === selectedTipoId.toString())?.unidadBase
		: '';

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
				<!-- Bloque de Contexto (Dónde y Cuándo) -->
				<div class="border-b border-border/50 pb-6">
					<h3 class="mb-4 flex items-center gap-2 font-display text-sm font-medium text-foreground">
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
								options={data.centros.map((c) => ({ value: c.id, label: c.nombre }))}
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
								options={ciclosDisponibles.map((c) => ({ value: c.id, label: c.nombre }))}
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
					<h3 class="mb-4 flex items-center gap-2 font-display text-sm font-medium text-foreground">
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
								options={data.tipos.map((t) => ({
									value: t.id,
									label: `${t.codigo} (${t.unidadBase})`
								}))}
							/>
						</div>

						<div class="space-y-0 text-left">
							<label
								for="valor"
								class="mb-2 block font-body text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
								>Valor {unidadSeleccionada ? `(${unidadSeleccionada})` : ''} *</label
							>
							<input
								id="valor"
								name="valor"
								type="number"
								step="0.001"
								bind:value={valor}
								required
								placeholder="0.00"
								class="h-10 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
							/>
						</div>

						<div class="space-y-0 text-left">
							<label
								for="fechaMedicion"
								class="mb-2 block font-body text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
								>Fecha y Hora *</label
							>
							<input
								id="fechaMedicion"
								name="fechaMedicion"
								type="datetime-local"
								bind:value={fechaMedicion}
								required
								class="h-10 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
							/>
						</div>
					</div>
				</div>

				<div class="grid grid-cols-1 gap-4 pt-2 md:grid-cols-2">
					<div class="space-y-0 text-left">
						<label
							for="origenId"
							class="mb-2 block font-body text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
							>Origen del dato *</label
						>
						<SearchableSelect
							id="origenId"
							name="origenId"
							bind:value={selectedOrigenId}
							required
							placeholder="Origen del dato..."
							options={data.origenes.map((o) => ({ value: o.id, label: o.nombre }))}
						/>
					</div>

					<div class="space-y-0 text-left">
						<label
							for="notas"
							class="mb-2 block font-body text-[11px] font-medium tracking-wider text-muted-foreground uppercase"
							>Notas u Observaciones</label
						>
						<input
							id="notas"
							name="notas"
							type="text"
							bind:value={notas}
							placeholder="Opcional..."
							class="h-10 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm transition-all focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
						/>
					</div>
				</div>
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
