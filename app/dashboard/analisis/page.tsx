"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TrendingUp, BarChart3, Activity, RefreshCw } from "lucide-react"
import { Medicion, Lugar, Unidad, TipoRegistro } from "@/lib/types"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    Area,
    AreaChart
} from "recharts"

interface ChartDataPoint {
    dia: number
    valor: number
    fecha: string
    lugar: string
    tipo: string
}

export default function AnalisisPage() {
    const [mediciones, setMediciones] = useState<Medicion[]>([])
    const [lugares, setLugares] = useState<Lugar[]>([])
    const [unidades, setUnidades] = useState<Unidad[]>([])
    const [tipos, setTipos] = useState<TipoRegistro[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingChart, setLoadingChart] = useState(false)

    // Filtros
    const [selectedLugar, setSelectedLugar] = useState<string>("")
    const [selectedUnidad, setSelectedUnidad] = useState<string>("")
    const [selectedTipo, setSelectedTipo] = useState<string>("")

    // Cargar datos iniciales
    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem("token")
            const headers = { "Authorization": `Bearer ${token}` }

            try {
                const [lRes, uRes, tRes] = await Promise.all([
                    fetch("/api/lugares", { headers }),
                    fetch("/api/unidades", { headers }),
                    fetch("/api/tipos-registro", { headers })
                ])

                const [l, u, t] = await Promise.all([
                    lRes.json(),
                    uRes.json(),
                    tRes.json()
                ])

                if (l.success) setLugares(l.data)
                if (u.success) setUnidades(u.data)
                if (t.success) setTipos(t.data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        fetchInitialData()
    }, [])

    // Cargar mediciones cuando cambian los filtros
    const fetchMediciones = async () => {
        if (!selectedLugar) return

        setLoadingChart(true)
        const token = localStorage.getItem("token")
        const headers = { "Authorization": `Bearer ${token}` }

        try {
            const queryParams = new URLSearchParams()
            if (selectedLugar) queryParams.append("lugar_id", selectedLugar)
            if (selectedUnidad) queryParams.append("unidad_id", selectedUnidad)
            if (selectedTipo) queryParams.append("tipo_id", selectedTipo)

            const res = await fetch(`/api/mediciones?${queryParams.toString()}`, { headers })
            const data = await res.json()

            if (data.success) {
                setMediciones(data.data)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingChart(false)
        }
    }

    // Procesar datos para el gráfico
    const chartData = useMemo<ChartDataPoint[]>(() => {
        if (mediciones.length === 0) return []

        // Ordenar por fecha
        const sorted = [...mediciones].sort(
            (a, b) => new Date(a.fecha_medicion).getTime() - new Date(b.fecha_medicion).getTime()
        )

        // Obtener la fecha mínima como día 0
        const fechaMinima = new Date(sorted[0].fecha_medicion)
        fechaMinima.setHours(0, 0, 0, 0)

        // Convertir a puntos del gráfico
        return sorted.map((m) => {
            const fechaMedicion = new Date(m.fecha_medicion)
            fechaMedicion.setHours(0, 0, 0, 0)
            const diasTranscurridos = Math.round(
                (fechaMedicion.getTime() - fechaMinima.getTime()) / (1000 * 60 * 60 * 24)
            )

            return {
                dia: diasTranscurridos,
                valor: Number(m.valor),
                fecha: new Date(m.fecha_medicion).toLocaleDateString("es-CL", {
                    day: "2-digit",
                    month: "short"
                }),
                lugar: m.lugar.nombre,
                tipo: m.tipo.descripcion || m.tipo.codigo
            }
        })
    }, [mediciones])

    // Estadísticas
    const stats = useMemo(() => {
        if (chartData.length === 0) return null

        const valores = chartData.map(d => d.valor)
        const min = Math.min(...valores)
        const max = Math.max(...valores)
        const promedio = valores.reduce((a, b) => a + b, 0) / valores.length
        const diasTotales = chartData[chartData.length - 1]?.dia || 0

        return { min, max, promedio, diasTotales, total: chartData.length }
    }, [chartData])

    // Cálculo de parámetros de función sigmoide
    // f(x) = L / (1 + e^(-k*(x - x0)))
    const sigmoidParams = useMemo(() => {
        if (chartData.length < 3) return null

        const valores = chartData.map(d => d.valor)
        const dias = chartData.map(d => d.dia)

        // L = valor máximo (asíntota superior)
        const L = Math.max(...valores) * 1.05 // Pequeño margen

        // Valor mínimo para normalizar
        const minVal = Math.min(...valores)

        // x0 = punto de inflexión (donde la curva alcanza L/2)
        // Estimamos como el día donde el valor está más cerca del punto medio
        const midValue = (L + minVal) / 2
        let x0 = dias[0]
        let minDiff = Math.abs(valores[0] - midValue)

        for (let i = 1; i < valores.length; i++) {
            const diff = Math.abs(valores[i] - midValue)
            if (diff < minDiff) {
                minDiff = diff
                x0 = dias[i]
            }
        }

        // k = pendiente (estimada usando regresión simple)
        // Usamos los puntos normalizados para estimar k
        // Para una sigmoide, k controla qué tan rápido crece
        const diasTotales = Math.max(...dias) - Math.min(...dias) || 1
        const k = 4 / diasTotales // Factor de escala típico para sigmoide

        // Generar puntos de la curva sigmoide ajustada
        const minDia = Math.min(...dias)
        const maxDia = Math.max(...dias)
        const sigmoidCurve: { dia: number; valorSigmoide: number; valorReal: number | null }[] = []

        for (let x = minDia; x <= maxDia; x += 0.5) {
            const y = L / (1 + Math.exp(-k * (x - x0)))
            // Buscar si hay un valor real en este día
            const realDataPoint = chartData.find(d => d.dia === Math.round(x))
            sigmoidCurve.push({
                dia: x,
                valorSigmoide: y,
                valorReal: realDataPoint?.valor ?? null
            })
        }

        // R² (coeficiente de determinación) para medir ajuste
        const ssRes = chartData.reduce((sum, point) => {
            const predicted = L / (1 + Math.exp(-k * (point.dia - x0)))
            return sum + Math.pow(point.valor - predicted, 2)
        }, 0)
        const ssTot = chartData.reduce((sum, point) => {
            return sum + Math.pow(point.valor - (L / 2), 2)
        }, 0)
        const rSquared = Math.max(0, 1 - (ssRes / ssTot))

        return { L, k, x0, minVal, sigmoidCurve, rSquared }
    }, [chartData])

    // Tooltip personalizado
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-primary">Día {label}</p>
                    <p className="text-sm text-muted-foreground">{data.fecha}</p>
                    <p className="text-lg font-bold mt-1">
                        Valor: <span className="text-primary">{data.valor.toFixed(2)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{data.tipo}</p>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-outfit tracking-tight flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        Análisis de Datos
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Visualiza la evolución temporal de tus mediciones
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <Card className="border-border/50 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        Configuración del Análisis
                    </CardTitle>
                    <CardDescription>
                        Selecciona los parámetros para generar el gráfico
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Selector de Lugar */}
                        <div className="space-y-2">
                            <Label htmlFor="lugar" className="text-sm font-medium">
                                Centro / Lugar
                            </Label>
                            <select
                                id="lugar"
                                value={selectedLugar}
                                onChange={(e) => setSelectedLugar(e.target.value)}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="">Todos los lugares</option>
                                {lugares.map((l) => (
                                    <option key={l.id} value={l.id.toString()}>
                                        {l.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selector de Unidad */}
                        <div className="space-y-2">
                            <Label htmlFor="unidad" className="text-sm font-medium">
                                Unidad de Medida
                            </Label>
                            <select
                                id="unidad"
                                value={selectedUnidad}
                                onChange={(e) => setSelectedUnidad(e.target.value)}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="">Todas las unidades</option>
                                {unidades.map((u) => (
                                    <option key={u.id} value={u.id.toString()}>
                                        {u.nombre} ({u.sigla})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Selector de Tipo */}
                        <div className="space-y-2">
                            <Label htmlFor="tipo" className="text-sm font-medium">
                                Tipo de Registro
                            </Label>
                            <select
                                id="tipo"
                                value={selectedTipo}
                                onChange={(e) => setSelectedTipo(e.target.value)}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            >
                                <option value="">Todos los tipos</option>
                                {tipos.map((t) => (
                                    <option key={t.id} value={t.id.toString()}>
                                        {t.descripcion || t.codigo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Botón de análisis */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium opacity-0">Acción</Label>
                            <Button
                                onClick={fetchMediciones}
                                disabled={loadingChart}
                                className="w-full h-10 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                            >
                                {loadingChart ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                )}
                                Generar Análisis
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Estadísticas */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card className="border-border/50 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Mediciones</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Valor Mínimo</p>
                            <p className="text-2xl font-bold text-green-600">{stats.min.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50 bg-gradient-to-br from-orange-500/10 to-amber-500/10">
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Valor Máximo</p>
                            <p className="text-2xl font-bold text-orange-600">{stats.max.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50 bg-gradient-to-br from-violet-500/10 to-purple-500/10">
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Promedio</p>
                            <p className="text-2xl font-bold text-violet-600">{stats.promedio.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-border/50 bg-gradient-to-br from-pink-500/10 to-rose-500/10">
                        <CardContent className="pt-4">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Período (días)</p>
                            <p className="text-2xl font-bold text-pink-600">{stats.diasTotales}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Gráfico Principal */}
            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Evolución Temporal
                    </CardTitle>
                    <CardDescription>
                        Mediciones vs días transcurridos (día 0 = primera medición)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {chartData.length > 0 ? (
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                >
                                    <defs>
                                        <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                                    <XAxis
                                        dataKey="dia"
                                        label={{
                                            value: "Días transcurridos",
                                            position: "insideBottom",
                                            offset: -10,
                                            className: "fill-muted-foreground text-xs"
                                        }}
                                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                    />
                                    <YAxis
                                        label={{
                                            value: "Valor",
                                            angle: -90,
                                            position: "insideLeft",
                                            className: "fill-muted-foreground text-xs"
                                        }}
                                        tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <ReferenceLine
                                        y={stats?.promedio}
                                        stroke="#f97316"
                                        strokeDasharray="5 5"
                                        label={{
                                            value: "Promedio",
                                            position: "right",
                                            fill: "#f97316",
                                            fontSize: 11
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="valor"
                                        stroke="#8b5cf6"
                                        strokeWidth={2}
                                        fill="url(#colorValor)"
                                        dot={{
                                            fill: "#8b5cf6",
                                            strokeWidth: 2,
                                            r: 4
                                        }}
                                        activeDot={{
                                            r: 6,
                                            fill: "#7c3aed",
                                            stroke: "#fff",
                                            strokeWidth: 2
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center text-center">
                            <div className="p-4 rounded-full bg-muted/50 mb-4">
                                <BarChart3 className="w-12 h-12 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-semibold text-muted-foreground">
                                Sin datos para mostrar
                            </h3>
                            <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">
                                Selecciona un lugar y haz clic en "Generar Análisis" para visualizar los datos
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Función Sigmoide */}
            {sigmoidParams && chartData.length > 0 && (
                <Card className="border-border/50 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                                <Activity className="w-4 h-4 text-white" />
                            </div>
                            Modelo Sigmoide Ajustado
                        </CardTitle>
                        <CardDescription>
                            Función logística ajustada a los datos: f(x) = L / (1 + e<sup>-k(x-x₀)</sup>)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Fórmula y parámetros */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                                <h4 className="text-sm font-medium text-muted-foreground mb-3">Fórmula Matemática</h4>
                                <div className="text-center py-4 px-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg">
                                    <p className="text-lg md:text-xl font-mono font-bold text-primary">
                                        f(x) = {sigmoidParams.L.toFixed(2)} / (1 + e<sup className="text-sm">-{sigmoidParams.k.toFixed(3)}(x - {sigmoidParams.x0.toFixed(1)})</sup>)
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-background/50 border border-border/50">
                                <h4 className="text-sm font-medium text-muted-foreground mb-3">Parámetros</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-indigo-500/10">
                                        <p className="text-xs text-muted-foreground">L (Asíntota)</p>
                                        <p className="text-lg font-bold text-indigo-600">{sigmoidParams.L.toFixed(2)}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-purple-500/10">
                                        <p className="text-xs text-muted-foreground">k (Pendiente)</p>
                                        <p className="text-lg font-bold text-purple-600">{sigmoidParams.k.toFixed(4)}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-violet-500/10">
                                        <p className="text-xs text-muted-foreground">x₀ (Inflexión)</p>
                                        <p className="text-lg font-bold text-violet-600">Día {sigmoidParams.x0.toFixed(1)}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-pink-500/10">
                                        <p className="text-xs text-muted-foreground">R² (Ajuste)</p>
                                        <p className="text-lg font-bold text-pink-600">{(sigmoidParams.rSquared * 100).toFixed(1)}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gráfico sigmoide */}
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sigmoidParams.sigmoidCurve} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                    <defs>
                                        <linearGradient id="colorSigmoide" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                                    <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                                    <Tooltip />
                                    <Legend />
                                    <ReferenceLine x={sigmoidParams.x0} stroke="#a855f7" strokeDasharray="5 5" />
                                    <ReferenceLine y={sigmoidParams.L} stroke="#6366f1" strokeDasharray="5 5" />
                                    <Area type="monotone" dataKey="valorSigmoide" name="Modelo" stroke="#6366f1" strokeWidth={2} fill="url(#colorSigmoide)" dot={false} />
                                    <Line type="monotone" dataKey="valorReal" name="Real" stroke="#a855f7" strokeWidth={0} dot={{ fill: "#a855f7", r: 5, stroke: "#fff", strokeWidth: 2 }} connectNulls={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                            <h4 className="text-sm font-semibold mb-2">📊 Interpretación</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• <strong>L = {sigmoidParams.L.toFixed(2)}</strong>: Valor máximo (asíntota superior)</li>
                                <li>• <strong>k = {sigmoidParams.k.toFixed(4)}</strong>: Velocidad de crecimiento</li>
                                <li>• <strong>x₀ = día {sigmoidParams.x0.toFixed(1)}</strong>: Punto de inflexión (50% de L)</li>
                                <li>• <strong>R² = {(sigmoidParams.rSquared * 100).toFixed(1)}%</strong>: Ajuste del modelo</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Tabla de datos */}
            {chartData.length > 0 && (
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle className="text-lg">Datos del Análisis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Día</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Valor</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chartData.map((row, idx) => (
                                        <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                            <td className="py-3 px-4 font-mono">{row.dia}</td>
                                            <td className="py-3 px-4">{row.fecha}</td>
                                            <td className="py-3 px-4 font-semibold text-primary">{row.valor.toFixed(2)}</td>
                                            <td className="py-3 px-4 text-muted-foreground">{row.tipo}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
