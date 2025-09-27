"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { SeriesConfig, SERIES_COLORS, getSerieNombre, FilterData } from "./types"

interface SeriesConfigPanelProps {
    series: SeriesConfig[]
    onAddSerie: (serie: SeriesConfig) => void
    onRemoveSerie: (id: string) => void
    filters: FilterData
    newLugar: string
    newTipo: string
    newUnidad: string
    onNewLugarChange: (value: string) => void
    onNewTipoChange: (value: string) => void
    onNewUnidadChange: (value: string) => void
}

export function SeriesConfigPanel({
    series,
    onAddSerie,
    onRemoveSerie,
    filters,
    newLugar,
    newTipo,
    newUnidad,
    onNewLugarChange,
    onNewTipoChange,
    onNewUnidadChange,
}: SeriesConfigPanelProps) {

    const handleAddSerie = () => {
        if (series.length >= 5) return
        if (!newLugar && !newTipo && !newUnidad) return

        onAddSerie({
            id: Date.now().toString(),
            lugarId: newLugar,
            tipoId: newTipo,
            unidadId: newUnidad
        })
    }

    return (
        <div className="space-y-6">
            {/* Series existentes */}
            {series.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Series configuradas:</Label>
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
                                        {getSerieNombre(s, filters.lugares, filters.unidades, filters.tipos)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Serie {idx + 1} {idx === 0 && "(Principal)"}
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
                        Agregar Serie {series.length + 1}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Lugar</Label>
                            <select
                                value={newLugar}
                                onChange={(e) => onNewLugarChange(e.target.value)}
                                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="">Todos los lugares</option>
                                {filters.lugares.map((l) => (
                                    <option key={l.id} value={l.id.toString()}>{l.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Unidad</Label>
                            <select
                                value={newUnidad}
                                onChange={(e) => onNewUnidadChange(e.target.value)}
                                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="">Todas las unidades</option>
                                {filters.unidades.map((u) => (
                                    <option key={u.id} value={u.id.toString()}>
                                        {u.nombre} ({u.sigla})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Tipo</Label>
                            <select
                                value={newTipo}
                                onChange={(e) => onNewTipoChange(e.target.value)}
                                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="">Todos los tipos</option>
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
                        disabled={!newLugar && !newTipo && !newUnidad}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Serie
                    </Button>
                </div>
            )}
        </div>
    )
}
