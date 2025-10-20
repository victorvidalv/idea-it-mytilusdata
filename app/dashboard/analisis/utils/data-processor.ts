import { Medicion } from "@/lib/types"

// Tipos para datos procesados
export interface ProcessedDataPoint {
    dia: number
    valor: number
    fecha: string
}

// Procesar datos de mediciones para análisis
export function procesarDatosMediciones(
    mediciones: Medicion[],
    fechaMinima?: Date
): ProcessedDataPoint[] {
    // Ordenar mediciones por fecha
    const sorted = [...mediciones].sort(
        (a, b) => new Date(a.fecha_medicion).getTime() - new Date(b.fecha_medicion).getTime()
    )

    // Determinar fecha mínima si no se proporciona
    const fechaMin = fechaMinima || new Date(sorted[0].fecha_medicion)
    fechaMin.setHours(0, 0, 0, 0)

    // Procesar cada medición
    return sorted.map((m) => {
        const fechaMedicion = new Date(m.fecha_medicion)
        fechaMedicion.setHours(0, 0, 0, 0)
        
        // Calcular días desde fecha mínima
        const dia = Math.round(
            (fechaMedicion.getTime() - fechaMin.getTime()) / (1000 * 60 * 60 * 24)
        )

        return {
            dia,
            valor: Number(m.valor),
            fecha: new Date(m.fecha_medicion).toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "short"
            })
        }
    })
}

// Obtener fecha mínima de un conjunto de mediciones
export function obtenerFechaMinima(mediciones: Medicion[]): Date {
    if (mediciones.length === 0) {
        return new Date()
    }

    const sorted = [...mediciones].sort(
        (a, b) => new Date(a.fecha_medicion).getTime() - new Date(b.fecha_medicion).getTime()
    )

    const fechaMinima = new Date(sorted[0].fecha_medicion)
    fechaMinima.setHours(0, 0, 0, 0)
    return fechaMinima
}
