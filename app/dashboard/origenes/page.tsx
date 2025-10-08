"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Plus, Database, Loader2, Trash2, Edit2 } from "lucide-react"

interface OrigenDato {
    id: number
    nombre: string
    descripcion: string | null
}

export default function OrigenesPage() {
    const [origenes, setOrigenes] = useState<OrigenDato[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingOrigen, setEditingOrigen] = useState<OrigenDato | null>(null)

    const [formData, setFormData] = useState({ nombre: "", descripcion: "" })

    const fetchOrigenes = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("/api/origenes", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setOrigenes(data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchOrigenes() }, [])

    const openCreateModal = () => {
        setEditingOrigen(null)
        setFormData({ nombre: "", descripcion: "" })
        setIsModalOpen(true)
    }

    const openEditModal = (origen: OrigenDato) => {
        setEditingOrigen(origen)
        setFormData({ nombre: origen.nombre, descripcion: origen.descripcion || "" })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este origen?")) return
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`/api/origenes/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                fetchOrigenes()
            } else {
                alert(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const token = localStorage.getItem("token")
            const url = editingOrigen ? `/api/origenes/${editingOrigen.id}` : "/api/origenes"
            const method = editingOrigen ? "PUT" : "POST"

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
                setFormData({ nombre: "", descripcion: "" })
                fetchOrigenes()
            } else { alert(data.message) }
        } catch (error) { console.error(error) }
        finally { setSubmitting(false) }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-outfit">Orígenes de Datos</h2>
                    <p className="text-muted-foreground">Configura los orígenes para clasificar tus mediciones.</p>
                </div>
                <Button onClick={openCreateModal} className="gap-2">
                    <Plus className="w-4 h-4" /> Nuevo Origen
                </Button>
            </div>

            <Card className="border-border/50">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead>Nombre</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="h-40 text-center text-muted-foreground">Cargando...</TableCell></TableRow>
                            ) : origenes.length === 0 ? (
                                <TableRow><TableCell colSpan={3} className="h-40 text-center text-muted-foreground">No hay orígenes registrados</TableCell></TableRow>
                            ) : origenes.map((o) => (
                                <TableRow key={o.id} className="group">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <Database className="w-4 h-4 text-primary" />
                                            {o.nombre}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {o.descripcion || <span className="italic">Sin descripción</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                                onClick={() => openEditModal(o)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(o.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingOrigen ? "Editar Origen" : "Agregar Origen"}
                description={editingOrigen ? "Actualiza los datos de este origen" : "Define un nuevo origen para clasificar mediciones"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="o-nombre">Nombre (ej: Laboratorio Central)</Label>
                        <Input
                            id="o-nombre"
                            required
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="o-descripcion">Descripción (opcional)</Label>
                        <textarea
                            id="o-descripcion"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Información adicional sobre este origen..."
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        />
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={submitting}>
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {editingOrigen ? "Actualizar" : "Guardar"} Origen
                    </Button>
                </form>
            </Modal>
        </div>
    )
}
