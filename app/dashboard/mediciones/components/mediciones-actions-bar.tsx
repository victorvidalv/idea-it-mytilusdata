"use client"

import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"

interface Filters {
    lugar_id: string
    tipo_id: string
    autor_id: string
}

interface MedicionesActionsBarProps {
    showFilters: boolean
    setShowFilters: (show: boolean) => void
    hasActiveFilters: boolean
    onClearFilters: () => void
    t: (key: string) => string
    tCommon: (key: string) => string
}

// Componente de barra de acciones para mediciones
export function MedicionesActionsBar({
    showFilters,
    setShowFilters,
    hasActiveFilters,
    onClearFilters,
    t,
    tCommon
}: MedicionesActionsBarProps) {
    return (
        <div className="flex items-center gap-4">
            {/* Botón para mostrar/ocultar filtros */}
            <Button
                variant={showFilters ? "secondary" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setShowFilters(!showFilters)}
            >
                <Filter className="w-4 h-4" /> {tCommon('filter')}
                {hasActiveFilters && (
                    <span className="flex h-2 w-2 rounded-full bg-primary" />
                )}
            </Button>
            
            {/* Botón para limpiar filtros activos */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="text-xs text-muted-foreground"
                >
                    {tCommon('clear')} {tCommon('filter')}
                </Button>
            )}
        </div>
    )
}
