"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Filter } from "lucide-react"
import { MedicionesTable } from "@/components/dashboard/mediciones/mediciones-table"
import { MedicionesFilters } from "@/components/dashboard/mediciones/mediciones-filters"
import { MedicionesForm } from "@/components/dashboard/mediciones/mediciones-form"
import { MedicionesHeader } from "@/components/dashboard/mediciones/mediciones-header"
import { useMedicionesData } from "./hooks/use-mediciones-data"
import { useMedicionesCrud } from "./hooks/use-mediciones-crud"
import { useMedicionesExport } from "./hooks/use-mediciones-export"

// Página principal de mediciones
export default function MedicionesPage() {
    // Obtener traducciones
    const t = useTranslations('measurements')
    const tCommon = useTranslations('common')
    const tMessages = useTranslations('messages')
    
    // Estado para mostrar/ocultar filtros
    const [showFilters, setShowFilters] = useState(false)
    
    // Usar hook personalizado para datos
    const {
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
    } = useMedicionesData()

    // Usar hook personalizado para operaciones CRUD
    const {
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
    } = useMedicionesCrud()

    // Usar hook personalizado para exportación
    const { handleExportCSV } = useMedicionesExport()

    // Verificar si hay filtros activos
    const hasActiveFilters = filters.lugar_id || filters.tipo_id || filters.autor_id

    // Manejar eliminación de medición
    const handleDeleteMedicion = async (id: number) => {
        await handleDelete(id, fetchData, tMessages)
    }

    // Manejar envío de formulario
    const handleFormSubmit = async (e: React.FormEvent) => {
        await handleSubmit(e, fetchData)
    }

    // Manejar exportación a CSV
    const handleExport = async () => {
        await handleExportCSV(filters, tMessages)
    }

    return (
        <div className="space-y-6">
            {/* Header con acciones principales */}
            <MedicionesHeader
                onCreate={openCreateModal}
                onExport={handleExport}
                hasFilters={!!hasActiveFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                onClearFilters={() => setFilters({ lugar_id: "", tipo_id: "", autor_id: "" })}
            />

            {/* Tarjeta principal con tabla de mediciones */}
            <Card className="border-border/50">
                <CardHeader className="p-4 border-b">
                    {/* Barra de acciones para filtros */}
                    <div className="flex items-center gap-4">
                        {/* Botón para mostrar/ocultar filtros */}
                        <Button
                            variant={showFilters ? "secondary" : "outline"}
                            size="sm"
                            className="gap-2"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="w-4 h-4" /> {tCommon('filter')}
                            {hasActiveFilters && (
                                <span className="flex h-2 w-2 rounded-full bg-primary" />
                            )}
                        </Button>
                        
                        {/* Botón para limpiar filtros activos */}
                        {hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilters({ lugar_id: "", tipo_id: "", autor_id: "" })}
                                className="text-xs text-muted-foreground"
                            >
                                {tCommon('clear')} {tCommon('filter')}
                            </Button>
                        )}
                    </div>

                    {/* Filtros de mediciones (condicional) */}
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
                    {/* Tabla de mediciones */}
                    <MedicionesTable
                        mediciones={mediciones}
                        loading={loading}
                        onEdit={openEditModal}
                        onDelete={handleDeleteMedicion}
                    />
                </CardContent>
            </Card>

            {/* Modal para crear/editar mediciones */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingMedicion ? t('editMeasurement') : t('registerMeasurement')}
                description={editingMedicion ? t('updateMeasurementDescription') : t('createMeasurementDescription')}
            >
                <MedicionesForm
                    formData={formData}
                    lugares={lugares}
                    unidades={unidades}
                    tipos={tipos}
                    origenes={origenes}
                    onChange={setFormData}
                    onSubmit={handleFormSubmit}
                    submitting={submitting}
                    isEditing={!!editingMedicion}
                />
            </Modal>
        </div>
    )
}
