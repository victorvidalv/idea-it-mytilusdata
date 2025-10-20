import { SeriesData, SeriesStats, SigmoidParams, calculateStats, calculateSigmoid } from "@/components/analisis"

// Calcular estadísticas de la serie principal
export function calcularEstadisticas(seriesData: SeriesData[]): SeriesStats | null {
    if (seriesData.length === 0) return null
    return calculateStats(seriesData[0].data)
}

// Calcular parámetros de sigmoide de la serie principal
export function calcularSigmoide(seriesData: SeriesData[]): SigmoidParams | null {
    if (seriesData.length === 0) return null
    return calculateSigmoid(seriesData[0].data)
}

// Preparar datos combinados para el gráfico
export function prepararDatosGrafico(seriesData: SeriesData[]): Record<string, number | string | null>[] {
    if (seriesData.length === 0) return []

    // Obtener todos los días únicos
    const allDays = new Set<number>()
    seriesData.forEach(series => {
        series.data.forEach(d => allDays.add(d.dia))
    })

    // Ordenar días
    const days = Array.from(allDays).sort((a, b) => a - b)

    // Crear puntos de datos para el gráfico
    return days.map(dia => {
        const point: Record<string, number | string | null> = { dia }
        seriesData.forEach((series, idx) => {
            const dataPoint = series.data.find(d => d.dia === dia)
            point[`valor_${idx}`] = dataPoint?.valor ?? null
        })
        return point
    })
}
