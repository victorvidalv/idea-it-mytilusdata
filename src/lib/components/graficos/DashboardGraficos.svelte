<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import FiltrosPanel from './FiltrosPanel.svelte';
	import GraficoEvolucion from './GraficoEvolucion.svelte';
	import EstadisticasPanel from './EstadisticasPanel.svelte';
	import { buildTipoColorMap, filterCentrosByUser, filterCiclosByCentro, filterRegistros, isCentroValido, isCicloValido } from './index';
	import type { DashboardData, ChartSeriesItem, Stats, Registro, TipoRegistro, TipoEstadistica } from './types';

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

	// --- Funciones auxiliares extraídas ---
	function buildChartSeries(
		tipos: TipoRegistro[],
		registros: Registro[],
		colorMap: Map<number, string>
	): ChartSeriesItem[] {
		return tipos
			.map((tipo) => {
				const tipoData = registros
					.filter((r) => r.tipoId === tipo.id)
					.map((r) => ({
						date: new Date(r.fechaMedicion),
						value: r.valor
					}))
					.sort((a, b) => a.date.getTime() - b.date.getTime());

				if (tipoData.length === 0) return null;

				return {
					key: tipo.codigo,
					label: `${tipo.codigo} (${tipo.unidadBase})`,
					data: tipoData,
					color: colorMap.get(tipo.id) ?? 'oklch(0.55 0.18 200)'
				};
			})
			.filter(Boolean) as ChartSeriesItem[];
	}

	function calculateStats(registros: Registro[], tipos: TipoRegistro[]): Stats {
		if (registros.length === 0) {
			return { total: 0, porTipo: [] };
		}

		const porTipo = tipos
			.map((tipo) => {
				const valores = registros
					.filter((r) => r.tipoId === tipo.id)
					.map((r) => r.valor);

				if (valores.length === 0) {
					return {
						codigo: tipo.codigo,
						unidad: tipo.unidadBase,
						promedio: 0,
						min: 0,
						max: 0,
						cuenta: 0
					};
				}

				return {
					codigo: tipo.codigo,
					unidad: tipo.unidadBase,
					promedio: Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 100) / 100,
					min: Math.round(Math.min(...valores) * 100) / 100,
					max: Math.round(Math.max(...valores) * 100) / 100,
					cuenta: valores.length
				};
			})
			.filter((s: TipoEstadistica) => s.cuenta > 0);

		return { total: registros.length, porTipo };
	}
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