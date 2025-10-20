import { useState, useEffect } from "react"
import { Lugar, Unidad, TipoRegistro } from "@/lib/types"

// Interfaz para el retorno del hook
export interface UseAnalisisDataReturn {
    lugares: Lugar[]
    unidades: Unidad[]
    tipos: TipoRegistro[]
    loading: boolean
}

// Obtener datos iniciales para análisis
export function useAnalisisData(): UseAnalisisDataReturn {
    // Estados para datos base
    const [lugares, setLugares] = useState<Lugar[]>([])
    const [unidades, setUnidades] = useState<Unidad[]>([])
    const [tipos, setTipos] = useState<TipoRegistro[]>([])
    const [loading, setLoading] = useState(true)

    // Cargar datos iniciales
    useEffect(() => {
        const fetchInitialData = async () => {
            const token = localStorage.getItem("token")
            const headers = { "Authorization": `Bearer ${token}` }

            try {
                // Obtener datos en paralelo
                const [lRes, uRes, tRes] = await Promise.all([
                    fetch("/api/lugares", { headers }),
                    fetch("/api/unidades", { headers }),
                    fetch("/api/tipos-registro", { headers })
                ])

                // Parsear respuestas
                const [l, u, t] = await Promise.all([
                    lRes.json(),
                    uRes.json(),
                    tRes.json()
                ])

                // Actualizar estados si la respuesta es exitosa
                if (l.success) setLugares(l.data)
                if (u.success) setUnidades(u.data)
                if (t.success) setTipos(t.data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        fetchInitialData()
    }, [])

    return {
        lugares,
        unidades,
        tipos,
        loading
    }
}
