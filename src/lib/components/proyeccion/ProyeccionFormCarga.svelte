<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';
	import type { Lugar, Ciclo, MedicionCargada } from './ProyeccionComponentTypes';

	interface Props {
		lugares: Lugar[];
		ciclos: Ciclo[];
		selectedLugarId: number | null;
		selectedCicloId: number | null;
		cargandoDatos: boolean;
		errorCarga: string;
		medicionesCargadas: MedicionCargada[];
		onCargarMediciones: () => void;
		onUsarMedicionesCargadas: () => void;
		onEliminarMedicionCargada: (dia: number) => void;
	}

	let {
		lugares,
		ciclos,
		selectedLugarId = $bindable(),
		selectedCicloId = $bindable(),
		cargandoDatos,
		errorCarga,
		medicionesCargadas,
		onCargarMediciones,
		onUsarMedicionesCargadas,
		onEliminarMedicionCargada
	}: Props = $props();

	let lugarOptions = $derived(lugares.map((l) => ({ value: l.id, label: l.nombre })));
	let filteredCiclos = $derived(ciclos.filter((c) => c.lugarId === selectedLugarId));
	let cicloOptions = $derived(
		filteredCiclos.map((c) => ({
			value: c.id,
			label: `${c.nombre} (${new Date(c.fechaSiembra).toLocaleDateString()})`
		}))
	);
</script>

<div class="rounded-lg border border-dashed border-border bg-secondary/20 p-4 space-y-4">
	<div class="flex items-center gap-2">
		<Label class="text-sm font-medium">Cargar desde ciclo existente</Label>
	</div>

	<div class="flex flex-col gap-4 sm:flex-row">
		<div class="flex-1 space-y-2">
			<Label class="text-xs font-medium tracking-wider text-muted-foreground uppercase">Lugar</Label>
			<SearchableSelect
				bind:value={selectedLugarId}
				options={lugarOptions}
				placeholder="Selecciona un lugar..."
				disabled={lugares.length === 0}
			/>
		</div>

		<div class="flex-1 space-y-2">
			<Label class="text-xs font-medium tracking-wider text-muted-foreground uppercase">Ciclo</Label>
			<SearchableSelect
				bind:value={selectedCicloId}
				options={cicloOptions}
				placeholder={cargandoDatos ? 'Cargando ciclos...' : 'Selecciona un ciclo...'}
				disabled={selectedLugarId === null}
			/>
		</div>

		<div class="flex items-end">
			<Button
				onclick={onCargarMediciones}
				disabled={selectedCicloId === null || cargandoDatos}
				class="h-11 rounded-xl bg-ocean-mid hover:bg-ocean-light"
			>
				{cargandoDatos ? 'Cargando...' : 'Cargar datos'}
			</Button>
		</div>
	</div>

	{#if errorCarga}
		<p class="text-sm text-destructive">{errorCarga}</p>
	{/if}

	{#if medicionesCargadas.length > 0}
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<Label class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
					Mediciones del ciclo ({medicionesCargadas.length})
				</Label>
				<Button variant="outline" size="sm" onclick={onUsarMedicionesCargadas} class="h-7 text-xs">
					Usar estos datos
				</Button>
			</div>
			<div class="max-h-48 overflow-y-auto rounded-lg border border-border/50">
				<table class="w-full text-sm">
					<thead class="bg-secondary/30 text-muted-foreground">
						<tr>
							<th class="px-3 py-2 text-left font-medium">Día</th>
							<th class="px-3 py-2 text-left font-medium">Talla (mm)</th>
							<th class="px-3 py-2 text-right font-medium">Acciones</th>
						</tr>
					</thead>
					<tbody>
						{#each medicionesCargadas as medicion}
							<tr class="border-t border-border/30">
								<td class="px-3 py-2">{medicion.dia}</td>
								<td class="px-3 py-2">{medicion.talla.toFixed(1)}</td>
								<td class="px-3 py-2 text-right">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => onEliminarMedicionCargada(medicion.dia)}
										class="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
									>
										Eliminar
									</Button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/if}
</div>
