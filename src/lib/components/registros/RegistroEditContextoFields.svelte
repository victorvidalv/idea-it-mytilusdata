<script lang="ts">
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';

	export let registroId: number;
	export let centros: Array<{ id: number; nombre: string }>;
	export let ciclos: Array<{ id: number; nombre: string; lugarId: number }>;
	export let selectedLugarId: string;
	export let selectedCicloId: string;

	// Ciclos disponibles para el centro seleccionado
	$: ciclosDisponibles = selectedLugarId
		? ciclos.filter((c) => c.lugarId?.toString() === selectedLugarId?.toString())
		: [];
</script>

<div class="space-y-1">
	<label
		for="edit-centro-{registroId}"
		class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
		>Centro *</label
	>
	<SearchableSelect
		id="edit-centro-{registroId}"
		name="lugarId"
		bind:value={selectedLugarId}
		required
		placeholder="Centro..."
		options={centros.map((c) => ({ value: c.id, label: c.nombre }))}
	/>
</div>

<div class="space-y-1">
	<label
		for="edit-ciclo-{registroId}"
		class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
		>Ciclo</label
	>
	<SearchableSelect
		id="edit-ciclo-{registroId}"
		name="cicloId"
		bind:value={selectedCicloId}
		disabled={!selectedLugarId || ciclosDisponibles.length === 0}
		placeholder="-- Sin ciclo --"
		options={ciclosDisponibles.map((c) => ({
			value: c.id,
			label: c.nombre
		}))}
	/>
</div>