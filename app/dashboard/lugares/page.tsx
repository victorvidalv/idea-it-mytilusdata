"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Plus, MapPin, Search, Trash2, Edit2, Loader2, AlertCircle } from "lucide-react"

interface Lugar {
    id: number
    nombre: string
    nota: string | null
    latitud: string | null
    longitud: string | null
    _count?: { mediciones: number }
}

export default function LugaresPage() {
    const [lugares, setLugares] = useState<Lugar[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingLugar, setEditingLugar] = useState<Lugar | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        nombre: "",
        nota: "",
        latitud: "",
        longitud: ""
    })

    const fetchLugares = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`/api/lugares?q=${search}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setLugares(data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLugares()
    }, [search])

    const openEditModal = (lugar: Lugar) => {
        setEditingLugar(lugar)
        setFormData({
            nombre: lugar.nombre,
            nota: lugar.nota || "",
            latitud: lugar.latitud || "",
            longitud: lugar.longitud || ""
        })
        setIsModalOpen(true)
    }

    const openCreateModal = () => {
        setEditingLugar(null)
        setFormData({ nombre: "", nota: "", latitud: "", longitud: "" })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const token = localStorage.getItem("token")
            const url = editingLugar ? `/api/lugares/${editingLugar.id}` : "/api/lugares"
            const method = editingLugar ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                setIsModalOpen(false)
                fetchLugares()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este lugar? Se realizará un borrado lógico.")) return

        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`/api/lugares/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                fetchLugares()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-outfit">Lugares</h2>
                    <p className="text-muted-foreground">Gestiona los puntos de control y estaciones de medición.</p>
                </div>
                <Button onClick={openCreateModal} className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" /> Nuevo Lugar
                </Button>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nombre..."
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
                                <TableHead>Nombre</TableHead>
                                <TableHead>Coordenadas</TableHead>
                                <TableHead>Mediciones</TableHead>
                                <TableHead>Notas</TableHead>
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
                            ) : lugares.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                                        No se encontraron lugares.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                lugares.map((lugar) => (
                                    <TableRow key={lugar.id} className="group transition-colors">
                                        <TableCell className="font-semibold">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-primary" />
                                                {lugar.nombre}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {lugar.latitud ? `${lugar.latitud}, ${lugar.longitud}` : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/20">
                                                {lugar._count?.mediciones || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                            {lugar.nota || "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                                    onClick={() => openEditModal(lugar)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(lugar.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingLugar ? "Editar Lugar" : "Crear Nuevo Lugar"}
                description={editingLugar ? "Actualiza la información de este punto de control" : "Completa los datos de la estación o punto de control"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre del Lugar</Label>
                        <Input
                            id="nombre"
                            placeholder="Ej: Planta Norte, Estación Delta..."
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="lat">Latitud</Label>
                            <Input
                                id="lat"
                                type="number"
                                step="any"
                                placeholder="-33.123"
                                value={formData.latitud}
                                onChange={(e) => setFormData({ ...formData, latitud: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lng">Longitud</Label>
                            <Input
                                id="lng"
                                type="number"
                                step="any"
                                placeholder="-70.456"
                                value={formData.longitud}
                                onChange={(e) => setFormData({ ...formData, longitud: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nota">Notas adicionales</Label>
                        <Input
                            id="nota"
                            placeholder="Descripción opcional..."
                            value={formData.nota}
                            onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                        />
                    </div>
                    <div className="pt-4 flex gap-3">
                        <Button variant="ghost" type="button" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="flex-1" disabled={submitting}>
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {editingLugar ? "Actualizar" : "Guardar"} Lugar
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
