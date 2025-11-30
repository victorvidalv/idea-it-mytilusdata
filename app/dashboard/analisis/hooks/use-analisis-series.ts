import { useState, useCallback, useEffect } from "react"
import { Lugar, Unidad, TipoRegistro, Ciclo, Medicion } from "@/lib/types"
import { SeriesConfig, SeriesData, getSerieNombre, SERIES_COLORS } from "@/components/analisis"
import { procesarDatosMediciones } from "../utils/data-processor"

// Interfaz para el retorno del hook
export interface UseAnalisisSeriesReturn {
    series: SeriesConfig[]
    seriesData: SeriesData[]
    loadingChart: boolean
    newLugar: string
    newTipo: string
    newUnidad: string
    newCiclo: string
    handleAddSerie: (serie: SeriesConfig) => void
    handleRemoveSerie: (id: string) => void
    fetchAnalisis: () => Promise<void>
    setNewLugar: (value: string) => void
    setNewTipo: (value: string) => void
    setNewUnidad: (value: string) => void
    setNewCiclo: (value: string) => void
}

// Hook para gestionar series de análisis
export function useAnalisisSeries(
    lugares: Lugar[],
    unidades: Unidad[],
    tipos: TipoRegistro[],
    ciclos: Ciclo[]
): UseAnalisisSeriesReturn {
    // Estados para series configuradas
    const [series, setSeries] = useState<SeriesConfig[]>([])
    const [seriesData, setSeriesData] = useState<SeriesData[]>([])
    const [loadingChart, setLoadingChart] = useState(false)

    // Estados para formulario de nueva serie
    const [newLugar, setNewLugar] = useState("")
    const [newTipo, setNewTipo] = useState("")
    const [newUnidad, setNewUnidad] = useState("")
    const [newCiclo, setNewCiclo] = useState("")

    // Limpiar ciclo si cambia el lugar
    useEffect(() => {
        setNewCiclo("")
    }, [newLugar])

    // Agregar nueva serie de análisis
    const handleAddSerie = useCallback((serie: SeriesConfig) => {
        setSeries(prev => [...prev, serie])
        setNewLugar("")
        setNewTipo("")
        setNewUnidad("")
        setNewCiclo("")
    }, [])

    // Eliminar serie de análisis
    const handleRemoveSerie = useCallback((id: string) => {
        setSeries(prev => prev.filter(s => s.id !== id))
        setSeriesData(prev => prev.filter(s => s.id !== id))
    }, [])

    // Generar análisis
    const fetchAnalisis = useCallback(async () => {
        if (series.length === 0) return

        setLoadingChart(true)
        const token = localStorage.getItem("token")
        const headers = { "Authorization": `Bearer ${token}` }

        try {
            const newSeriesData: SeriesData[] = []

            // Procesar cada serie
            for (let idx = 0; idx < series.length; idx++) {
                const serie = series[idx]
                const queryParams = new URLSearchParams()

                // Construir query params
                if (serie.lugarId) queryParams.append("lugar_id", serie.lugarId)
                if (serie.tipoId) queryParams.append("tipo_id", serie.tipoId)
                if (serie.unidadId) queryParams.append("unidad_id", serie.unidadId)
                if (serie.cicloId) queryParams.append("ciclo_id", serie.cicloId)

                // Obtener mediciones
                const res = await fetch(`/api/mediciones?${queryParams.toString()}`, { headers })
                const data = await res.json()

                if (data.success && data.data.length > 0) {
                    const mediciones = data.data as Medicion[]

                    // Determinar fecha de inicio opcional (si hay ciclo)
                    let fechaInicio: Date | undefined = undefined
                    if (serie.cicloId) {
                        const ciclo = ciclos.find(c => c.id.toString() === serie.cicloId)
                        if (ciclo) fechaInicio = new Date(ciclo.fecha_siembra)
                    }

                    // Procesar datos de mediciones utilizando la fecha de inicio del ciclo si existe
                    const processedData = procesarDatosMediciones(mediciones, fechaInicio)

                    // Agregar datos de serie
                    newSeriesData.push({
                        id: serie.id,
                        nombre: getSerieNombre(serie, lugares, unidades, tipos, ciclos),
                        color: SERIES_COLORS[idx],
                        data: processedData
                    })
                }
            }

            setSeriesData(newSeriesData)
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingChart(false)
        }
    }, [series, lugares, unidades, tipos, ciclos])

    return {
        series,
        seriesData,
        loadingChart,
        newLugar,
        newTipo,
        newUnidad,
        newCiclo,
        handleAddSerie,
        handleRemoveSerie,
        fetchAnalisis,
        setNewLugar,
        setNewTipo,
        setNewUnidad,
        setNewCiclo
    }
}
