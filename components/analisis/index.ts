// Exportar todos los componentes de análisis
export { SeriesConfigPanel } from "./series-config-panel"
export { StatsCards } from "./stats-cards"
export { AnalysisChart } from "./analysis-chart"
export { SigmoidModelCard } from "./sigmoid-model-card"

// Exportar tipos y utilidades
export {
    SERIES_COLORS,
    getSerieNombre,
    calculateStats,
    calculateSigmoid,
} from "./types"

export type {
    SeriesConfig,
    SeriesData,
    SeriesStats,
    SigmoidParams,
    FilterData,
} from "./types"
