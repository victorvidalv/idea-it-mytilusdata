"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, RefreshCw, TrendingUp } from "lucide-react"
import { SeriesConfig } from "@/components/analisis"
import { SeriesConfigPanel } from "@/components/analisis"

// Props del componente
interface AnalisisConfigPanelProps {
    series: SeriesConfig[]
    onAddSerie: (serie: SeriesConfig) => void
    onRemoveSerie: (id: string) => void
    filters: {
        lugares: any[]
        unidades: any[]
        tipos: any[]
        ciclos: any[]
    }
    newLugar: string
    newTipo: string
    newUnidad: string
    newCiclo: string
    onNewLugarChange: (value: string) => void
    onNewTipoChange: (value: string) => void
    onNewUnidadChange: (value: string) => void
    onNewCicloChange: (value: string) => void
    fetchAnalisis: () => Promise<void>
    loadingChart: boolean
    t: (key: string) => string
    tCommon: (key: string) => string
}

// Panel de configuración para análisis
export function AnalisisConfigPanel({
    series,
    onAddSerie,
    onRemoveSerie,
    filters,
    newLugar,
    newTipo,
    newUnidad,
    newCiclo,
    onNewLugarChange,
    onNewTipoChange,
    onNewUnidadChange,
    onNewCicloChange,
    fetchAnalisis,
    loadingChart,
    t,
    tCommon
}: AnalisisConfigPanelProps) {
    return (
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
                {/* Panel de configuración de series */}
                <SeriesConfigPanel
                    series={series}
                    onAddSerie={onAddSerie}
                    onRemoveSerie={onRemoveSerie}
                    filters={filters}
                    newLugar={newLugar}
                    newTipo={newTipo}
                    newUnidad={newUnidad}
                    newCiclo={newCiclo}
                    onNewLugarChange={onNewLugarChange}
                    onNewTipoChange={onNewTipoChange}
                    onNewUnidadChange={onNewUnidadChange}
                    onNewCicloChange={onNewCicloChange}
                />

                {/* Botón generar análisis */}
                <Button
                    onClick={() => fetchAnalisis()}
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
    )
}
