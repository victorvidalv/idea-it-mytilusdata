"use client"

import { useMemo } from "react"
import { Activity } from "lucide-react"
import { useTranslations } from "next-intl"

// Importar hooks personalizados
import { useAnalisisData } from "./hooks/use-analisis-data"
import { useAnalisisSeries } from "./hooks/use-analisis-series"

// Importar utilidades de cálculo
import { calcularEstadisticas, calcularSigmoide, prepararDatosGrafico } from "./utils/series-calculations"

// Importar componentes de análisis
import {
    StatsCards,
    AnalysisChart,
    SigmoidModelCard,
} from "@/components/analisis"

// Importar componente de configuración
import { AnalisisConfigPanel } from "./components/analisis-config-panel"

// Página principal de análisis
export default function AnalisisPage() {
    const t = useTranslations('analysis')
    const tCommon = useTranslations('common')

    // Obtener datos base (lugares, unidades, tipos, ciclos)
    const { lugares, unidades, tipos, ciclos, loading } = useAnalisisData()

    // Gestionar series de análisis
    const {
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
    } = useAnalisisSeries(lugares, unidades, tipos, ciclos)

    // Calcular estadísticas de la serie principal
    const mainStats = useMemo(() => {
        return calcularEstadisticas(seriesData)
    }, [seriesData])

    // Calcular parámetros de sigmoide de la serie principal
    const sigmoidParams = useMemo(() => {
        return calcularSigmoide(seriesData)
    }, [seriesData])

    // Preparar datos combinados para el gráfico
    const chartData = useMemo(() => {
        return prepararDatosGrafico(seriesData)
    }, [seriesData])

    // Datos de filtros
    const filterData = { lugares, unidades, tipos, ciclos }

    // Mostrar indicador de carga
    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Activity className="w-8 h-8 animate-spin text-muted-foreground" />
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
            <AnalisisConfigPanel
                series={series}
                onAddSerie={handleAddSerie}
                onRemoveSerie={handleRemoveSerie}
                filters={filterData}
                newLugar={newLugar}
                newTipo={newTipo}
                newUnidad={newUnidad}
                newCiclo={newCiclo}
                onNewLugarChange={setNewLugar}
                onNewTipoChange={setNewTipo}
                onNewUnidadChange={setNewUnidad}
                onNewCicloChange={setNewCiclo}
                fetchAnalisis={fetchAnalisis}
                loadingChart={loadingChart}
                t={t}
                tCommon={tCommon}
            />

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
