import type { SeriesStats } from "../types"

// Calcular estadísticas de una serie de datos
export function calculateStats(data: { valor: number; dia: number }[]): SeriesStats | null {
    if (data.length === 0) return null

    const valores = data.map(d => d.valor)
    return {
        total: valores.length,
        min: Math.min(...valores),
        max: Math.max(...valores),
        promedio: valores.reduce((a, b) => a + b, 0) / valores.length,
        diasTotales: data[data.length - 1]?.dia || 0
    }
}
