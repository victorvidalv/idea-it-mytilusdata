"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { History, User, Activity, Monitor, Calendar, Search } from "lucide-react"

interface Bitacora {
    id: number
    tabla_afectada: string
    registro_id: number
    accion: string
    cambios: any
    usuario: { nombre: string }
    fecha_evento: string
    ip_origen: string
}

export default function BitacoraPage() {
    const [logs, setLogs] = useState<Bitacora[]>([])
    const [loading, setLoading] = useState(true)

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("/api/bitacora?limit=50", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setLogs(data.data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchLogs() }, [])

    const getAccionColor = (accion: string) => {
        switch (accion) {
            case "CREATE": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            case "UPDATE": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case "SOFT_DELETE": return "bg-rose-500/10 text-rose-500 border-rose-500/20"
            default: return "bg-gray-500/10 text-gray-500 border-gray-500/20"
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-outfit">Auditoría de Cambios</h2>
                <p className="text-muted-foreground">Log detallado de todas las acciones sobre la base de datos.</p>
            </div>

            <Card className="border-border/60 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[180px]">Fecha / Hora</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Acción</TableHead>
                                <TableHead>Tabla</TableHead>
                                <TableHead>Cambios</TableHead>
                                <TableHead className="text-right">IP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="h-60 text-center text-muted-foreground">Cargando bitácora...</TableCell></TableRow>
                            ) : logs.map((log) => (
                                <TableRow key={log.id} className="hover:bg-muted/30">
                                    <TableCell className="text-xs font-mono">
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{new Date(log.fecha_evento).toLocaleDateString()}</span>
                                            <span className="text-muted-foreground">{new Date(log.fecha_evento).toLocaleTimeString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">{log.usuario.nombre}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getAccionColor(log.accion)}`}>
                                            {log.accion}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5 text-primary/70" />
                                            <span className="capitalize">{log.tabla_afectada}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <div className="text-[10px] space-y-1">
                                            {log.cambios && Object.entries(log.cambios).map(([key, val]: any) => (
                                                <div key={key} className="flex gap-2 truncate">
                                                    <span className="text-muted-foreground font-bold">{key}:</span>
                                                    <span className="text-muted-foreground/60 line-through truncate max-w-[50px]">{JSON.stringify(val.anterior)}</span>
                                                    <span className="text-foreground truncate max-w-[100px]">{JSON.stringify(val.nuevo)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right text-[10px] font-mono text-muted-foreground">
                                        {log.ip_origen}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
