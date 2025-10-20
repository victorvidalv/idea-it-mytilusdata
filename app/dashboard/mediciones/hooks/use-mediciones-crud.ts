"use client"

import { useState } from "react"
import { Medicion } from "@/lib/types"

interface FormData {
    valor: string
    fecha_medicion: string
    lugar_id: string
    unidad_id: string
    tipo_id: string
    origen_id: string
    notas: string
}

interface UseMedicionesCrudReturn {
    isModalOpen: boolean
    editingMedicion: Medicion | null
    formData: FormData
    submitting: boolean
    openCreateModal: () => void
    openEditModal: (medicion: Medicion) => void
    closeModal: () => void
    handleDelete: (id: number, onRefresh: () => void, tMessages: (key: string) => string) => Promise<void>
    handleSubmit: (e: React.FormEvent, onRefresh: () => void) => Promise<void>
    setFormData: (formData: FormData) => void
}

// Hook personalizado para gestionar operaciones CRUD de mediciones
export function useMedicionesCrud(): UseMedicionesCrudReturn {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingMedicion, setEditingMedicion] = useState<Medicion | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState<FormData>({
        valor: "",
        fecha_medicion: new Date().toISOString().split("T")[0],
        lugar_id: "",
        unidad_id: "",
        tipo_id: "",
        origen_id: "",
        notas: ""
    })

    // Abrir modal de creación de nueva medición
    const openCreateModal = () => {
        setEditingMedicion(null)
        setFormData({
            valor: "",
            fecha_medicion: new Date().toISOString().split("T")[0],
            lugar_id: "",
            unidad_id: "",
            tipo_id: "",
            origen_id: "",
            notas: ""
        })
        setIsModalOpen(true)
    }

    // Abrir modal de edición de medición existente
    const openEditModal = (medicion: Medicion) => {
        setEditingMedicion(medicion)
        setFormData({
            valor: medicion.valor.toString(),
            fecha_medicion: new Date(medicion.fecha_medicion).toISOString().split("T")[0],
            lugar_id: medicion.lugar.id.toString(),
            unidad_id: medicion.unidad.id.toString(),
            tipo_id: medicion.tipo.id.toString(),
            origen_id: medicion.origen.id.toString(),
            notas: medicion.notas || ""
        })
        setIsModalOpen(true)
    }

    // Cerrar modal
    const closeModal = () => {
        setIsModalOpen(false)
    }

    // Eliminar medición por ID
    const handleDelete = async (id: number, onRefresh: () => void, tMessages: (key: string) => string) => {
        if (!confirm(tMessages('confirm.deleteMeasurement'))) return
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`/api/mediciones/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                onRefresh()
            } else {
                alert(data.message)
            }
        } catch (e) { console.error(e) }
    }

    // Enviar formulario de creación o edición
    const handleSubmit = async (e: React.FormEvent, onRefresh: () => void) => {
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
                onRefresh()
            } else { alert(data.message) }
        } catch (e) { console.error(e) }
        finally { setSubmitting(false) }
    }

    return {
        isModalOpen,
        editingMedicion,
        formData,
        submitting,
        openCreateModal,
        openEditModal,
        closeModal,
        handleDelete,
        handleSubmit,
        setFormData
    }
}
