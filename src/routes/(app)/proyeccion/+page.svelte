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

<div class="space-y-6">
	<!-- Encabezado -->
	<div class="animate-fade-up flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
		<div>
			<p
				class="mb-2 font-body text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase"
			>
				Análisis
			</p>
			<h1 class="font-display text-3xl leading-tight text-foreground md:text-4xl">
				Proyección de <span class="text-gradient-ocean">Crecimiento</span>
			</h1>
			<p class="mt-2 font-body text-sm text-muted-foreground">
				Ingresa los datos de tus mediciones y proyecta el crecimiento de tus moluscos
				basándote en las curvas de nuestra biblioteca.
			</p>
		</div>
	</div>

	<div>
		<ProyeccionPanel lugares={data.lugares} ciclos={data.ciclos} />
	</div>
</div>
