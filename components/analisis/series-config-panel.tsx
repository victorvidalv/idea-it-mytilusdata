"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { SeriesConfig, SERIES_COLORS, getSerieNombre, FilterData } from "."
import { useTranslations } from "next-intl"

interface SeriesConfigPanelProps {
    series: SeriesConfig[]
    onAddSerie: (serie: SeriesConfig) => void
    onRemoveSerie: (id: string) => void
    filters: FilterData
    newLugar: string
    newTipo: string
    newUnidad: string
    newCiclo: string
    onNewLugarChange: (value: string) => void
    onNewTipoChange: (value: string) => void
    onNewUnidadChange: (value: string) => void
    onNewCicloChange: (value: string) => void
}

export function SeriesConfigPanel({
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
}: SeriesConfigPanelProps) {
    const t = useTranslations('analysis')
    const tCommon = useTranslations('common')
    const tCycles = useTranslations('cycles')

    // Filtrar ciclos por lugar seleccionado
    const ciclosFiltrados = filters.ciclos.filter(c =>
        !newLugar || newLugar === "all" || c.lugar_id.toString() === newLugar
    )

    const handleAddSerie = () => {
        if (series.length >= 5) return

        // Validar que al menos haya algún filtro seleccionado
        const hasSelection = newLugar || newTipo || newUnidad || newCiclo
        if (!hasSelection) return

        if (newUnidad === "all") {
            // "Explotar" todas las unidades en series individuales
            const unidadesDisponibles = filters.unidades
            const espacioRestante = 5 - series.length

            // Solo agregar hasta completar el límite de 5
            unidadesDisponibles.slice(0, espacioRestante).forEach((u, idx) => {
                onAddSerie({
                    id: `${Date.now()}-${idx}`,
                    lugarId: newLugar,
                    tipoId: newTipo,
                    unidadId: u.id.toString(),
                    cicloId: newCiclo
                })
            })
        } else {
            onAddSerie({
                id: Date.now().toString(),
                lugarId: newLugar,
                tipoId: newTipo,
                unidadId: newUnidad,
                cicloId: newCiclo
            })
        }
    }

    return (
        <div className="space-y-6">
            {/* Series existentes */}
            {series.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">{t('selectSeries')}</Label>
                    <div className="space-y-2">
                        {series.map((s, idx) => (
                            <div
                                key={s.id}
                                className="flex items-center gap-3 p-3 rounded-lg border"
                                style={{
                                    backgroundColor: `${SERIES_COLORS[idx]}10`,
                                    borderColor: SERIES_COLORS[idx]
                                }}
                            >
                                <div
                                    className="w-4 h-4 rounded-full shrink-0"
                                    style={{ backgroundColor: SERIES_COLORS[idx] }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">
                                        {getSerieNombre(s, filters.lugares, filters.unidades, filters.tipos, filters.ciclos, tCommon)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {t('seriesNumber', { number: idx + 1 })} {idx === 0 && `(${t('mainSeries')})`}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemoveSerie(s.id)}
                                    className="shrink-0 hover:bg-red-500/20 hover:text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Agregar nueva serie */}
            {series.length < 5 && (
                <div className="p-4 rounded-lg bg-muted/30 border border-dashed border-border">
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        {t('addSeries', { number: series.length + 1 })}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="space-y-2">
                            <Label className="text-xs">{t('fields.place')}</Label>
                            <select
                                value={newLugar}
                                onChange={(e) => onNewLugarChange(e.target.value)}
                                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="">{t('placeholders.place') || 'Seleccionar lugar...'}</option>
                                <option value="all">{tCommon('allPlaces')}</option>
                                {filters.lugares.map((l) => (
                                    <option key={l.id} value={l.id.toString()}>{l.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">{t('fields.cycle')}</Label>
                            <select
                                value={newCiclo}
                                onChange={(e) => onNewCicloChange(e.target.value)}
                                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="">{tCycles('placeholders.place') || 'Seleccionar ciclo...'}</option>
                                <option value="all">{tCommon('allCycles')}</option>
                                {ciclosFiltrados.map((c) => (
                                    <option key={c.id} value={c.id.toString()}>
                                        {c.nombre} {c.activo ? `(${tCycles('activeIndicator')})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">{t('fields.unit')}</Label>
                            <select
                                value={newUnidad}
                                onChange={(e) => onNewUnidadChange(e.target.value)}
                                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="">{t('placeholders.unit') || 'Seleccionar unidad...'}</option>
                                <option value="all">{tCommon('allUnits')}</option>
                                {filters.unidades.map((u) => (
                                    <option key={u.id} value={u.id.toString()}>
                                        {u.nombre} ({u.sigla})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">{t('fields.recordType')}</Label>
                            <select
                                value={newTipo}
                                onChange={(e) => onNewTipoChange(e.target.value)}
                                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="">{t('placeholders.recordType') || 'Seleccionar tipo...'}</option>
                                <option value="all">{tCommon('allRecordTypes')}</option>
                                {filters.tipos.map((t) => (
                                    <option key={t.id} value={t.id.toString()}>
                                        {t.descripcion || t.codigo}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <Button
                        onClick={handleAddSerie}
                        variant="outline"
                        className="w-full"
                        disabled={!newLugar && !newTipo && !newUnidad && !newCiclo}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {tCommon('add')} {t('series')}
                    </Button>
                </div>
            )}
        </div>
    )
}
