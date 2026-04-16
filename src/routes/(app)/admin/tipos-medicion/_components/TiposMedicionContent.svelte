<script lang="ts">
	import TipoMedicionCreateForm from '$lib/components/tipos-medicion/TipoMedicionCreateForm.svelte';
	import TiposMedicionPageHeader from '$lib/components/tipos-medicion/TiposMedicionPageHeader.svelte';
	import TiposMedicionTable from '$lib/components/tipos-medicion/TiposMedicionTable.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let showForm: boolean;
	export let editingId: number | null;
	export let editCodigo: string;
	export let editUnidad: string;
	export let tipos: Array<{ id: number; codigo: string; unidadBase: string }>;
	export let onSubmit: SubmitFunction;
	export let onToggleForm: () => void;
	export let onStartEdit: (tipo: { id: number; codigo: string; unidadBase: string }) => void;
	export let onCancelEdit: () => void;
</script>

<div class="space-y-6">
	<TiposMedicionPageHeader {showForm} onToggle={onToggleForm} />

	{#if showForm}
		<TipoMedicionCreateForm onSubmit={onSubmit} />
	{/if}

	<TiposMedicionTable
		{tipos}
		{editingId}
		{editCodigo}
		{editUnidad}
		{onStartEdit}
		{onCancelEdit}
		{onSubmit}
	/>
</div>