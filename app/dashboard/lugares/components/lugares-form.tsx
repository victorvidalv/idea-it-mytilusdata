"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import dynamic from "next/dynamic"

// Componente de carga para el mapa
function MapLoadingFallback() {
    return (
        <div className="h-[300px] w-full bg-muted animate-pulse flex items-center justify-center rounded-lg border">
            Cargando mapa...
        </div>
    )
}
 
// Cargar el mapa dinámicamente para evitar errores de SSR
const MapPicker = dynamic(() => import("@/components/ui/map-picker"), {
    ssr: false,
    loading: () => <MapLoadingFallback />
})

interface LugaresFormProps {
    formData: {
        nombre: string
        nota: string
        latitud: string
        longitud: string
    }
    setFormData: (data: any) => void
    isModalOpen: boolean
    setIsModalOpen: (open: boolean) => void
    editingLugar: any
    submitting: boolean
    handleSubmit: (e: React.FormEvent) => void
    handleMapChange: (lat: number, lng: number) => void
    t: any
    tCommon: any
}

// Componente de formulario para crear/editar lugares
export function LugaresForm({
    formData,
    setFormData,
    isModalOpen,
    setIsModalOpen,
    editingLugar,
    submitting,
    handleSubmit,
    handleMapChange,
    t,
    tCommon
}: LugaresFormProps) {
    return (
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingLugar ? t('editPlace') : t('newPlace')}
            description={t('selectPointOnMap')}
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="uppercase text-[10px] font-black tracking-widest text-primary">{t('controlPointLabel')}</Label>
                        <MapPicker
                            lat={formData.latitud}
                            lng={formData.longitud}
                            onChange={handleMapChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nombre" className="text-xs font-bold">{t('fields.name')}</Label>
                            <Input
                                id="nombre"
                                placeholder={t('stationNamePlaceholder')}
                                required
                                className="font-bold"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nota" className="text-xs font-bold">{t('observationLabel')}</Label>
                            <Input
                                id="nota"
                                placeholder={t('observationPlaceholder')}
                                value={formData.nota}
                                onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-muted/30 p-3 rounded-lg border border-dashed border-primary/20">
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">{t('fields.latitude')}</Label>
                            <p className="text-sm font-mono font-bold text-primary">{formData.latitud || t('pendingCoordinates')}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">{t('fields.longitude')}</Label>
                            <p className="text-sm font-mono font-bold text-primary">{formData.longitud || t('pendingCoordinates')}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button variant="ghost" type="button" className="flex-1 font-bold text-xs uppercase" onClick={() => setIsModalOpen(false)}>{tCommon('cancel')}</Button>
                    <Button type="submit" className="flex-1 font-bold text-xs uppercase shadow-lg shadow-primary/30" disabled={submitting}>
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {tCommon('confirm')}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
