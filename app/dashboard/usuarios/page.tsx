"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Users, Search, UserCheck, UserMinus } from "lucide-react"

interface Usuario {
    id: number
    nombre: string
    email: string
    activo: boolean
    created_at: string
    _count: {
        mediciones: number
        lugares: number
        unidades: number
    }
}

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    const fetchUsuarios = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`/api/usuarios?q=${search}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setUsuarios(data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsuarios()
    }, [search])

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`/api/usuarios/${id}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ activo: !currentStatus })
            })
            const data = await res.json()
            if (data.success) {
                fetchUsuarios()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-outfit">Gestión de Usuarios</h2>
                <p className="text-muted-foreground">Administra los accesos y permisos del personal.</p>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="p-4 border-b text-center sm:text-left">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre o email..."
                            className="pl-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead>Usuario</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead>Registros</TableHead>
                                <TableHead>Fecha Registro</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-50" />
                                    </TableCell>
                                </TableRow>
                            ) : usuarios.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                                        No se encontraron usuarios.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                usuarios.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                                    <span className="font-bold text-primary text-xs">{u.nombre?.[0].toUpperCase()}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{u.nombre}</span>
                                                    <span className="text-xs text-muted-foreground">{u.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold border ${u.activo ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                                {u.activo ? 'ACTIVO' : 'INACTIVO'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col text-[11px] text-muted-foreground">
                                                <span>{u._count.mediciones} Mediciones</span>
                                                <span>{u._count.lugares} Lugares</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`gap-2 ${u.activo ? 'hover:text-rose-500 hover:bg-rose-500/10' : 'hover:text-emerald-500 hover:bg-emerald-500/10'}`}
                                                onClick={() => toggleStatus(u.id, u.activo)}
                                            >
                                                {u.activo ? (
                                                    <><UserMinus className="w-4 h-4" /> Desactivar</>
                                                ) : (
                                                    <><UserCheck className="w-4 h-4" /> Activar</>
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
