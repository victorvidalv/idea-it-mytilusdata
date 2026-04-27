<script lang="ts">
	import { enhance } from '$app/forms';
	import toast from 'svelte-french-toast';
	import AccessDenied from '$lib/components/tipos-medicion/AccessDenied.svelte';
	import BibliotecaContent from './_components/BibliotecaContent.svelte';

	import type { SubmitFunction } from '@sveltejs/kit';

	export let data: import('./$types').PageData;
	export let form: import('./$types').ActionData;

	let isLoading = false;

	function handleSuccess(message: string | undefined): void {
		toast.success(message || 'Operación exitosa');
		isLoading = false;
	}

	function handleFailure(message: string | undefined): void {
		toast.error(message || 'Ocurrió un error');
		isLoading = false;
	}

	const handleAction: SubmitFunction = () => {
		isLoading = true;
		return async ({ result, update }) => {
			if (result.type === 'success') {
				const data = result.data as { message?: string; error?: string } | undefined;
				handleSuccess(data?.message || data?.error);
				await update();
			} else if (result.type === 'failure') {
				const data = result.data as { message?: string; error?: string } | undefined;
				handleFailure(data?.message || data?.error);
			} else {
				isLoading = false;
			}
		};
	};

	$: if (form?.error) {
		toast.error(form.error);
	}

	$: if (form?.success && form.message) {
		toast.success(form.message);
	}
</script>

<svelte:head>
	<title>Biblioteca de Curvas | MytilusData</title>
</svelte:head>

{#if !data.authorized}
	<AccessDenied />
{:else}
	<BibliotecaContent
		records={data.records}
		{isLoading}
		onSubmit={handleAction}
	/>
{/if}