<script lang="ts">
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';

	export let registroId: number;
	export let tipos: Array<{ id: number; codigo: string; unidadBase: string }>;
	export let origenes: Array<{ id: number; nombre: string }>;
	export let selectedTipoId: string;
	export let selectedOrigenId: string;
	export let valor: string;
	export let fechaMedicion: string;
	export let notas: string;

	// Unidad del tipo seleccionado
	$: unidad = selectedTipoId
		? tipos.find((t) => t.id?.toString() === selectedTipoId?.toString())?.unidadBase
		: '';
</script>

<div class="space-y-1">
	<label
		for="edit-tipo-{registroId}"
		class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
		>Tipo *</label
	>
	<SearchableSelect
		id="edit-tipo-{registroId}"
		name="tipoId"
		bind:value={selectedTipoId}
		required
		placeholder="Tipo..."
		options={tipos.map((t) => ({
			value: t.id,
			label: `${t.codigo} (${t.unidadBase})`
		}))}
	/>
</div>

<div class="space-y-1">
	<label
		for="edit-valor-{registroId}"
		class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
		>Valor * {unidad ? `(${unidad})` : ''}</label
	>
	<input
		id="edit-valor-{registroId}"
		name="valor"
		type="number"
		step="0.001"
		bind:value={valor}
		required
		placeholder="0.00"
		class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
	/>
</div>

<div class="space-y-1">
	<label
		for="edit-origen-{registroId}"
		class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
		>Origen *</label
	>
	<SearchableSelect
		id="edit-origen-{registroId}"
		name="origenId"
		bind:value={selectedOrigenId}
		required
		placeholder="Origen..."
		options={origenes.map((o) => ({ value: o.id, label: o.nombre }))}
	/>
</div>

<div class="space-y-1">
	<label
		for="edit-fecha-{registroId}"
		class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
		>Fecha *</label
	>
	<input
		id="edit-fecha-{registroId}"
		name="fechaMedicion"
		type="datetime-local"
		bind:value={fechaMedicion}
		required
		class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
	/>
</div>

<div class="space-y-1 lg:col-span-3">
	<label
		for="edit-notas-{registroId}"
		class="block font-body text-[10px] font-medium tracking-wider text-muted-foreground uppercase"
		>Notas</label
	>
	<input
		id="edit-notas-{registroId}"
		name="notas"
		type="text"
		bind:value={notas}
		placeholder="Observaciones..."
		class="h-9 w-full rounded-lg border border-border/60 bg-background px-3 font-body text-sm focus:border-ocean-light focus:ring-2 focus:ring-ocean-light/20 focus:outline-none"
	/>
</div>