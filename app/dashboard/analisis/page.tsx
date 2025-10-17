"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, BarChart3, RefreshCw, TrendingUp } from "lucide-react"
import { Medicion, Lugar, Unidad, TipoRegistro } from "@/lib/types"
import { useTranslations } from "next-intl"

// Importar componentes de análisis
import {
    SeriesConfigPanel,
    StatsCards,
    AnalysisChart,
    SigmoidModelCard,
    SeriesConfig,
    SeriesData,
    SERIES_COLORS,
    getSerieNombre,
    calculateStats,
    calculateSigmoid,
} from "@/components/analisis"

export default function AnalisisPage() {
    const t = useTranslations('analysis')
    const tCommon = useTranslations('common')
    
    // Estado de datos base
    const [lugares, setLugares] = useState<Lugar[]>([])
    const [unidades, setUnidades] = useState<Unidad[]>([])
    const [tipos, setTipos] = useState<TipoRegistro[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingChart, setLoadingChart] = useState(false)

    // Series configuradas
    const [series, setSeries] = useState<SeriesConfig[]>([])
    const [seriesData, setSeriesData] = useState<SeriesData[]>([])

    // Formulario para nueva serie
    const [newLugar, setNewLugar] = useState("")
    const [newTipo, setNewTipo] = useState("")
    const [newUnidad, setNewUnidad] = useState("")

    // Cargar datos iniciales
    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem("token")
            const headers = { "Authorization": `Bearer ${token}` }

            try {
                const [lRes, uRes, tRes] = await Promise.all([
                    fetch("/api/lugares", { headers }),
                    fetch("/api/unidades", { headers }),
                    fetch("/api/tipos-registro", { headers })
                ])

                const [l, u, t] = await Promise.all([
                    lRes.json(),
                    uRes.json(),
                    tRes.json()
                ])

                if (l.success) setLugares(l.data)
                if (u.success) setUnidades(u.data)
                if (t.success) setTipos(t.data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        fetchInitialData()
    }, [])

    // Handlers para series
    const handleAddSerie = useCallback((serie: SeriesConfig) => {
        setSeries(prev => [...prev, serie])
        setNewLugar("")
        setNewTipo("")
        setNewUnidad("")
    }, [])

    const handleRemoveSerie = useCallback((id: string) => {
        setSeries(prev => prev.filter(s => s.id !== id))
        setSeriesData(prev => prev.filter(s => s.id !== id))
    }, [])

    // Generar análisis
    const fetchAnalisis = async () => {
        if (series.length === 0) return

        setLoadingChart(true)
        const token = localStorage.getItem("token")
        const headers = { "Authorization": `Bearer ${token}` }

        try {
            const newSeriesData: SeriesData[] = []

            for (let idx = 0; idx < series.length; idx++) {
                const serie = series[idx]
                const queryParams = new URLSearchParams()

                if (serie.lugarId) queryParams.append("lugar_id", serie.lugarId)
                if (serie.tipoId) queryParams.append("tipo_id", serie.tipoId)
                if (serie.unidadId) queryParams.append("unidad_id", serie.unidadId)

                const res = await fetch(`/api/mediciones?${queryParams.toString()}`, { headers })
                const data = await res.json()

                if (data.success && data.data.length > 0) {
                    const mediciones = data.data as Medicion[]

                    const sorted = [...mediciones].sort(
                        (a, b) => new Date(a.fecha_medicion).getTime() - new Date(b.fecha_medicion).getTime()
                    )

                    const fechaMinima = new Date(sorted[0].fecha_medicion)
                    fechaMinima.setHours(0, 0, 0, 0)

                    const processedData = sorted.map((m) => {
                        const fechaMedicion = new Date(m.fecha_medicion)
                        fechaMedicion.setHours(0, 0, 0, 0)
                        const dia = Math.round(
                            (fechaMedicion.getTime() - fechaMinima.getTime()) / (1000 * 60 * 60 * 24)
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
    }

    // Datos combinados para el gráfico
    const chartData = useMemo(() => {
        if (seriesData.length === 0) return []

        const allDays = new Set<number>()
        seriesData.forEach(series => {
            series.data.forEach(d => allDays.add(d.dia))
        })

        const days = Array.from(allDays).sort((a, b) => a - b)
        return days.map(dia => {
            const point: Record<string, number | string | null> = { dia }
            seriesData.forEach((series, idx) => {
                const dataPoint = series.data.find(d => d.dia === dia)
                point[`valor_${idx}`] = dataPoint?.valor ?? null
            })
            return point
        })
    }, [seriesData])

    // Estadísticas de serie principal
    const mainStats = useMemo(() => {
        if (seriesData.length === 0) return null
        return calculateStats(seriesData[0].data)
    }, [seriesData])

    // Parámetros sigmoide de serie principal
    const sigmoidParams = useMemo(() => {
        if (seriesData.length === 0) return null
        return calculateSigmoid(seriesData[0].data)
    }, [seriesData])

    // Datos de filtros
    const filterData = { lugares, unidades, tipos }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold font-outfit tracking-tight flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    {t('title')}
                </h1>
                <p className="text-muted-foreground mt-1">
                    {t('description')}
                </p>
            </div>

            {/* Panel de configuración */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        {t('configureChart')}
                    </CardTitle>
                    <CardDescription>
                        {t('selectSeries')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <SeriesConfigPanel
                        series={series}
                        onAddSerie={handleAddSerie}
                        onRemoveSerie={handleRemoveSerie}
                        filters={filterData}
                        newLugar={newLugar}
                        newTipo={newTipo}
                        newUnidad={newUnidad}
                        onNewLugarChange={setNewLugar}
                        onNewTipoChange={setNewTipo}
                        onNewUnidadChange={setNewUnidad}
                    />

                    {/* Botón generar */}
                    <Button
                        onClick={fetchAnalisis}
                        disabled={series.length === 0 || loadingChart}
                        className="w-full h-12 text-base bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                    >
                        {loadingChart ? (
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                            <TrendingUp className="w-5 h-5 mr-2" />
                        )}
                        {tCommon('update')} ({series.length} serie{series.length !== 1 ? "s" : ""})
                    </Button>
                </CardContent>
            </Card>

            {/* Estadísticas */}
            <StatsCards stats={mainStats} />

            {/* Gráfico */}
            <AnalysisChart seriesData={seriesData} chartData={chartData} />

            {/* Modelo Sigmoide */}
            <SigmoidModelCard
                params={sigmoidParams}
                serieName={seriesData[0]?.nombre}
            />
        </div>
    )
}
