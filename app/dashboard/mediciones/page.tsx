"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { Medicion, Lugar, Unidad, TipoRegistro, Usuario } from "@/lib/types"
import { MedicionesTable } from "@/components/dashboard/mediciones/mediciones-table"
import { MedicionesFilters } from "@/components/dashboard/mediciones/mediciones-filters"
import { MedicionesForm } from "@/components/dashboard/mediciones/mediciones-form"
import { MedicionesHeader } from "@/components/dashboard/mediciones/mediciones-header"

export default function MedicionesPage() {
    const [mediciones, setMediciones] = useState<Medicion[]>([])
    const [lugares, setLugares] = useState<Lugar[]>([])
    const [unidades, setUnidades] = useState<Unidad[]>([])
    const [tipos, setTipos] = useState<TipoRegistro[]>([])
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
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
            lugar_id: m.lugar.id.toString(),
            unidad_id: m.unidad.id.toString(),
            tipo_id: m.tipo.id.toString(),
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

    const handleExportCSV = async () => {
        const token = localStorage.getItem("token")
        const queryParams = new URLSearchParams()
        if (filters.lugar_id) queryParams.append("lugar_id", filters.lugar_id)
        if (filters.tipo_id) queryParams.append("tipo_id", filters.tipo_id)
        if (filters.autor_id) queryParams.append("autor_id", filters.autor_id)

        const url = `/api/mediciones/export?${queryParams.toString()}`

        try {
            const res = await fetch(url, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (res.ok) {
                const blob = await res.blob()
                const downloadUrl = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = downloadUrl
                a.download = `mediciones_${new Date().toISOString().split("T")[0]}.csv`
                document.body.appendChild(a)
                a.click()
                a.remove()
            } else {
                alert("Error al descargar el CSV")
            }
        } catch (e) {
            console.error(e)
            alert("Error al conectar con el servidor")
        }
    }

    const hasActiveFilters = filters.lugar_id || filters.tipo_id || filters.autor_id

    return (
        <div className="space-y-6">
            <MedicionesHeader
                onCreate={openCreateModal}
                onExport={handleExportCSV}
                hasFilters={!!hasActiveFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onClearFilters={() => setFilters({ lugar_id: "", tipo_id: "", autor_id: "" })}
            />

            <Card className="border-border/50">
                <CardHeader className="p-4 border-b">
                    <div className="flex items-center gap-4">
                        <Button
                            variant={showFilters ? "secondary" : "outline"}
                            size="sm"
                            className="gap-2"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4" /> Filtros
                            {hasActiveFilters && (
                                <span className="flex h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>
                        {hasActiveFilters && (
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
                        <MedicionesFilters
                            filters={filters}
                            lugares={lugares}
                            tipos={tipos}
                            usuarios={usuarios}
                            onFilterChange={setFilters}
                            onClearFilters={() => setFilters({ lugar_id: "", tipo_id: "", autor_id: "" })}
                        />
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    <MedicionesTable
                        mediciones={mediciones}
                        loading={loading}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                    />
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingMedicion ? "Editar Medición" : "Registrar Medición"}
                description={editingMedicion ? "Actualiza los datos de esta medición" : "Ingresa los datos para una nueva toma de muestra"}
            >
                <MedicionesForm
                    formData={formData}
                    lugares={lugares}
                    unidades={unidades}
                    tipos={tipos}
                    onChange={setFormData}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    isEditing={!!editingMedicion}
                />
            </Modal>
        </div>
    )
}
