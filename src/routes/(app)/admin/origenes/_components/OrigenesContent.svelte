<script lang="ts">
	import OrigenCreateForm from '$lib/components/origenes/OrigenCreateForm.svelte';
	import OrigenesPageHeader from '$lib/components/origenes/OrigenesPageHeader.svelte';
	import OrigenesTable from '$lib/components/origenes/OrigenesTable.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';

	export let showForm: boolean;
	export let editingId: number | null;
	export let editNombre: string;
	export let origenes: Array<{ id: number; nombre: string }>;
	export let onSubmit: SubmitFunction;
	export let onToggleForm: () => void;
	export let onStartEdit: (origen: { id: number; nombre: string }) => void;
	export let onCancelEdit: () => void;
</script>

<div class="space-y-6">
	<OrigenesPageHeader {showForm} onToggle={onToggleForm} />

	{#if showForm}
		<OrigenCreateForm onSubmit={onSubmit} />
	{/if}

	<OrigenesTable
		{origenes}
		{editingId}
		{editNombre}
		{onStartEdit}
		{onCancelEdit}
		{onSubmit}
	/>
</div>