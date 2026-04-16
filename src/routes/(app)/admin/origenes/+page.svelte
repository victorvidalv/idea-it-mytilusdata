<script lang="ts">
	import { enhance } from '$app/forms';
	import toast from 'svelte-french-toast';
	import AccessDenied from '$lib/components/tipos-medicion/AccessDenied.svelte';
	import OrigenesContent from './_components/OrigenesContent.svelte';

	import type { SubmitFunction } from '@sveltejs/kit';

	export let data: import('./$types').PageData;
	export let form: import('./$types').ActionData;

	let showForm = false;
	let editingId: number | null = null;
	let editNombre = '';

	function startEdit(origen: { id: number; nombre: string }) {
		editingId = origen.id;
		editNombre = origen.nombre;
	}

	function cancelEdit() {
		editingId = null;
	}

	function toggleForm() {
		showForm = !showForm;
	}

	function handleSuccess(message: string | undefined): void {
		toast.success(message || 'Operación exitosa');
		showForm = false;
		editingId = null;
	}

	function handleFailure(message: string | undefined): void {
		toast.error(message || 'Ocurrió un error');
	}

	const handleAction: SubmitFunction = () => {
		return async ({ result, update }) => {
			const message = result.data?.message;
			
			if (result.type === 'success') {
				handleSuccess(message);
				await update();
			} else if (result.type === 'failure') {
				handleFailure(message);
			}
		};
	};

	$: if (form?.error) {
		toast.error(form.message);
	}
</script>

<svelte:head>
	<title>Orígenes de Datos | MytilusData</title>
</svelte:head>

{#if !data.authorized}
	<AccessDenied />
{:else}
	<OrigenesContent
		{showForm}
		{editingId}
		{editNombre}
		origenes={data.origenes}
		onSubmit={handleAction}
		onToggleForm={toggleForm}
		onStartEdit={startEdit}
		onCancelEdit={cancelEdit}
	/>
{/if}