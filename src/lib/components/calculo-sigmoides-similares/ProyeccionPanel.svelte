<!--
Componente principal para proyección de crecimiento.
Refactorizado a nivel atómico para cumplir con svelteqa (Complexity < 10).
-->
<script lang="ts">
	import ProyeccionForm from './ProyeccionForm.svelte';
	import ProyeccionResultados from './ProyeccionResultados.svelte';
	import ProyeccionEstadoInicial from './ProyeccionEstadoInicial.svelte';
	import ProyeccionDataQuality from './ProyeccionDataQuality.svelte';
	import * as Actions from './ProyeccionPanelActions';
	import { agregarPunto, eliminarPunto } from './ProyeccionPanelState';
	import type { Lugar, Ciclo, ResultadoProyeccion, ModeloPrediccion } from './ProyeccionComponentTypes';

	interface Props {
		lugares: Lugar[];
		ciclos: Ciclo[];
	}

	let { lugares, ciclos }: Props = $props();

	let fechas = $state<string[]>([]);
	let tallas = $state<number[]>([]);
	let tallaObjetivo = $state('');
	let modeloSeleccionado = $state('');
	let modelosDisponibles = $state<ModeloPrediccion[]>([]);
	let horizon = $state(90);
	let cargando = $state(false);
	let error = $state('');
	let resultado = $state<ResultadoProyeccion | null>(null);

	const MIN_PUNTOS_PROYECCION = 5;
	let hayProyeccion = $derived(!!(resultado?.success && resultado.proyeccion?.length));

	// Calcular días relativos desde la primera fecha para mostrar en UI
	function calcularDiasDesdePrimeraFecha(fechas: string[]): number[] {
		if (fechas.length === 0) return [];
		const fechaInicio = new Date(fechas[0] + 'T00:00:00Z');
		return fechas.map((f) => {
			const fecha = new Date(f + 'T00:00:00Z');
			return Math.round((fecha.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
		});
	}

	let dias = $derived(calcularDiasDesdePrimeraFecha(fechas));

	// Cargar modelos al montar
	$effect(() => {
		Actions.obtenerModelosPrediccion()
			.then((m) => { modelosDisponibles = m; })
			.catch(() => { modelosDisponibles = []; });
	});

	function handleAgregarPunto(fecha: string, talla: number) {
		const res = agregarPunto(fechas, tallas, fecha, talla);
		fechas = res.fechas;
		tallas = res.tallas;
		resultado = null;
	}

	function handleEliminarPunto(fecha: string) {
		const res = eliminarPunto(fechas, tallas, fecha);
		fechas = res.fechas;
		tallas = res.tallas;
		resultado = null;
	}

	function handleUsarMediciones(mediciones: { fecha: string; talla: number }[]) {
		fechas = mediciones.map((m) => m.fecha);
		tallas = mediciones.map((m) => m.talla);
		resultado = null;
	}

	async function handleEjecutarProyeccion() {
		if (fechas.length < MIN_PUNTOS_PROYECCION) {
			const faltantes = MIN_PUNTOS_PROYECCION - fechas.length;
			error = `Se requieren al menos ${MIN_PUNTOS_PROYECCION} mediciones para proyectar. Faltan ${faltantes}.`;
			resultado = null;
			return;
		}
		cargando = true;
		error = '';
		try {
			resultado = await Actions.ejecutarProyeccion(fechas, tallas, tallaObjetivo, modeloSeleccionado || undefined, horizon);
			if (!resultado.success) error = resultado.error || 'Error en proyección';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Error de conexión';
		} finally {
			cargando = false;
		}
	}
</script>

<div class="space-y-6">
	<ProyeccionDataQuality {fechas} {tallas} />

	<ProyeccionForm
		{lugares}
		{ciclos}
		{fechas}
		{dias}
		{tallas}
		bind:tallaObjetivo
		bind:modeloSeleccionado
		{modelosDisponibles}
		{error}
		{cargando}
		bind:horizon
		onAgregarPunto={handleAgregarPunto}
		onEliminarPunto={handleEliminarPunto}
		onUsarMedicionesCargadas={handleUsarMediciones}
		onEjecutarProyeccion={handleEjecutarProyeccion}
	/>

	{#if hayProyeccion}
		<ProyeccionResultados
			proyeccion={resultado!.proyeccion || []}
			curvaUsada={resultado!.curvaUsada}
			meta={resultado!.metadatos?.tallaObjetivo}
			metadatos={resultado!.metadatos}
			mediciones={dias.map((d, i) => ({ dia: d, talla: tallas[i] }))}
			incertidumbre={resultado!.incertidumbre}
			degradacionRMSE={resultado!.degradacionRMSE}
			modeloUsado={resultado!.modeloUsado}
			metricas={resultado!.metricas}
			warnings={resultado!.warnings}
			metadata={resultado!.metadata}
			onExportar={() => Actions.exportarCSV(resultado!)}
		/>
	{:else if !cargando}
		<ProyeccionEstadoInicial
			totalPuntos={dias.length}
			minimoPuntos={MIN_PUNTOS_PROYECCION}
			{error}
		/>
	{/if}
</div>
