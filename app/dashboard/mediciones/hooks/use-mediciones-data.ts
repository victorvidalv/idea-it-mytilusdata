"use client"

import { useState, useEffect } from "react"
import { Medicion, Lugar, Unidad, TipoRegistro, Usuario, OrigenDato } from "@/lib/types"
import { useAuth } from "@/hooks/use-auth"
import { Ciclo } from "@/app/dashboard/ciclos/hooks/use-ciclos"

interface Filters {
    lugar_id: string
    tipo_id: string
    autor_id: string
    ciclo_id: string
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
}

interface UseMedicionesDataReturn {
    mediciones: Medicion[]
    lugares: Lugar[]
    unidades: Unidad[]
    tipos: TipoRegistro[]
    origenes: OrigenDato[]
    usuarios: Usuario[]
    ciclos: Ciclo[]
    loading: boolean
    filters: Filters
    pagination: Pagination
    setFilters: (filters: Filters) => void
    setPage: (page: number) => void
    fetchData: () => Promise<void>
}

// Hook personalizado para gestionar datos de mediciones
export function useMedicionesData(): UseMedicionesDataReturn {
    const { user } = useAuth()
    const [mediciones, setMediciones] = useState<Medicion[]>([])
    const [lugares, setLugares] = useState<Lugar[]>([])
    const [unidades, setUnidades] = useState<Unidad[]>([])
    const [tipos, setTipos] = useState<TipoRegistro[]>([])
    const [origenes, setOrigenes] = useState<OrigenDato[]>([])
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [ciclos, setCiclos] = useState<Ciclo[]>([])
    const [loading, setLoading] = useState(true)

    const [filters, setFilters] = useState<Filters>({
        lugar_id: "",
        tipo_id: "",
        autor_id: "",
        ciclo_id: ""
    })

    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
    })

    // Efecto para establecer el filtro de autor por defecto cuando el usuario carga
    useEffect(() => {
        if (user && !filters.autor_id && mediciones.length === 0 && loading) {
            setFilters(prev => ({ ...prev, autor_id: user.id.toString() }))
        }
    }, [user])

    const setPage = (page: number) => {
        setPagination(prev => ({ ...prev, page }))
    }

    // Obtener lista de mediciones y datos relacionados
    const fetchData = async () => {
        setLoading(true)
        const token = localStorage.getItem("token")
        const headers = { "Authorization": `Bearer ${token}` }

        try {
            // Construir query params con filtros activos y paginación
            const queryParams = new URLSearchParams()
            if (filters.lugar_id) queryParams.append("lugar_id", filters.lugar_id)
            if (filters.tipo_id) queryParams.append("tipo_id", filters.tipo_id)
            if (filters.autor_id) queryParams.append("autor_id", filters.autor_id)
            if (filters.ciclo_id) queryParams.append("ciclo_id", filters.ciclo_id)

            queryParams.append("page", pagination.page.toString())
            queryParams.append("limit", pagination.limit.toString())

            // Realizar peticiones paralelas a todas las APIs
            const [mRes, lRes, uRes, tRes, oRes, usRes, cRes] = await Promise.all([
                fetch(`/api/mediciones?${queryParams.toString()}`, { headers }),
                fetch("/api/lugares", { headers }),
                fetch("/api/unidades", { headers }),
                fetch("/api/tipos-registro", { headers }),
                fetch("/api/origenes", { headers }),
                fetch("/api/usuarios", { headers }),
                fetch("/api/ciclos", { headers })
            ])

            // Parsear respuestas JSON
            const [m, l, u, t, o, us, c] = await Promise.all([
                mRes.json(),
                lRes.json(),
                uRes.json(),
                tRes.json(),
                oRes.json(),
                usRes.json(),
                cRes.json()
            ])

            // Actualizar estados con datos recibidos
            if (m.success) {
                setMediciones(m.data)
                if (m.pagination) {
                    setPagination(prev => ({
                        ...prev,
                        total: m.pagination.total,
                        totalPages: m.pagination.totalPages,
                        hasNext: m.pagination.hasNext,
                        hasPrevious: m.pagination.hasPrevious
                    }))
                }
            }
            if (l.success) setLugares(l.data)
            if (u.success) setUnidades(u.data)
            if (t.success) setTipos(t.data)
            if (o.success) setOrigenes(o.data)
            if (us.success) setUsuarios(us.data)
            if (c.success) setCiclos(c.data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // Ejecutar fetchData cuando cambian los filtros o la página
    useEffect(() => {
        fetchData()
    }, [filters, pagination.page])

    return {
        mediciones,
        lugares,
        unidades,
        tipos,
        origenes,
        usuarios,
        ciclos,
        loading,
        filters,
        pagination,
        setFilters: (newFilters: Filters) => {
            setFilters(newFilters)
            setPagination(prev => ({ ...prev, page: 1 })) // Reset a página 1 al filtrar
        },
        setPage,
        fetchData
    }
}
