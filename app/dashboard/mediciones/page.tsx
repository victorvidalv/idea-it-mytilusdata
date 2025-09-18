"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Plus, Database, Calendar, MapPin, Gauge, Loader2, Filter, Trash2, Edit2 } from "lucide-react"

interface Medicion {
    id: number
    valor: string
    fecha_medicion: string
    lugar_id: number
    unidad_id: number
    tipo_id: number
    lugar: { nombre: string }
    unidad: { sigla: string }
    tipo: { codigo: string }
    notas?: string | null
    registrado_por: { nombre: string }
}

export default function MedicionesPage() {
    const [mediciones, setMediciones] = useState<Medicion[]>([])
    const [lugares, setLugares] = useState<any[]>([])
    const [unidades, setUnidades] = useState<any[]>([])
    const [tipos, setTipos] = useState<any[]>([])
    const [usuarios, setUsuarios] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingMedicion, setEditingMedicion] = useState<Medicion | null>(null)

    const [filters, setFilters] = useState({
        lugar_id: "",
        tipo_id: "",
        autor_id: ""
    })

    const [formData, setFormData] = useState({
        valor: "",
        fecha_medicion: new Date().toISOString().split("T")[0],
        lugar_id: "",
        unidad_id: "",
        tipo_id: "",
        notas: ""
    })

    const fetchData = async () => {
        setLoading(true)
        const token = localStorage.getItem("token")
        const headers = { "Authorization": `Bearer ${token}` }

        try {
            const queryParams = new URLSearchParams()
            if (filters.lugar_id) queryParams.append("lugar_id", filters.lugar_id)
            if (filters.tipo_id) queryParams.append("tipo_id", filters.tipo_id)
            if (filters.autor_id) queryParams.append("autor_id", filters.autor_id)

            const [mRes, lRes, uRes, tRes, usRes] = await Promise.all([
                fetch(`/api/mediciones?${queryParams.toString()}`, { headers }),
                fetch("/api/lugares", { headers }),
                fetch("/api/unidades", { headers }),
                fetch("/api/tipos-registro", { headers }),
                fetch("/api/usuarios", { headers })
            ])

            const [m, l, u, t, us] = await Promise.all([
                mRes.json(),
                lRes.json(),
                uRes.json(),
                tRes.json(),
                usRes.json()
            ])

            if (m.success) setMediciones(m.data)
            if (l.success) setLugares(l.data)
            if (u.success) setUnidades(u.data)
            if (t.success) setTipos(t.data)
            if (us.success) setUsuarios(us.data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [filters])

    const openCreateModal = () => {
        setEditingMedicion(null)
        setFormData({
            valor: "",
            fecha_medicion: new Date().toISOString().split("T")[0],
            lugar_id: "",
            unidad_id: "",
            tipo_id: "",
            notas: ""
        })
        setIsModalOpen(true)
    }

    const openEditModal = (m: Medicion) => {
        setEditingMedicion(m)
        setFormData({
            valor: m.valor.toString(),
            fecha_medicion: new Date(m.fecha_medicion).toISOString().split("T")[0],
            lugar_id: m.lugar_id.toString(),
            unidad_id: m.unidad_id.toString(),
            tipo_id: m.tipo_id.toString(),
            notas: m.notas || ""
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta medición?")) return
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`/api/mediciones/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                fetchData()
            } else {
                alert(data.message)
            }
        } catch (e) { console.error(e) }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const token = localStorage.getItem("token")
            const url = editingMedicion ? `/api/mediciones/${editingMedicion.id}` : "/api/mediciones"
            const method = editingMedicion ? "PUT" : "POST"

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
                fetchData()
            } else { alert(data.message) }
        } catch (e) { console.error(e) }
        finally { setSubmitting(false) }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-outfit">Historial de Mediciones</h2>
                    <p className="text-muted-foreground">Registro centralizado de todos los datos recolectados.</p>
                </div>
                <Button onClick={openCreateModal} className="gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4" /> Registrar Medición
                </Button>
            </div>

            <Card className="border-border/50">
                <CardHeader className="p-4 border-b flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant={showFilters ? "secondary" : "outline"}
                            size="sm"
                            className="gap-2"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4" /> Filtros
                            {(filters.lugar_id || filters.tipo_id || filters.autor_id) && (
                                <span className="flex h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>
                        {(filters.lugar_id || filters.tipo_id || filters.autor_id) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilters({ lugar_id: "", tipo_id: "", autor_id: "" })}
                                className="text-xs text-muted-foreground"
                            >
                                Limpiar filtros
                            </Button>
                        )}
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 animate-in fade-in slide-in-from-top-1">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Lugar</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={filters.lugar_id}
                                    onChange={(e) => setFilters({ ...filters, lugar_id: e.target.value })}
                                >
                                    <option value="">Todos los lugares</option>
                                    {lugares.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tipo de registro</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={filters.tipo_id}
                                    onChange={(e) => setFilters({ ...filters, tipo_id: e.target.value })}
                                >
                                    <option value="">Todos los tipos</option>
                                    {tipos.map(t => <option key={t.id} value={t.id}>{t.codigo}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Autor</Label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={filters.autor_id}
                                    onChange={(e) => setFilters({ ...filters, autor_id: e.target.value })}
                                >
                                    <option value="">Todos los autores</option>
                                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead>Fecha</TableHead>
                                <TableHead>Lugar</TableHead>
                                <TableHead>Valor</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Autor</TableHead>
                                <TableHead>Notas</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="animate-spin inline mr-2" /> Cargando...</TableCell></TableRow>
                            ) : mediciones.map((m) => (
                                <TableRow key={m.id} className="group hover:bg-muted/10 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            {new Date(m.fecha_medicion).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary/70" />
                                            {m.lugar.nombre}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-lg">
                                        {m.valor} <span className="text-sm font-medium text-muted-foreground">{m.unidad.sigla}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="bg-accent px-2 py-0.5 rounded text-[10px] font-bold uppercase border">
                                            {m.tipo.codigo}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                                {m.registrado_por.nombre.charAt(0)}
                                            </div>
                                            <span className="text-sm">{m.registrado_por.nombre}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-xs text-muted-foreground line-clamp-1 italic" title={m.notas || ""}>
                                            {m.notas || "-"}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                                onClick={() => openEditModal(m)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(m.id)}
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
                title={editingMedicion ? "Editar Medición" : "Registrar Medición"}
                description={editingMedicion ? "Actualiza los datos de esta medición" : "Ingresa los datos para una nueva toma de muestra"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="m-fecha">Fecha</Label>
                            <Input
                                id="m-fecha"
                                type="date"
                                required
                                value={formData.fecha_medicion}
                                onChange={(e) => setFormData({ ...formData, fecha_medicion: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="m-valor">Valor</Label>
                            <Input
                                id="m-valor"
                                type="number"
                                step="any"
                                placeholder="0.00"
                                required
                                value={formData.valor}
                                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Lugar de Control</Label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            required
                            value={formData.lugar_id}
                            onChange={(e) => setFormData({ ...formData, lugar_id: e.target.value })}
                        >
                            <option value="">Selecciona un lugar...</option>
                            {lugares.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Unidad</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                required
                                value={formData.unidad_id}
                                onChange={(e) => setFormData({ ...formData, unidad_id: e.target.value })}
                            >
                                <option value="">Uni...</option>
                                {unidades.map(u => <option key={u.id} value={u.id}>{u.sigla}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo de Registro</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                required
                                value={formData.tipo_id}
                                onChange={(e) => setFormData({ ...formData, tipo_id: e.target.value })}
                            >
                                <option value="">Tipo...</option>
                                {tipos.map(t => <option key={t.id} value={t.id}>{t.codigo}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="m-notas">Notas / Comentarios (Opcional)</Label>
                        <textarea
                            id="m-notas"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Información adicional sobre la medición..."
                            value={formData.notas}
                            onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                        />
                    </div>

                    <Button type="submit" className="w-full h-12 mt-4" disabled={submitting}>
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {editingMedicion ? "Actualizar" : "Registrar"} Ahora
                    </Button>
                </form>
            </Modal>
        </div>
    )
}
