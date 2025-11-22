"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MedicionesFilters } from "@/components/dashboard/mediciones/mediciones-filters"

interface Filters {
    lugar_id: string
    tipo_id: string
    autor_id: string
    ciclo_id: string
}

interface MedicionesFiltersPanelProps {
    showFilters: boolean
    setShowFilters: (show: boolean) => void
    filters: Filters
    setFilters: (filters: Filters) => void
    lugares: any[]
    tipos: any[]
    usuarios: any[]
    ciclos: any[]
    t: (key: string) => string
    tCommon: (key: string) => string
}

// Componente de panel de filtros para mediciones
export function MedicionesFiltersPanel({
    showFilters,
    setShowFilters,
    filters,
    setFilters,
    lugares,
    tipos,
    usuarios,
    ciclos,
    t,
    tCommon
}: MedicionesFiltersPanelProps) {
    // Verificar si hay filtros activos
    const hasActiveFilters = filters.lugar_id || filters.tipo_id || filters.autor_id || filters.ciclo_id

    return (
        <Card className="border-border/50">
            <CardContent className="p-4 border-b">
                <div className="flex items-center gap-4">
                    {/* Botón para mostrar/ocultar filtros */}
                    <button
                        type="button"
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${showFilters
                            ? "bg-secondary text-secondary-foreground"
                            : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            }`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                        {tCommon('filter')}
                        {hasActiveFilters && (
                            <span className="flex h-2 w-2 rounded-full bg-primary" />
                        )}
                    </button>

                    {/* Botón para limpiar filtros activos */}
                    {hasActiveFilters && (
                        <button
                            type="button"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setFilters({ lugar_id: "", tipo_id: "", autor_id: "", ciclo_id: "" })}
                        >
                            {tCommon('clear')} {tCommon('filter')}
                        </button>
                    )}
                </div>

                {/* Mostrar filtros cuando están activos */}
                {showFilters && (
                    <div className="mt-4">
                        <MedicionesFilters
                            filters={filters}
                            lugares={lugares}
                            tipos={tipos}
                            usuarios={usuarios}
                            ciclos={ciclos}
                            onFilterChange={setFilters}
                            onClearFilters={() => setFilters({ lugar_id: "", tipo_id: "", autor_id: "", ciclo_id: "" })}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
