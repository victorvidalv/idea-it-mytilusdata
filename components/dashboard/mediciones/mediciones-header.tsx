"use client"

import { Button } from "@/components/ui/button"
import { Plus, Download } from "lucide-react"
import { useTranslations } from "next-intl"

interface MedicionesHeaderProps {
    onCreate: () => void
    onExport: () => void
    hasFilters: boolean
    onToggleFilters: () => void
    onClearFilters: () => void
}

export function MedicionesHeader({
    onCreate,
    onExport,
    hasFilters,
    onToggleFilters,
    onClearFilters
}: MedicionesHeaderProps) {
    const t = useTranslations('measurements')
    const tCommon = useTranslations('common')
    
    return (
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-outfit">{t('title')}</h2>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" onClick={onExport} className="gap-2">
                    <Download className="w-4 h-4" /> {t('exportMeasurements')}
                </Button>
                <Button onClick={onCreate} className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" /> {t('newMeasurement')}
                </Button>
            </div>
        </div>
    )
}
