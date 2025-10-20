import { Lugar, Unidad, TipoRegistro } from "@/lib/types"
import type { SeriesConfig } from "../types"

// Obtener nombre descriptivo de una serie
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
