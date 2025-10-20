import { Lugar, Unidad, TipoRegistro } from "@/lib/types"

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
