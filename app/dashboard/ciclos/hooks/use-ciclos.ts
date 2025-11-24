"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"

export interface Ciclo {
    id: number
    nombre: string
    fecha_siembra: string
    fecha_finalizacion: string | null
    lugar_id: number
    activo: boolean
    notas: string | null
    lugar?: { id: number; nombre: string }
    _count?: { mediciones: number }
}

export function useCiclos() {
    const [ciclos, setCiclos] = useState<Ciclo[]>([])
    const [loading, setLoading] = useState(true)
    const [lugares, setLugares] = useState<{ id: number; nombre: string }[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingCiclo, setEditingCiclo] = useState<Ciclo | null>(null)
    const [filters, setFilters] = useState({
        lugar_id: "",
        activo: ""
    })

    const [formData, setFormData] = useState({
        nombre: "",
        fecha_siembra: "",
        fecha_finalizacion: "",
        lugar_id: "",
        activo: true,
        notas: ""
    })

    const fetchLugares = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = await fetch("/api/lugares", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) setLugares(data.data)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchCiclos = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem("token")
            const params = new URLSearchParams()
            if (filters.lugar_id) params.append("lugar_id", filters.lugar_id)
            if (filters.activo) params.append("activo", filters.activo)

            const res = await fetch(`/api/ciclos?${params.toString()}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setCiclos(data.data)
            } else {
                console.error("Error fetching ciclos:", data.error)
                toast.error(data.error?.message || "Error al cargar ciclos")
            }
        } catch (error) {
            console.error("Error connection fetching ciclos:", error)
            toast.error("Error de conexión al cargar ciclos")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLugares()
    }, [])

    useEffect(() => {
        fetchCiclos()
    }, [filters])

    const openEditModal = (ciclo: Ciclo) => {
        setEditingCiclo(ciclo)
        setFormData({
            nombre: ciclo.nombre,
            fecha_siembra: ciclo.fecha_siembra ? new Date(ciclo.fecha_siembra).toISOString().split('T')[0] : "",
            fecha_finalizacion: ciclo.fecha_finalizacion ? new Date(ciclo.fecha_finalizacion).toISOString().split('T')[0] : "",
            lugar_id: ciclo.lugar_id.toString(),
            activo: ciclo.activo,
            notas: ciclo.notas || ""
        })
        setIsModalOpen(true)
    }

    const openCreateModal = () => {
        setEditingCiclo(null)
        setFormData({
            nombre: "",
            fecha_siembra: new Date().toISOString().split('T')[0],
            fecha_finalizacion: "",
            lugar_id: "",
            activo: true,
            notas: ""
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const token = localStorage.getItem("token")
            const url = editingCiclo ? `/api/ciclos/${editingCiclo.id}` : "/api/ciclos"
            const method = editingCiclo ? "PATCH" : "POST"

            const body = {
                ...formData,
                lugar_id: parseInt(formData.lugar_id),
                fecha_siembra: new Date(formData.fecha_siembra).toISOString(),
                fecha_finalizacion: formData.fecha_finalizacion ? new Date(formData.fecha_finalizacion).toISOString() : null,
            }

            const res = await fetch(url, {
                method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            })
            const data = await res.json()
            if (data.success) {
                toast.success(editingCiclo ? "Ciclo actualizado" : "Ciclo creado")
                setIsModalOpen(false)
                fetchCiclos()
            } else {
                toast.error(data.message || "Error al procesar solicitud")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error de conexión")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("¿Está seguro de que desea eliminar este ciclo de cultivo?")) return;
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`/api/ciclos/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Ciclo eliminado")
                fetchCiclos()
            } else {
                toast.error(data.message || "Error al eliminar")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error de conexión")
        }
    }

    return {
        ciclos,
        loading,
        lugares,
        filters,
        setFilters,
        isModalOpen,
        setIsModalOpen,
        submitting,
        editingCiclo,
        formData,
        setFormData,
        openEditModal,
        openCreateModal,
        handleSubmit,
        handleDelete,
        refresh: fetchCiclos
    }
}
