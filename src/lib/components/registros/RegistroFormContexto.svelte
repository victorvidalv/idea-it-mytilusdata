<script lang="ts">
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';

	export let centros: Array<{ id: number; nombre: string }>;
	export let ciclos: Array<{ id: number; nombre: string; lugarId: number }>;
	export let selectedLugarId: string;
	export let selectedCicloId: string;

	$: ciclosDisponibles = selectedLugarId
		? ciclos.filter((c) => c.lugarId.toString() === selectedLugarId.toString())
		: [];

	$: if (selectedLugarId) {
		if (
			selectedCicloId &&
			!ciclosDisponibles.find((c) => c.id.toString() === selectedCicloId.toString())
		) {
			selectedCicloId = '';
		}
	}
</script>

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
				options={centros.map((c) => ({ value: c.id, label: c.nombre }))}
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