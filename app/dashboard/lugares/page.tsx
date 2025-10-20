"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, LayoutList, Map } from "lucide-react"
import { useTranslations } from "next-intl"
import { useLugares } from "./hooks/use-lugares"
import { LugaresTable } from "./components/lugares-table"
import { LugaresForm } from "./components/lugares-form"
import { LugaresMap } from "./components/lugares-map"

// Componente principal de la página de lugares
export default function LugaresPage() {
    // Obtener traducciones
    const t = useTranslations('places')
    const tCommon = useTranslations('common')
    const tMessages = useTranslations('messages')

    // Usar hook personalizado para gestionar lógica de lugares
    const {
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
    } = useLugares()

    // Manejar eliminación de lugar
    const onDelete = (id: number) => {
        handleDelete(id, tMessages)
    }

    return (
        <div className="space-y-6">
            {/* Encabezado de la página */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-outfit text-primary">{t('title')}</h2>
                    <p className="text-muted-foreground italic">{t('description')}</p>
                </div>
                <Button onClick={openCreateModal} className="gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" /> {t('newPlace')}
                </Button>
            </div>

            {/* Pestañas para cambiar entre vista de tabla y mapa */}
            <Tabs defaultValue="tabla" className="space-y-4">
                <TabsList className="bg-muted/50 border border-border/50">
                    <TabsTrigger value="tabla" className="gap-2">
                        <LayoutList className="w-4 h-4" />
                        {t('table')}
                    </TabsTrigger>
                    <TabsTrigger value="mapa" className="gap-2">
                        <Map className="w-4 h-4" />
                        {t('map')}
                    </TabsTrigger>
                </TabsList>

                {/* Contenido de la pestaña tabla */}
                <TabsContent value="tabla" className="space-y-4">
                    <LugaresTable
                        lugares={lugares}
                        loading={loading}
                        search={search}
                        setSearch={setSearch}
                        onEdit={openEditModal}
                        onDelete={onDelete}
                        t={t}
                        tCommon={tCommon}
                    />
                </TabsContent>

                {/* Contenido de la pestaña mapa */}
                <TabsContent value="mapa" className="space-y-4">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-md shadow-xl overflow-hidden">
                        <CardHeader className="p-4 border-b bg-muted/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold">{t('geographicView')}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {lugares.filter(l => l.latitud && l.longitud).length} {t('placesWithCoordinates')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-0.5 bg-blue-500" />
                                        <span>{t('distanceLines')}</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <LugaresMap lugares={lugares} t={t} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modal de formulario para crear/editar lugares */}
            <LugaresForm
                formData={formData}
                setFormData={setFormData}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                editingLugar={editingLugar}
                submitting={submitting}
                handleSubmit={handleSubmit}
                handleMapChange={handleMapChange}
                t={t}
                tCommon={tCommon}
            />
        </div>
    )
}
