"use client"

import { useEffect, useState, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Plus, MapPin, Search, Trash2, Edit2, Loader2, Globe } from "lucide-react"
import dynamic from "next/dynamic"

// Cargar el mapa dinámicamente para evitar errores de SSR
const MapPicker = dynamic(() => import("@/components/ui/map-picker"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-muted animate-pulse flex items-center justify-center rounded-lg border">Cargando mapa...</div>
})

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

    const handleMapChange = (lat: number, lng: number) => {
        setFormData(prev => ({
            ...prev,
            latitud: lat.toFixed(6),
            longitud: lng.toFixed(6)
        }))
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
        if (!confirm("¿Estás seguro de que deseas eliminar este lugar?")) return

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
                    <h2 className="text-3xl font-bold tracking-tight font-outfit text-primary">Lugares de Control</h2>
                    <p className="text-muted-foreground italic">Referenciación geográfica de puntos de toma de muestra.</p>
                </div>
                <Button onClick={openCreateModal} className="gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" /> Nuevo Punto de Control
                </Button>
            </div>

            <Card className="border-border/50 bg-card/50 backdrop-blur-md shadow-xl overflow-hidden">
                <CardHeader className="p-4 border-b bg-muted/20">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Filtrar lugares..."
                            className="pl-10 h-10 border-none bg-background/50 focus-visible:ring-1"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="font-bold">Ubicación</TableHead>
                                <TableHead className="font-bold">Coordenadas</TableHead>
                                <TableHead className="font-bold">Actividad</TableHead>
                                <TableHead className="font-bold">Observaciones</TableHead>
                                <TableHead className="text-right font-bold">Gestión</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-60 text-center">
                                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary opacity-30" />
                                    </TableCell>
                                </TableRow>
                            ) : lugares.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">
                                        No hay puntos de control registrados aún.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                lugares.map((lugar) => (
                                    <TableRow key={lugar.id} className="group hover:bg-primary/5 transition-all">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                                    <MapPin className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-sm tracking-tight">{lugar.nombre}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {lugar.latitud ? (
                                                <div className="flex items-center gap-2 text-xs font-mono bg-muted/50 w-fit px-2 py-1 rounded border border-border/50">
                                                    <Globe className="w-3 h-3 text-muted-foreground" />
                                                    {parseFloat(lugar.latitud).toFixed(4)}, {parseFloat(lugar.longitud!).toFixed(4)}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">Sin referencia</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {lugar._count?.mediciones || 0} registros
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] text-xs text-muted-foreground truncate">
                                            {lugar.nota || "—"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => openEditModal(lugar)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(lugar.id)}>
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
                title={editingLugar ? "Actualizar Ubicación" : "Nueva Referencia Geográfica"}
                description="Selecciona el punto exacto en el mapa para el registro de mediciones"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="uppercase text-[10px] font-black tracking-widest text-primary">Punto de Control en Puerto Montt</Label>
                            <MapPicker
                                lat={formData.latitud}
                                lng={formData.longitud}
                                onChange={handleMapChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre" className="text-xs font-bold">Identificador</Label>
                                <Input
                                    id="nombre"
                                    placeholder="Nombre de la estación"
                                    required
                                    className="font-bold"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nota" className="text-xs font-bold">Observación</Label>
                                <Input
                                    id="nota"
                                    placeholder="Detalles adicionales"
                                    value={formData.nota}
                                    onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg border border-dashed border-primary/20">
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Latitud</Label>
                                <p className="text-sm font-mono font-bold text-primary">{formData.latitud || "Pending..."}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Longitud</Label>
                                <p className="text-sm font-mono font-bold text-primary">{formData.longitud || "Pending..."}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button variant="ghost" type="button" className="flex-1 font-bold text-xs uppercase" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="flex-1 font-bold text-xs uppercase shadow-lg shadow-primary/30" disabled={submitting}>
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirmar Ubicación
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
