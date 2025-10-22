"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, MapPin, Ruler, Users, Plus, History, Activity, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { useTranslations } from "next-intl"

interface Log {
    id: number
    tabla_afectada: string
    accion: string
    fecha_evento: string
    usuario: { nombre: string }
}

export default function DashboardPage() {
    const t = useTranslations('dashboard')
    const tCommon = useTranslations('common')
    const tAuditLog = useTranslations('auditLog')
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()



    useEffect(() => {
        if (!authLoading && user?.rol === "PUBLICO") {
            router.replace("/dashboard/en-desarrollo")
        }
    }, [user, authLoading, router])



    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight font-outfit">{t('title')}</h2>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-12">


                <Card className="md:col-span-12 border-border/50">
                    <CardHeader>
                        <CardTitle className="font-outfit">{t('quickAccess')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start gap-3 h-14 hover:bg-primary/10 rounded-xl transition-all" asChild>
                            <Link href="/dashboard/mediciones">
                                <Plus className="w-5 h-5 text-primary" />
                                <span className="font-medium">{t('newMeasurement')}</span>
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-3 h-14 hover:bg-primary/10 rounded-xl transition-all" asChild>
                            <Link href="/dashboard/lugares">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span className="font-medium">{t('registerPlace')}</span>
                            </Link>
                        </Button>

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
