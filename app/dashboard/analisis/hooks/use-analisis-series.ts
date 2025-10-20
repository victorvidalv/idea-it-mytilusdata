import { useState, useCallback } from "react"
import { Lugar, Unidad, TipoRegistro, Medicion } from "@/lib/types"
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
    handleAddSerie: (serie: SeriesConfig) => void
    handleRemoveSerie: (id: string) => void
    fetchAnalisis: () => Promise<void>
    setNewLugar: (value: string) => void
    setNewTipo: (value: string) => void
    setNewUnidad: (value: string) => void
}

// Hook para gestionar series de análisis
export function useAnalisisSeries(
    lugares: Lugar[],
    unidades: Unidad[],
    tipos: TipoRegistro[]
): UseAnalisisSeriesReturn {
    // Estados para series configuradas
    const [series, setSeries] = useState<SeriesConfig[]>([])
    const [seriesData, setSeriesData] = useState<SeriesData[]>([])
    const [loadingChart, setLoadingChart] = useState(false)

    // Estados para formulario de nueva serie
    const [newLugar, setNewLugar] = useState("")
    const [newTipo, setNewTipo] = useState("")
    const [newUnidad, setNewUnidad] = useState("")

    // Agregar nueva serie de análisis
    const handleAddSerie = useCallback((serie: SeriesConfig) => {
        setSeries(prev => [...prev, serie])
        setNewLugar("")
        setNewTipo("")
        setNewUnidad("")
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

                // Obtener mediciones
                const res = await fetch(`/api/mediciones?${queryParams.toString()}`, { headers })
                const data = await res.json()

                if (data.success && data.data.length > 0) {
                    const mediciones = data.data as Medicion[]

                    // Procesar datos de mediciones
                    const processedData = procesarDatosMediciones(mediciones)

                    // Agregar datos de serie
                    newSeriesData.push({
                        id: serie.id,
                        nombre: getSerieNombre(serie, lugares, unidades, tipos),
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
    }, [series, lugares, unidades, tipos])

    return {
        series,
        seriesData,
        loadingChart,
        newLugar,
        newTipo,
        newUnidad,
        handleAddSerie,
        handleRemoveSerie,
        fetchAnalisis,
        setNewLugar,
        setNewTipo,
        setNewUnidad
    }
}
