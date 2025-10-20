"use client"

interface Filters {
    lugar_id: string
    tipo_id: string
    autor_id: string
}

interface UseMedicionesExportReturn {
    handleExportCSV: (filters: Filters, tMessages: (key: string) => string) => Promise<void>
}

// Hook personalizado para exportar mediciones a CSV
export function useMedicionesExport(): UseMedicionesExportReturn {
    // Exportar mediciones a archivo CSV
    const handleExportCSV = async (filters: Filters, tMessages: (key: string) => string) => {
        const token = localStorage.getItem("token")
        
        // Construir query params con filtros activos
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
                // Crear blob y descargar archivo
                const blob = await res.blob()
                const downloadUrl = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = downloadUrl
                a.download = `mediciones_${new Date().toISOString().split("T")[0]}.csv`
                document.body.appendChild(a)
                a.click()
                a.remove()
            } else {
                alert(tMessages('error.downloadCSV'))
            }
        } catch (e) {
            console.error(e)
            alert(tMessages('error.serverConnection'))
        }
    }

    return {
        handleExportCSV
    }
}
