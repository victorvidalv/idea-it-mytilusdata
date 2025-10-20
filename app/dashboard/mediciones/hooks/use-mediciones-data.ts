"use client"

import { useState, useEffect } from "react"
import { Medicion, Lugar, Unidad, TipoRegistro, Usuario, OrigenDato } from "@/lib/types"

interface Filters {
    lugar_id: string
    tipo_id: string
    autor_id: string
}

interface UseMedicionesDataReturn {
    mediciones: Medicion[]
    lugares: Lugar[]
    unidades: Unidad[]
    tipos: TipoRegistro[]
    origenes: OrigenDato[]
    usuarios: Usuario[]
    loading: boolean
    filters: Filters
    setFilters: (filters: Filters) => void
    fetchData: () => Promise<void>
}

// Hook personalizado para gestionar datos de mediciones
export function useMedicionesData(): UseMedicionesDataReturn {
    const [mediciones, setMediciones] = useState<Medicion[]>([])
    const [lugares, setLugares] = useState<Lugar[]>([])
    const [unidades, setUnidades] = useState<Unidad[]>([])
    const [tipos, setTipos] = useState<TipoRegistro[]>([])
    const [origenes, setOrigenes] = useState<OrigenDato[]>([])
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState<Filters>({
        lugar_id: "",
        tipo_id: "",
        autor_id: ""
    })

    // Obtener lista de mediciones y datos relacionados
    const fetchData = async () => {
        setLoading(true)
        const token = localStorage.getItem("token")
        const headers = { "Authorization": `Bearer ${token}` }

        try {
            // Construir query params con filtros activos
            const queryParams = new URLSearchParams()
            if (filters.lugar_id) queryParams.append("lugar_id", filters.lugar_id)
            if (filters.tipo_id) queryParams.append("tipo_id", filters.tipo_id)
            if (filters.autor_id) queryParams.append("autor_id", filters.autor_id)

            // Realizar peticiones paralelas a todas las APIs
            const [mRes, lRes, uRes, tRes, oRes, usRes] = await Promise.all([
                fetch(`/api/mediciones?${queryParams.toString()}`, { headers }),
                fetch("/api/lugares", { headers }),
                fetch("/api/unidades", { headers }),
                fetch("/api/tipos-registro", { headers }),
                fetch("/api/origenes", { headers }),
                fetch("/api/usuarios", { headers })
            ])

            // Parsear respuestas JSON
            const [m, l, u, t, o, us] = await Promise.all([
                mRes.json(),
                lRes.json(),
                uRes.json(),
                tRes.json(),
                oRes.json(),
                usRes.json()
            ])

            // Actualizar estados con datos recibidos
            if (m.success) setMediciones(m.data)
            if (l.success) setLugares(l.data)
            if (u.success) setUnidades(u.data)
            if (t.success) setTipos(t.data)
            if (o.success) setOrigenes(o.data)
            if (us.success) setUsuarios(us.data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    // Ejecutar fetchData cuando cambian los filtros
    useEffect(() => { fetchData() }, [filters])

    return {
        mediciones,
        lugares,
        unidades,
        tipos,
        origenes,
        usuarios,
        loading,
        filters,
        setFilters,
        fetchData
    }
}
