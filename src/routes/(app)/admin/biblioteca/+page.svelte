<script lang="ts">
	import toast from 'svelte-french-toast';
	import AccessDenied from '$lib/components/tipos-medicion/AccessDenied.svelte';
	import BibliotecaContent from './_components/BibliotecaContent.svelte';
	import { createBibliotecaAction } from './page-utils';

	let { data, form } = $props<{
		data: import('./$types').PageData;
		form: import('./$types').ActionData;
	}>();

	let isLoading = $state(false);
	let isLoadingRef = { value: false };
	let handleAction = createBibliotecaAction(isLoadingRef);

	$effect(() => {
		isLoading = isLoadingRef.value;
	});

	$effect(() => {
		if (form?.error) {
			toast.error(form.error);
		}
	});

	$effect(() => {
		if (form?.success && form.message) {
			toast.success(form.message);
		}
	});
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