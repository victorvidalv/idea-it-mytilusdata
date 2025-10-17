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

    const [stats, setStats] = useState({
        mediciones: 0,
        lugares: 0,
        unidades: 0,
        usuarios: 0,
    })
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
                // Fetch stats
                const statsRes = await fetch("/api/usuarios/me", { headers })
                const statsData = await statsRes.json()
                if (statsData.success) {
                    setStats({
                        mediciones: statsData.data._count.mediciones,
                        lugares: statsData.data._count.lugares,
                        unidades: statsData.data._count.unidades,
                        usuarios: 1,
                    })
                }

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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { title: t('measurements'), value: stats.mediciones, icon: Database, href: "/dashboard/mediciones", desc: t('measurementsDesc') },
                    { title: t('places'), value: stats.lugares, icon: MapPin, href: "/dashboard/lugares", desc: t('placesDesc') },
                    { title: t('units'), value: stats.unidades, icon: Ruler, href: "/dashboard/unidades", desc: t('unitsDesc') },
                    { title: t('users'), value: stats.usuarios, icon: Users, href: "/dashboard/usuarios", desc: t('usersDesc') },
                ].map((stat) => (
                    <Link key={stat.title} href={stat.href}>
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:bg-primary/5 transition-colors cursor-pointer group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-border/50 bg-card/30">
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
                                                <span className="italic">{log.tabla_afectada}</span>
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

                <Card className="col-span-3 border-border/50">
                    <CardHeader>
                        <CardTitle className="font-outfit">{t('quickAccess')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:bg-primary/10" asChild>
                            <Link href="/dashboard/mediciones">
                                <Plus className="w-4 h-4 text-primary" />
                                {t('newMeasurement')}
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:bg-primary/10" asChild>
                            <Link href="/dashboard/lugares">
                                <MapPin className="w-4 h-4 text-primary" />
                                {t('registerPlace')}
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start gap-3 h-12 hover:bg-primary/10" asChild>
                            <Link href="/dashboard/bitacora">
                                <History className="w-4 h-4 text-primary" />
                                {t('viewAudit')}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
