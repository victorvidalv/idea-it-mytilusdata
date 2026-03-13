<script lang="ts">
	import toast from 'svelte-french-toast';
	import CicloCreateForm from '$lib/components/ciclos/CicloCreateForm.svelte';
	import CiclosPageHeader from '$lib/components/ciclos/CiclosPageHeader.svelte';
	import CiclosNoCentrosAlert from '$lib/components/ciclos/CiclosNoCentrosAlert.svelte';
	import CiclosEmptyState from '$lib/components/ciclos/CiclosEmptyState.svelte';
	import CiclosGrid from '$lib/components/ciclos/CiclosGrid.svelte';

	export let data: import('./$types').PageData;
	export let form: import('./$types').ActionData;

	let showForm = false;

	$: handleFormResult(form);

	function handleFormResult(formData: typeof form) {
		if (!formData) return;
		if (formData.success) {
			toast.success('¡Operación exitosa! ' + (formData.message || ''));
			showForm = false;
		} else if (formData.error) {
			toast.error('Error: ' + (formData.message || ''));
		}
	}

	// Estadísticas
	$: activos = data.ciclos.filter((c: { activo: boolean | null }) => c.activo).length;
	$: finalizados = data.ciclos.filter((c: { activo: boolean | null }) => !c.activo).length;
</script>

<svelte:head>
	<title>Ciclos Productivos | MytilusData</title>
</svelte:head>

<div class="space-y-8">
	<CiclosPageHeader
		{activos}
		{finalizados}
		canViewAll={data.canViewAll}
		centrosCount={data.centros.length}
		{showForm}
		onToggleForm={() => (showForm = !showForm)}
	/>

	{#if data.centros.length === 0}
		<CiclosNoCentrosAlert />
	{/if}

	{#if showForm && data.centros.length > 0}
		<CicloCreateForm {data} onCancel={() => (showForm = false)} />
	{/if}

	{#if data.ciclos.length === 0 && data.centros.length > 0}
		<CiclosEmptyState />
	{:else if data.ciclos.length > 0}
		<CiclosGrid ciclos={data.ciclos} canViewAll={data.canViewAll} />
	{/if}
</div>