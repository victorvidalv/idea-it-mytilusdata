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

    const [recentLogs, setRecentLogs] = useState<Log[]>([])
    const [loadingLogs, setLoadingLogs] = useState(true)

    useEffect(() => {
        if (!authLoading && user?.rol === "PUBLICO") {
            router.replace("/dashboard/en-desarrollo")
        }
    }, [user, authLoading, router])

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token")
            const headers = { "Authorization": `Bearer ${token}` }

            try {
                // Fetch recent logs
                setLoadingLogs(true)
                const logsRes = await fetch("/api/bitacora?limit=5", { headers })
                const logsData = await logsRes.json()
                if (logsData.success) {
                    setRecentLogs(logsData.data)
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
            } finally {
                setLoadingLogs(false)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-1">
                <h2 className="text-3xl font-bold tracking-tight font-outfit">{t('title')}</h2>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-12">
                <Card className="md:col-span-7 border-border/50 bg-card/30">
                    <CardHeader>
                        <CardTitle className="font-outfit flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            {t('recentActivity')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {loadingLogs ? (
                                <div className="py-10 flex justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary/50" />
                                </div>
                            ) : recentLogs.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
                                    {t('noActivity')}
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {recentLogs.map((log) => (
                                        <div key={log.id} className="flex items-center gap-4 p-3 rounded-lg border bg-background/50 text-sm">
                                            <div className={`w-2 h-2 rounded-full ${log.accion === 'CREATE' ? 'bg-emerald-500' :
                                                log.accion === 'UPDATE' ? 'bg-blue-500' : 'bg-rose-500'
                                                }`} />
                                            <div className="flex-1">
                                                <span className="font-semibold text-primary">{log.usuario.nombre}</span>
                                                <span className="text-muted-foreground"> {tAuditLog('actions.' + log.accion)} </span>
                                                <span className="text-muted-foreground">{tAuditLog('fields.table')}: </span>
                                                <span className="italic">{tAuditLog(`tables.${log.tabla_afectada}`)}</span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-mono">
                                                {new Date(log.fecha_evento).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
                                        <Link href="/dashboard/bitacora">{t('viewFullAudit')}</Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-5 border-border/50">
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
                        <Button variant="outline" className="w-full justify-start gap-3 h-14 hover:bg-primary/10 rounded-xl transition-all" asChild>
                            <Link href="/dashboard/bitacora">
                                <History className="w-5 h-5 text-primary" />
                                <span className="font-medium">{t('viewAudit')}</span>
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
