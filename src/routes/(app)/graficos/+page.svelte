<script lang="ts">
	import DashboardGraficos from '$lib/components/graficos/DashboardGraficos.svelte';
	export let data: import('./$types').PageData;
</script>

<svelte:head>
	<title>Gráficos | MytilusData</title>
</svelte:head>

<DashboardGraficos {data} isInvestigador={false} />
