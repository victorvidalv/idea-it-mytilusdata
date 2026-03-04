// Exportaciones del módulo de gráficos
export { default as DashboardGraficos } from './DashboardGraficos.svelte';
export { default as FiltrosPanel } from './FiltrosPanel.svelte';
export { default as GraficoEvolucion } from './GraficoEvolucion.svelte';
export { default as EstadisticasPanel } from './EstadisticasPanel.svelte';

// Utilidades de filtrado
export {
	SERIES_COLORS,
	buildTipoColorMap,
	filterCentrosByUser,
	filterCiclosByCentro,
	filterRegistros,
	isCentroValido,
	isCicloValido
} from './filtroUtils';

// Tipos
export type {
	TipoRegistro,
	Centro,
	Ciclo,
	Registro,
	Usuario,
	DashboardData,
	TipoEstadistica,
	ChartSeriesItem,
	FiltrosState,
	Stats
} from './types';