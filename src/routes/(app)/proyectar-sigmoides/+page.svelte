<!--
Página de proyección de crecimiento para usuarios autenticados.
Permite al usuario ingresar sus datos y proyectar el crecimiento
mediante ajuste logístico y perfiles históricos de referencia.
-->
<script lang="ts">
	import ProyeccionPanel from '$lib/components/calculo-sigmoides-similares/ProyeccionPanel.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Proyectar Sigmoides | MytilusData</title>
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
				Proyectar <span class="text-gradient-ocean">Sigmoides</span>
			</h1>
			<p class="mt-2 font-body text-sm text-muted-foreground">
				Ingresa al menos cinco mediciones día-talla para estimar una curva logística, compararla con
				perfiles históricos y visualizar el rango esperado de crecimiento.
			</p>
		</div>
	</div>

	<div>
		<ProyeccionPanel lugares={data.lugares} ciclos={data.ciclos} />
	</div>
</div>
