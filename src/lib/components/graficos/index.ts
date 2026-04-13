// Exportaciones del módulo de gráficos
export { default as DashboardGraficos } from './DashboardGraficos.svelte';
export { default as FiltrosPanel } from './FiltrosPanel.svelte';
export { default as FiltrosPanelHeader } from './FiltrosPanelHeader.svelte';
export { default as GraficoEvolucion } from './GraficoEvolucion.svelte';
export { default as EstadisticasPanel } from './EstadisticasPanel.svelte';
export { default as TipoMedicionButton } from './TipoMedicionButton.svelte';

// Colores y mapeo de tipos
export { SERIES_COLORS, buildTipoColorMap } from './seriesColors';

// Filtrado de entidades
export { filterCentrosByUser, filterCiclosByCentro } from './filtroEntidades';

// Filtrado de registros
export { filterRegistros } from './filtroRegistros';

// Validación de selecciones
export { isCentroValido, isCicloValido } from './validacionSelecciones';

// Utilidades del dashboard
export { buildChartSeries, calculateStats } from './dashboardUtils';

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