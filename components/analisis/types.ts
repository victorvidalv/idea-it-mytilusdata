"use client"

import { Lugar, Unidad, TipoRegistro } from "@/lib/types"

// Colores para las series
export const SERIES_COLORS = [
    "#8b5cf6",  // Violeta
    "#06b6d4",  // Cyan
    "#f97316",  // Naranja
    "#22c55e",  // Verde
    "#ec4899",  // Rosa
]

// Configuración de una serie
export interface SeriesConfig {
    id: string
    lugarId: string
    tipoId: string
    unidadId: string
}

// Datos procesados de una serie
export interface SeriesData {
    id: string
    nombre: string
    color: string
    data: { dia: number; valor: number; fecha: string }[]
}

// Estadísticas
export interface SeriesStats {
    total: number
    min: number
    max: number
    promedio: number
    diasTotales: number
}

// Parámetros de sigmoide
export interface SigmoidParams {
    L: number
    k: number
    x0: number
    minVal: number
    amplitude: number
    rSquared: number
}

// Props comunes
export interface FilterData {
    lugares: Lugar[]
    unidades: Unidad[]
    tipos: TipoRegistro[]
}

// Funciones helper
export function getSerieNombre(
    s: SeriesConfig,
    lugares: Lugar[],
    unidades: Unidad[],
    tipos: TipoRegistro[]
): string {
    const parts = []

    if (s.lugarId) {
        const lugar = lugares.find(l => l.id.toString() === s.lugarId)
        if (lugar) parts.push(lugar.nombre)
    }

    if (s.unidadId) {
        const unidad = unidades.find(u => u.id.toString() === s.unidadId)
        if (unidad) parts.push(`${unidad.nombre} (${unidad.sigla})`)
    }

    if (s.tipoId) {
        const tipo = tipos.find(t => t.id.toString() === s.tipoId)
        if (tipo) parts.push(tipo.descripcion || tipo.codigo)
    }

    return parts.length > 0 ? parts.join(" - ") : "Sin filtros"
}

// Calcular estadísticas
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

// Calcular parámetros de sigmoide
export function calculateSigmoid(data: { valor: number; dia: number }[]): SigmoidParams | null {
    if (data.length < 3) return null

    const valores = data.map(d => d.valor)
    const dias = data.map(d => d.dia)

    const minVal = Math.min(...valores)
    const maxVal = Math.max(...valores)
    const L = maxVal
    const amplitude = L - minVal
    if (amplitude === 0) return null

    // Encontrar x0
    const midValue = minVal + amplitude / 2
    let x0 = dias[Math.floor(dias.length / 2)]
    let minDiff = Infinity
    for (let i = 0; i < valores.length; i++) {
        const diff = Math.abs(valores[i] - midValue)
        if (diff < minDiff) {
            minDiff = diff
            x0 = dias[i]
        }
    }

    // Estimar k
    const nearX0Points = data.filter(d => Math.abs(d.dia - x0) <= 5)
    let k = 0.15
    if (nearX0Points.length >= 2) {
        let sumSlope = 0, countSlope = 0
        for (let i = 1; i < nearX0Points.length; i++) {
            const dx = nearX0Points[i].dia - nearX0Points[i - 1].dia
            const dy = nearX0Points[i].valor - nearX0Points[i - 1].valor
            if (dx !== 0) { sumSlope += dy / dx; countSlope++ }
        }
        if (countSlope > 0) {
            k = Math.abs(4 * (sumSlope / countSlope) / amplitude)
            k = Math.max(0.05, Math.min(k, 1))
        }
    }

    // Calcular R²
    const sigmoid = (x: number) => minVal + amplitude / (1 + Math.exp(-k * (x - x0)))
    const mean = valores.reduce((a, b) => a + b, 0) / valores.length
    const ssRes = data.reduce((sum, point) => sum + Math.pow(point.valor - sigmoid(point.dia), 2), 0)
    const ssTot = data.reduce((sum, point) => sum + Math.pow(point.valor - mean, 2), 0)
    const rSquared = ssTot > 0 ? Math.max(0, 1 - (ssRes / ssTot)) : 0

    return { L, k, x0, minVal, amplitude, rSquared }
}
