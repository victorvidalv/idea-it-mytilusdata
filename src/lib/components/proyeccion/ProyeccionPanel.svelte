<!--
Componente principal para proyección de crecimiento.
Refactorizado a nivel atómico para cumplir con svelteqa (Complexity < 10).
-->
<script lang="ts">
	import ProyeccionForm from './ProyeccionForm.svelte';
	import ProyeccionResultados from './ProyeccionResultados.svelte';
	import GraficoEmptyState from '$lib/components/graficos/GraficoEmptyState.svelte';
	import * as Actions from './ProyeccionPanelActions';
    import { agregarPunto, eliminarPunto } from './ProyeccionPanelState';
    import type { Lugar, Ciclo, ResultadoProyeccion } from './ProyeccionComponentTypes';

	interface Props { lugares: Lugar[]; ciclos: Ciclo[]; }

	let { lugares, ciclos }: Props = $props();

	let dias = $state<number[]>([]);
	let tallas = $state<number[]>([]);
	let tallaObjetivo = $state('');
	let cargando = $state(false);
	let error = $state('');
	let resultado = $state<ResultadoProyeccion | null>(null);

	let hayProyeccion = $derived(!!(resultado?.success && resultado.proyeccion?.length));

	function handleAgregarPunto(dia: number, talla: number) {
        const res = agregarPunto(dias, tallas, dia, talla);
		dias = res.dias; tallas = res.tallas;
		resultado = null;
	}

	function handleEliminarPunto(dia: number) {
        const res = eliminarPunto(dias, tallas, dia);
		dias = res.dias; tallas = res.tallas;
		resultado = null;
	}

	function handleUsarMediciones(mediciones: { dia: number; talla: number }[]) {
		dias = mediciones.map((m) => m.dia);
		tallas = mediciones.map((m) => m.talla);
		resultado = null;
	}

	async function handleEjecutarProyeccion() {
		if (dias.length < 3) { error = 'Se requieren al menos 3 puntos de datos'; return; }
		cargando = true; error = '';
		try {
			resultado = await Actions.ejecutarProyeccion(dias, tallas, tallaObjetivo);
			if (!resultado.success) error = resultado.error || 'Error en proyección';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error de conexión';
		} finally { cargando = false; }
	}
</script>

<div class="space-y-6">
	<ProyeccionForm
		{lugares} {ciclos} {dias} {tallas} bind:tallaObjetivo {error} {cargando}
		onAgregarPunto={handleAgregarPunto}
		onEliminarPunto={handleEliminarPunto}
		onUsarMedicionesCargadas={handleUsarMediciones}
		onEjecutarProyeccion={handleEjecutarProyeccion}
	/>

	{#if hayProyeccion}
		<ProyeccionResultados
			proyeccion={resultado!.proyeccion || []}
			curvaUsada={resultado!.curvaUsada}
			curvaReferencia={resultado!.curvaReferencia}
			meta={resultado!.metadatos?.tallaObjetivo}
			metadatos={resultado!.metadatos}
			mediciones={dias.map((d, i) => ({ dia: d, talla: tallas[i] }))}
			onExportar={() => Actions.exportarCSV(resultado!)}
		/>
	{:else if !cargando}
		<GraficoEmptyState isInvestigador={false} />
	{/if}
</div>
