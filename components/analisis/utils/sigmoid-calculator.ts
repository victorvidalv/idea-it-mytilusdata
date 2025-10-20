import type { SigmoidParams } from "../types"

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
