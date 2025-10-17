"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingUp, BarChart3 } from "lucide-react"
import { SeriesData } from "./types"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import { useTranslations } from "next-intl"

interface AnalysisChartProps {
    seriesData: SeriesData[]
    chartData: Record<string, number | string | null>[]
}

export function AnalysisChart({ seriesData, chartData }: AnalysisChartProps) {
    const t = useTranslations('analysis')
    
    return (
        <Card className="border-border/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    {t('selectSeries')}
                </CardTitle>
                <CardDescription>
                    {seriesData.length > 0
                        ? `Showing ${seriesData.length} series - Day 0 = first measurement`
                        : "Configure series and generate analysis"
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <div className="h-[450px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                                <XAxis
                                    dataKey="dia"
                                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                                    label={{ value: "Days elapsed", position: "insideBottom", offset: -10, fontSize: 12 }}
                                />
                                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg max-w-xs">
                                                    <p className="font-semibold text-primary mb-2">Day {label}</p>
                                                    {payload.map((p, idx) => (
                                                        p.value !== null && (
                                                            <p key={idx} className="text-sm flex items-center gap-2">
                                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: seriesData[idx]?.color }} />
                                                                <span className="truncate">{seriesData[idx]?.nombre}:</span>
                                                                <span className="font-bold ml-auto">{Number(p.value).toFixed(2)}</span>
                                                            </p>
                                                        )
                                                    ))}
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Legend
                                    formatter={(value, entry, index) => seriesData[index]?.nombre || value}
                                />
                                {seriesData.map((series, idx) => (
                                    <Line
                                        key={series.id}
                                        type="monotone"
                                        dataKey={`valor_${idx}`}
                                        name={series.nombre}
                                        stroke={series.color}
                                        strokeWidth={idx === 0 ? 4 : 2}
                                        dot={idx === 0 ? { fill: series.color, r: 3, strokeWidth: 0 } : false}
                                        activeDot={{ r: 6, fill: series.color, stroke: "#fff", strokeWidth: 2 }}
                                        connectNulls
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-[450px] flex flex-col items-center justify-center text-center">
                        <div className="p-4 rounded-full bg-muted/50 mb-4">
                            <BarChart3 className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-lg font-semibold text-muted-foreground">No data</h3>
                        <p className="text-sm text-muted-foreground/70 mt-1 max-w-sm">
                            Add series with combinations of place, type and unit
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
