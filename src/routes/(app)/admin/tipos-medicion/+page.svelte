<script lang="ts">
	import { enhance } from '$app/forms';
	import toast from 'svelte-french-toast';
	import AccessDenied from '$lib/components/tipos-medicion/AccessDenied.svelte';
	import TiposMedicionContent from './_components/TiposMedicionContent.svelte';

	import type { SubmitFunction } from '@sveltejs/kit';

	export let data: import('./$types').PageData;
	export let form: import('./$types').ActionData;

	let showForm = false;
	let editingId: number | null = null;
	let editCodigo = '';
	let editUnidad = '';

	function startEdit(tipo: { id: number; codigo: string; unidadBase: string }) {
		editingId = tipo.id;
		editCodigo = tipo.codigo;
		editUnidad = tipo.unidadBase;
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
	<title>Tipos de Medición | MytilusData</title>
</svelte:head>

{#if !data.authorized}
	<AccessDenied />
{:else}
	<TiposMedicionContent
		{showForm}
		{editingId}
		{editCodigo}
		{editUnidad}
		tipos={data.tipos}
		onSubmit={handleAction}
		onToggleForm={toggleForm}
		onStartEdit={startEdit}
		onCancelEdit={cancelEdit}
	/>
{/if}