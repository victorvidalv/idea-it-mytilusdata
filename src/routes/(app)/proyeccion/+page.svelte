<!--
Página de proyección de crecimiento para usuarios autenticados.
Permite al usuario ingresar sus datos y proyectar el crecimiento
basándose en la curva más similar de la biblioteca.
-->
<script lang="ts">
	import ProyeccionPanel from '$lib/components/proyeccion/ProyeccionPanel.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Proyección de Crecimiento | MytilusData</title>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<div class="mb-8 space-y-2">
		<h1 class="font-display text-3xl font-bold tracking-tight text-foreground">
			Proyección de Crecimiento
		</h1>
		<p class="text-muted-foreground">
			Ingresa los datos de tus mediciones y proyecta el crecimiento de tus moluscos
			basándote en las curvas de nuestra biblioteca.
		</p>
	</div>

	<ProyeccionPanel lugares={data.lugares} ciclos={data.ciclos} />
</div>
