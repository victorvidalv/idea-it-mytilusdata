"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { SigmoidParams } from "./types"

interface SigmoidModelCardProps {
    params: SigmoidParams | null
    serieName?: string
}

export function SigmoidModelCard({ params, serieName = "Serie Principal" }: SigmoidModelCardProps) {
    if (!params) return null

    return (
        <Card className="border-border/50 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    Modelo Sigmoide — {serieName}
                </CardTitle>
                <CardDescription>
                    f(x) = {params.minVal.toFixed(2)} + {params.amplitude.toFixed(2)} / (1 + e<sup>-{params.k.toFixed(3)}(x - {params.x0})</sup>)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-indigo-500/10 text-center">
                        <p className="text-xs text-muted-foreground uppercase mb-1">L (Máximo)</p>
                        <p className="text-2xl font-bold text-indigo-600">{params.L.toFixed(2)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-purple-500/10 text-center">
                        <p className="text-xs text-muted-foreground uppercase mb-1">k (Pendiente)</p>
                        <p className="text-2xl font-bold text-purple-600">{params.k.toFixed(4)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-violet-500/10 text-center">
                        <p className="text-xs text-muted-foreground uppercase mb-1">x₀ (Inflexión)</p>
                        <p className="text-2xl font-bold text-violet-600">Día {params.x0}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-pink-500/10 text-center">
                        <p className="text-xs text-muted-foreground uppercase mb-1">R² (Ajuste)</p>
                        <p className="text-2xl font-bold text-pink-600">{(params.rSquared * 100).toFixed(1)}%</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
