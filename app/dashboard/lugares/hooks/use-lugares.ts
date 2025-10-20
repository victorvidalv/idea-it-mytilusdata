"use client"

import { useState, useEffect } from "react"

interface Lugar {
    id: number
    nombre: string
    nota: string | null
    latitud: string | null
    longitud: string | null
    _count?: { mediciones: number }
}

// Hook personalizado para gestionar la lógica de lugares
export function useLugares() {
    // Definir estado de lugares
    const [lugares, setLugares] = useState<Lugar[]>([])
    
    // Definir estado de carga
    const [loading, setLoading] = useState(true)
    
    // Definir estado de búsqueda
    const [search, setSearch] = useState("")
    
    // Definir estado del modal
    const [isModalOpen, setIsModalOpen] = useState(false)
    
    // Definir estado de envío de formulario
    const [submitting, setSubmitting] = useState(false)
    
    // Definir estado del lugar en edición
    const [editingLugar, setEditingLugar] = useState<Lugar | null>(null)
    
    // Definir estado del formulario
    const [formData, setFormData] = useState({
        nombre: "",
        nota: "",
        latitud: "",
        longitud: ""
    })
 
    // Obtener lista de lugares
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

    // Obtener lugares cuando cambia la búsqueda
    useEffect(() => {
        fetchLugares()
    }, [search])

    // Abrir modal de edición
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

    // Abrir modal de creación
    const openCreateModal = () => {
        setEditingLugar(null)
        setFormData({ nombre: "", nota: "", latitud: "", longitud: "" })
        setIsModalOpen(true)
    }

    // Manejar cambio en el mapa
    const handleMapChange = (lat: number, lng: number) => {
        setFormData(prev => ({
            ...prev,
            latitud: lat.toFixed(6),
            longitud: lng.toFixed(6)
        }))
    }

    // Enviar formulario
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

    // Eliminar lugar
    const handleDelete = async (id: number, tMessages: any) => {
        if (!confirm(tMessages('confirm.delete'))) return

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

    // Retornar estado y funciones
    return {
        lugares,
        loading,
        search,
        setSearch,
        isModalOpen,
        setIsModalOpen,
        submitting,
        editingLugar,
        formData,
        setFormData,
        openEditModal,
        openCreateModal,
        handleMapChange,
        handleSubmit,
        handleDelete
    }
}
