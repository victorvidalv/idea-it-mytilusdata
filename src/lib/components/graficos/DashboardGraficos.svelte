<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import FiltrosPanel from './FiltrosPanel.svelte';
	import GraficoEvolucion from './GraficoEvolucion.svelte';
	import EstadisticasPanel from './EstadisticasPanel.svelte';
	import { buildTipoColorMap, filterCentrosByUser, filterCiclosByCentro, filterRegistros, isCentroValido, isCicloValido } from './index';
	import { buildChartSeries, calculateStats } from './dashboardUtils';
	import type { DashboardData, ChartSeriesItem, Stats, Registro, TipoRegistro } from './types';

	// --- Props del componente ---
	export let data: DashboardData;
	export let isInvestigador: boolean = false;

	// --- Estado de filtros ---
	let selectedUserId: string = isInvestigador ? '' : 'all';
	let selectedCentroId: number = 0;
	let selectedCicloId: number = 0;
	let selectedTipoIds = new SvelteSet<number>();

	// --- Mapa de colores estable ---
	$: tipoColorMap = buildTipoColorMap(data.tipos);

	function getColorForTipo(tipoId: number): string {
		return tipoColorMap.get(tipoId) ?? 'oklch(0.55 0.18 200)';
	}

	// --- Datos filtrados en cascada ---
	$: centrosFiltrados = filterCentrosByUser(data.centros, selectedUserId);
	$: ciclosFiltrados = filterCiclosByCentro(data.ciclos, selectedCentroId);

	// --- Validación y reset de selecciones inválidas ---
	$: if (selectedUserId) {
		if (selectedCentroId && !isCentroValido(centrosFiltrados, selectedCentroId)) {
			selectedCentroId = 0;
			selectedCicloId = 0;
		}
	}

	$: if (selectedCentroId && !isCicloValido(ciclosFiltrados, selectedCicloId)) {
		selectedCicloId = 0;
	}

	// --- Filtrar registros ---
	$: registrosFiltrados = filterRegistros(data.registros, {
		selectedUserId,
		selectedCentroId,
		selectedCicloId,
		selectedTipoIds
	});

	// --- Preparar datos para el gráfico ---
	$: tiposActivos = data.tipos.filter((t: TipoRegistro) => selectedTipoIds.has(t.id));

	$: chartSeries = buildChartSeries(tiposActivos, registrosFiltrados, tipoColorMap);

	$: hayDatos = chartSeries.length > 0 && chartSeries.some((s) => s.data.length > 0);

	// --- Estadísticas rápidas ---
	$: stats = calculateStats(registrosFiltrados, tiposActivos);

	// --- Última medición ---
	$: ultimaMedicion = registrosFiltrados.length > 0 
		? registrosFiltrados[registrosFiltrados.length - 1] 
		: null;
</script>

<div class="space-y-6">
	<!-- Panel de Filtros y Encabezado -->
	<FiltrosPanel
		{isInvestigador}
		usuarios={data.usuarios}
		bind:selectedUserId
		bind:selectedCentroId
		bind:selectedCicloId
		bind:selectedTipoIds
		{centrosFiltrados}
		{ciclosFiltrados}
		tipos={data.tipos}
		{getColorForTipo}
	/>

	<!-- Gráfico Principal -->
	<GraficoEvolucion
		{isInvestigador}
		{chartSeries}
		{hayDatos}
		{registrosFiltrados}
	/>

	<!-- Estadísticas Rápidas -->
	<EstadisticasPanel
		{isInvestigador}
		{stats}
		{ultimaMedicion}
	/>
</div>