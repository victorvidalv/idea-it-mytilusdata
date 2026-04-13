<script lang="ts">
	import SearchableSelect from '$lib/components/SearchableSelect.svelte';

	export let tipos: Array<{ id: number; codigo: string; unidadBase: string }>;
	export let origenes: Array<{ id: number; nombre: string }>;
	export let selectedTipoId: string;
	export let selectedOrigenId: string;
	export let valor: string;
	export let fechaMedicion: string;
	export let notas: string;

	$: unidadSeleccionada = selectedTipoId
		? tipos.find((t) => t.id.toString() === selectedTipoId.toString())?.unidadBase
		: '';
</script>

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
				options={tipos.map((t) => ({
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
			options={origenes.map((o) => ({ value: o.id, label: o.nombre }))}
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