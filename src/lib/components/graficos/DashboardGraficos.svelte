<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import FiltrosPanel from './FiltrosPanel.svelte';
	import GraficoEvolucion from './GraficoEvolucion.svelte';
	import EstadisticasPanel from './EstadisticasPanel.svelte';
	import {
		buildTipoColorMap,
		filterCentrosByUser,
		filterCiclosByCentro,
		filterRegistros,
		validarSelecciones
	} from './index';
	import { buildChartSeries, calculateStats } from './dashboardUtils';
	import type { DashboardData, ChartSeriesItem, TipoRegistro } from './types';

	// --- Props del componente ---
	interface Props {
		data: DashboardData;
		isInvestigador?: boolean;
	}

	let { data, isInvestigador = false }: Props = $props();

	// --- Estado de filtros ---
	let selectedUserId = $state(isInvestigador ? '' : 'all');
	let selectedCentroId = $state(0);
	let selectedCicloId = $state(0);
	let selectedTipoIds = new SvelteSet<number>();

	// --- Mapa de colores estable ---
	let tipoColorMap = $derived(buildTipoColorMap(data.tipos));

	function getColorForTipo(tipoId: number): string {
		return tipoColorMap.get(tipoId) ?? 'oklch(0.55 0.18 200)';
	}

	// --- Datos filtrados en cascada ---
	let centrosFiltrados = $derived(filterCentrosByUser(data.centros, selectedUserId));
	let ciclosFiltrados = $derived(filterCiclosByCentro(data.ciclos, selectedCentroId));

	// --- Validación y reset de selecciones inválidas ---
	$effect(() => {
		const resultado = validarSelecciones(
			centrosFiltrados,
			ciclosFiltrados,
			selectedUserId,
			selectedCentroId,
			selectedCicloId
		);

		if (resultado.resetCentro) {
			selectedCentroId = 0;
			selectedCicloId = 0;
		} else if (resultado.resetCiclo) {
			selectedCicloId = 0;
		}
	});

	// --- Filtrar registros ---
	let registrosFiltrados = $derived(
		filterRegistros(data.registros, {
			selectedUserId,
			selectedCentroId,
			selectedCicloId,
			selectedTipoIds
		})
	);

	// --- Preparar datos para el gráfico ---
	let tiposActivos = $derived(data.tipos.filter((t: TipoRegistro) => selectedTipoIds.has(t.id)));

	let chartSeries = $derived(buildChartSeries(tiposActivos, registrosFiltrados, tipoColorMap));

	let hayDatos = $derived(
		chartSeries.length > 0 && chartSeries.some((s: ChartSeriesItem) => s.data.length > 0)
	);

	// --- Estadísticas rápidas ---
	let stats = $derived(calculateStats(registrosFiltrados, tiposActivos));

	// --- Última medición ---
	let ultimaMedicion = $derived(
		registrosFiltrados.length > 0 ? registrosFiltrados[registrosFiltrados.length - 1] : null
	);
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
	<GraficoEvolucion {isInvestigador} {chartSeries} {hayDatos} {registrosFiltrados} />

	<!-- Estadísticas Rápidas -->
	<EstadisticasPanel {isInvestigador} {stats} {ultimaMedicion} />
</div>
