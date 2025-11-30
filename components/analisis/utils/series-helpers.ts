import { Lugar, Unidad, TipoRegistro, Ciclo } from "@/lib/types"
import type { SeriesConfig } from "../types"

// Obtener nombre descriptivo de una serie
export function getSerieNombre(
    s: SeriesConfig,
    lugares: Lugar[],
    unidades: Unidad[],
    tipos: TipoRegistro[],
    ciclos: Ciclo[],
    tCommon?: (key: string) => string
): string {
    const parts = []

    if (s.lugarId) {
        if (s.lugarId === "all") {
            parts.push(tCommon ? tCommon('allPlaces') : "Todos los lugares")
        } else {
            const lugar = lugares.find(l => l.id.toString() === s.lugarId)
            if (lugar) parts.push(lugar.nombre)
        }
    }

    if (s.cicloId) {
        if (s.cicloId === "all") {
            parts.push(tCommon ? tCommon('allCycles') : "Todos los ciclos")
        } else {
            const ciclo = ciclos.find(c => c.id.toString() === s.cicloId)
            if (ciclo) parts.push(ciclo.nombre)
        }
    }

    if (s.unidadId) {
        if (s.unidadId === "all") {
            parts.push(tCommon ? tCommon('allUnits') : "Todas las unidades")
        } else {
            const unidad = unidades.find(u => u.id.toString() === s.unidadId)
            if (unidad) parts.push(`${unidad.nombre} (${unidad.sigla})`)
        }
    }

    if (s.tipoId) {
        if (s.tipoId === "all") {
            parts.push(tCommon ? tCommon('allRecordTypes') : "Todos los tipos")
        } else {
            const tipo = tipos.find(t => t.id.toString() === s.tipoId)
            if (tipo) parts.push(tipo.descripcion || tipo.codigo)
        }
    }

    return parts.length > 0 ? parts.join(" - ") : (tCommon ? tCommon('noFilters') : "Sin filtros")
}
