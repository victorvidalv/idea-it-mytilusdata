"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Filter } from "lucide-react"
import { Lugar, TipoRegistro, Usuario } from "@/lib/types"
import { useTranslations } from "next-intl"

interface MedicionesFiltersProps {
    filters: {
        lugar_id: string
        tipo_id: string
        autor_id: string
    }
    lugares: Lugar[]
    tipos: TipoRegistro[]
    usuarios: Usuario[]
    onFilterChange: (filters: { lugar_id: string; tipo_id: string; autor_id: string }) => void
    onClearFilters: () => void
}

export function MedicionesFilters({
    filters,
    lugares,
    tipos,
    usuarios,
    onFilterChange,
    onClearFilters
}: MedicionesFiltersProps) {
    const t = useTranslations('measurements')
    const tCommon = useTranslations('common')
    const tPlaces = useTranslations('places')
    const tRecordTypes = useTranslations('recordTypes')
    const tUsers = useTranslations('users')
    
    const hasActiveFilters = filters.lugar_id || filters.tipo_id || filters.autor_id

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Button
                    variant="secondary"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                        // Toggle is handled by parent component
                    }}
                >
                    <Filter className="w-4 h-4" /> {tCommon('filter')}
                    {hasActiveFilters && (
                        <span className="flex h-2 w-2 rounded-full bg-primary" />
                    )}
                </Button>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="text-xs text-muted-foreground"
                    >
                        {tCommon('clear')}
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 animate-in fade-in slide-in-from-top-1">
                <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">{t('fields.place')}</Label>
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={filters.lugar_id}
                        onChange={(e) => onFilterChange({ ...filters, lugar_id: e.target.value })}
                    >
                        <option value="">{tCommon('places')}</option>
                        {lugares.map(l => <option key={l.id} value={l.id.toString()}>{l.nombre}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">{t('fields.recordType')}</Label>
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={filters.tipo_id}
                        onChange={(e) => onFilterChange({ ...filters, tipo_id: e.target.value })}
                    >
                        <option value="">{tCommon('recordTypes')}</option>
                        {tipos.map(t => <option key={t.id} value={t.id.toString()}>{t.codigo}</option>)}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">{tUsers('fields.name')}</Label>
                    <select
                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={filters.autor_id}
                        onChange={(e) => onFilterChange({ ...filters, autor_id: e.target.value })}
                    >
                        <option value="">{tCommon('users')}</option>
                        {usuarios.map(u => <option key={u.id} value={u.id.toString()}>{u.nombre}</option>)}
                    </select>
                </div>
            </div>
        </div>
    )
}
