"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
    Plus, Ruler, Loader2, Trash2, Edit2, Tag, Database, History,
    User, Activity, Settings
} from "lucide-react"

// ================================
// INTERFACES
// ================================
interface Unidad {
    id: number
    nombre: string
    sigla: string
}

interface TipoRegistro {
    id: number
    codigo: string
    descripcion: string | null
    _count: { mediciones: number }
}

interface OrigenDato {
    id: number
    nombre: string
    descripcion: string | null
}

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

// ================================
// COMPONENTE UNIDADES
// ================================
function UnidadesTab() {
    const [unidades, setUnidades] = useState<Unidad[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingUnidad, setEditingUnidad] = useState<Unidad | null>(null)
    const [formData, setFormData] = useState({ nombre: "", sigla: "" })

    const fetchUnidades = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("/api/unidades", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setUnidades(data.data)
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchUnidades() }, [])

    const openCreateModal = () => {
        setEditingUnidad(null)
        setFormData({ nombre: "", sigla: "" })
        setIsModalOpen(true)
    }

    const openEditModal = (u: Unidad) => {
        setEditingUnidad(u)
        setFormData({ nombre: u.nombre, sigla: u.sigla })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar esta unidad?")) return
        const token = localStorage.getItem("token")
        const res = await fetch(`/api/unidades/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } })
        const data = await res.json()
        if (data.success) fetchUnidades()
        else alert(data.message)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        const token = localStorage.getItem("token")
        const url = editingUnidad ? `/api/unidades/${editingUnidad.id}` : "/api/unidades"
        const method = editingUnidad ? "PUT" : "POST"
        const res = await fetch(url, {
            method, headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        const data = await res.json()
        if (data.success) { setIsModalOpen(false); fetchUnidades() }
        else alert(data.message)
        setSubmitting(false)
    }

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Define las unidades de medida para tus registros.</p>
                <Button onClick={openCreateModal} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Nueva Unidad
                </Button>
            </div>
            <Card className="border-border/50">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead>Nombre</TableHead>
                                <TableHead>Sigla</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={3} className="h-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary/50" /></TableCell></TableRow>
                            ) : unidades.map((u) => (
                                <TableRow key={u.id} className="group">
                                    <TableCell className="font-medium">{u.nombre}</TableCell>
                                    <TableCell><code className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">{u.sigla}</code></TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditModal(u)}><Edit2 className="w-3.5 h-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(u.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUnidad ? "Editar Unidad" : "Nueva Unidad"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2"><Label>Nombre</Label><Input required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Sigla</Label><Input required value={formData.sigla} onChange={(e) => setFormData({ ...formData, sigla: e.target.value })} /></div>
                    <Button type="submit" className="w-full" disabled={submitting}>{submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Guardar</Button>
                </form>
            </Modal>
        </>
    )
}

// ================================
// COMPONENTE TIPOS
// ================================
function TiposTab() {
    const [tipos, setTipos] = useState<TipoRegistro[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingTipo, setEditingTipo] = useState<TipoRegistro | null>(null)
    const [formData, setFormData] = useState({ codigo: "", descripcion: "" })

    const fetchTipos = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("/api/tipos-registro", { headers: { "Authorization": `Bearer ${token}` } })
            const data = await res.json()
            if (data.success) setTipos(data.data)
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchTipos() }, [])

    const openCreateModal = () => { setEditingTipo(null); setFormData({ codigo: "", descripcion: "" }); setIsModalOpen(true) }
    const openEditModal = (t: TipoRegistro) => { setEditingTipo(t); setFormData({ codigo: t.codigo, descripcion: t.descripcion || "" }); setIsModalOpen(true) }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este tipo?")) return
        const token = localStorage.getItem("token")
        const res = await fetch(`/api/tipos-registro/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } })
        const data = await res.json()
        if (data.success) fetchTipos()
        else alert(data.message)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        const token = localStorage.getItem("token")
        const isEditing = !!editingTipo
        const url = isEditing ? `/api/tipos-registro/${editingTipo.id}` : "/api/tipos-registro"
        const body = isEditing ? { descripcion: formData.descripcion } : formData
        const res = await fetch(url, {
            method: isEditing ? "PUT" : "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })
        const data = await res.json()
        if (data.success) { setIsModalOpen(false); fetchTipos() }
        else alert(data.message)
        setSubmitting(false)
    }

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Clasifica tus mediciones por categoría.</p>
                <Button onClick={openCreateModal} size="sm" className="gap-2"><Plus className="w-4 h-4" /> Nuevo Tipo</Button>
            </div>
            <Card className="border-border/50">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead>Código</TableHead>
                                <TableHead>Descripción</TableHead>
                                <TableHead className="text-center">Mediciones</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="h-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary/50" /></TableCell></TableRow>
                            ) : tipos.map((t) => (
                                <TableRow key={t.id} className="group">
                                    <TableCell><code className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 w-fit"><Tag className="w-3 h-3" />{t.codigo}</code></TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{t.descripcion || <span className="italic opacity-50">Sin descripción</span>}</TableCell>
                                    <TableCell className="text-center text-xs text-muted-foreground">{t._count.mediciones}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditModal(t)}><Edit2 className="w-3.5 h-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(t.id)} disabled={t._count.mediciones > 0}><Trash2 className="w-3.5 h-3.5" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTipo ? "Editar Tipo" : "Nuevo Tipo"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Código</Label>
                        <Input required={!editingTipo} disabled={!!editingTipo} value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })} className={editingTipo ? "bg-muted" : ""} />
                    </div>
                    <div className="space-y-2"><Label>Descripción</Label><Input value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} /></div>
                    <Button type="submit" className="w-full" disabled={submitting}>{submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Guardar</Button>
                </form>
            </Modal>
        </>
    )
}

// ================================
// COMPONENTE ORIGENES
// ================================
function OrigenesTab() {
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
            const res = await fetch("/api/origenes", { headers: { "Authorization": `Bearer ${token}` } })
            const data = await res.json()
            if (data.success) setOrigenes(data.data)
        } catch (error) { console.error(error) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchOrigenes() }, [])

    const openCreateModal = () => { setEditingOrigen(null); setFormData({ nombre: "", descripcion: "" }); setIsModalOpen(true) }
    const openEditModal = (o: OrigenDato) => { setEditingOrigen(o); setFormData({ nombre: o.nombre, descripcion: o.descripcion || "" }); setIsModalOpen(true) }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Eliminar este origen?")) return
        const token = localStorage.getItem("token")
        const res = await fetch(`/api/origenes/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } })
        const data = await res.json()
        if (data.success) fetchOrigenes()
        else alert(data.message)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        const token = localStorage.getItem("token")
        const url = editingOrigen ? `/api/origenes/${editingOrigen.id}` : "/api/origenes"
        const res = await fetch(url, {
            method: editingOrigen ? "PUT" : "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        })
        const data = await res.json()
        if (data.success) { setIsModalOpen(false); fetchOrigenes() }
        else alert(data.message)
        setSubmitting(false)
    }

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">Define los orígenes de donde provienen los datos.</p>
                <Button onClick={openCreateModal} size="sm" className="gap-2"><Plus className="w-4 h-4" /> Nuevo Origen</Button>
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
                                <TableRow><TableCell colSpan={3} className="h-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary/50" /></TableCell></TableRow>
                            ) : origenes.map((o) => (
                                <TableRow key={o.id} className="group">
                                    <TableCell className="font-medium flex items-center gap-2"><Database className="w-4 h-4 text-primary" />{o.nombre}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">{o.descripcion || <span className="italic">Sin descripción</span>}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditModal(o)}><Edit2 className="w-3.5 h-3.5" /></Button>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(o.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingOrigen ? "Editar Origen" : "Nuevo Origen"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2"><Label>Nombre</Label><Input required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Descripción</Label><Input value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} /></div>
                    <Button type="submit" className="w-full" disabled={submitting}>{submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Guardar</Button>
                </form>
            </Modal>
        </>
    )
}

// ================================
// COMPONENTE AUDITORIA
// ================================
function AuditoriaTab() {
    const [logs, setLogs] = useState<Bitacora[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem("token")
                const res = await fetch("/api/bitacora?limit=50", { headers: { "Authorization": `Bearer ${token}` } })
                const data = await res.json()
                if (data.success) setLogs(data.data)
            } catch (e) { console.error(e) }
            finally { setLoading(false) }
        }
        fetchLogs()
    }, [])

    const getAccionColor = (accion: string) => {
        switch (accion) {
            case "CREATE": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            case "UPDATE": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case "SOFT_DELETE": return "bg-rose-500/10 text-rose-500 border-rose-500/20"
            default: return "bg-gray-500/10 text-gray-500 border-gray-500/20"
        }
    }

    return (
        <>
            <p className="text-sm text-muted-foreground mb-4">Log de todas las acciones realizadas en el sistema.</p>
            <Card className="border-border/50">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead>Fecha</TableHead>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Acción</TableHead>
                                <TableHead>Tabla</TableHead>
                                <TableHead className="text-right">IP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="h-32 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary/50" /></TableCell></TableRow>
                            ) : logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="text-xs font-mono">
                                        <div className="flex flex-col">
                                            <span>{new Date(log.fecha_evento).toLocaleDateString()}</span>
                                            <span className="text-muted-foreground">{new Date(log.fecha_evento).toLocaleTimeString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="flex items-center gap-2 text-sm"><User className="w-3.5 h-3.5 text-muted-foreground" />{log.usuario.nombre}</TableCell>
                                    <TableCell><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getAccionColor(log.accion)}`}>{log.accion}</span></TableCell>
                                    <TableCell className="flex items-center gap-2 text-sm capitalize"><Activity className="w-3.5 h-3.5 text-primary/70" />{log.tabla_afectada}</TableCell>
                                    <TableCell className="text-right text-[10px] font-mono text-muted-foreground">{log.ip_origen}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    )
}

// ================================
// PÁGINA PRINCIPAL
// ================================
export default function ConfiguracionPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight font-outfit flex items-center gap-3">
                    <Settings className="w-8 h-8 text-primary" />
                    Configuración
                </h2>
                <p className="text-muted-foreground">Administra los catálogos y parámetros del sistema.</p>
            </div>

            <Tabs defaultValue="unidades" className="space-y-4">
                <TabsList className="bg-muted/50 border border-border/50">
                    <TabsTrigger value="unidades" className="gap-2">
                        <Ruler className="w-4 h-4" /> Unidades
                    </TabsTrigger>
                    <TabsTrigger value="tipos" className="gap-2">
                        <Tag className="w-4 h-4" /> Tipos
                    </TabsTrigger>
                    <TabsTrigger value="origenes" className="gap-2">
                        <Database className="w-4 h-4" /> Orígenes
                    </TabsTrigger>
                    <TabsTrigger value="auditoria" className="gap-2">
                        <History className="w-4 h-4" /> Auditoría
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="unidades"><UnidadesTab /></TabsContent>
                <TabsContent value="tipos"><TiposTab /></TabsContent>
                <TabsContent value="origenes"><OrigenesTab /></TabsContent>
                <TabsContent value="auditoria"><AuditoriaTab /></TabsContent>
            </Tabs>
        </div>
    )
}
