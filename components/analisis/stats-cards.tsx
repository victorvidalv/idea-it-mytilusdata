"use client"

import { Card, CardContent } from "@/components/ui/card"
import { SeriesStats } from "./types"
import { useTranslations } from "next-intl"

interface StatsCardsProps {
    stats: SeriesStats | null
}

export function StatsCards({ stats }: StatsCardsProps) {
    const t = useTranslations('analysis')
    
    if (!stats) return null

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-border/50 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground uppercase">{t('total')}</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                </CardContent>
            </Card>
            <Card className="border-border/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground uppercase">{t('minimum')}</p>
                    <p className="text-2xl font-bold text-green-600">{stats.min.toFixed(2)}</p>
                </CardContent>
            </Card>
            <Card className="border-border/50 bg-gradient-to-br from-orange-500/10 to-amber-500/10">
                <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground uppercase">{t('maximum')}</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.max.toFixed(2)}</p>
                </CardContent>
            </Card>
            <Card className="border-border/50 bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground uppercase">{t('average')}</p>
                    <p className="text-2xl font-bold text-violet-600">{stats.promedio.toFixed(2)}</p>
                </CardContent>
            </Card>
            <Card className="border-border/50 bg-gradient-to-br from-pink-500/10 to-rose-500/10">
                <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground uppercase">{t('days')}</p>
                    <p className="text-2xl font-bold text-pink-600">{stats.diasTotales}</p>
                </CardContent>
            </Card>
        </div>
    )
}
