"use client"

import { useEffect, useState, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Plus, MapPin, Search, Trash2, Edit2, Loader2, Globe, LayoutList, Map } from "lucide-react"
import dynamic from "next/dynamic"
import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useTranslations } from "next-intl"

// Componente de carga para el mapa
function MapLoadingFallback() {
    const t = useTranslations('places')
    return (
        <div className="h-[300px] w-full bg-muted animate-pulse flex items-center justify-center rounded-lg border">
            {t('loadingMap')}
        </div>
    )
}

// Cargar el mapa dinámicamente para evitar errores de SSR
const MapPicker = dynamic(() => import("@/components/ui/map-picker"), {
    ssr: false,
    loading: () => <MapLoadingFallback />
})

// Corregir problema de iconos de Leaflet en Next.js
const markerIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

interface Lugar {
    id: number
    nombre: string
    nota: string | null
    latitud: string | null
    longitud: string | null
    _count?: { mediciones: number }
}

// Función para calcular distancia entre dos puntos en km usando la fórmula de Haversine
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
}

// Componente para mostrar el mapa con todos los lugares y líneas de distancia
function LugaresMap({ lugares, t }: { lugares: Lugar[], t: any }) {
    const lugaresConCoordenadas = lugares.filter(l => l.latitud && l.longitud)
    const center: [number, number] = [-41.4693, -72.9424] // Puerto Montt
    
    // Calcular el centro del mapa basado en los lugares
    const mapCenter = lugaresConCoordenadas.length > 0 ? [
        lugaresConCoordenadas.reduce((sum, l) => sum + parseFloat(l.latitud!), 0) / lugaresConCoordenadas.length,
        lugaresConCoordenadas.reduce((sum, l) => sum + parseFloat(l.longitud!), 0) / lugaresConCoordenadas.length
    ] as [number, number] : center

    // Generar líneas entre todos los pares de lugares
    const lines: { from: Lugar, to: Lugar, distance: number }[] = []
    for (let i = 0; i < lugaresConCoordenadas.length; i++) {
        for (let j = i + 1; j < lugaresConCoordenadas.length; j++) {
            const from = lugaresConCoordenadas[i]
            const to = lugaresConCoordenadas[j]
            const distance = calculateDistance(
                parseFloat(from.latitud!),
                parseFloat(from.longitud!),
                parseFloat(to.latitud!),
                parseFloat(to.longitud!)
            )
            lines.push({ from, to, distance })
        }
    }

    return (
        <div className="h-[600px] w-full rounded-lg overflow-hidden border border-border shadow-inner relative z-0">
            <MapContainer
                center={mapCenter}
                zoom={lugaresConCoordenadas.length > 0 ? 10 : 13}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Marcadores para cada lugar */}
                {lugaresConCoordenadas.map((lugar) => (
                    <Marker
                        key={lugar.id}
                        position={[parseFloat(lugar.latitud!), parseFloat(lugar.longitud!)]}
                        icon={markerIcon}
                    >
                        <Popup>
                            <div className="text-sm">
                                <p className="font-bold">{lugar.nombre}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {lugar._count?.mediciones || 0} mediciones
                                </p>
                                {lugar.nota && <p className="text-xs mt-1 italic">{lugar.nota}</p>}
                            </div>
                        </Popup>
                        <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                            {lugar.nombre}
                        </Tooltip>
                    </Marker>
                ))}

                {/* Líneas de distancia entre lugares */}
                {lines.map((line, index) => (
                    <Polyline
                        key={`${line.from.id}-${line.to.id}`}
                        positions={[
                            [parseFloat(line.from.latitud!), parseFloat(line.from.longitud!)],
                            [parseFloat(line.to.latitud!), parseFloat(line.to.longitud!)]
                        ]}
                        color="#3b82f6"
                        weight={2}
                        opacity={0.6}
                        dashArray="5, 10"
                    >
                        <Tooltip direction="center" permanent={false} opacity={1}>
                            <div className="text-xs font-bold bg-white/90 px-2 py-1 rounded shadow">
                                {line.distance.toFixed(2)} km
                            </div>
                        </Tooltip>
                    </Polyline>
                ))}
            </MapContainer>
            
            {lugaresConCoordenadas.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1000]">
                    <p className="text-muted-foreground text-sm">{t('noPlacesWithCoordinates')}</p>
                </div>
            )}
        </div>
    )
}

export default function LugaresPage() {
    const t = useTranslations('places')
    const tCommon = useTranslations('common')
    const tMessages = useTranslations('messages')
    
    const [lugares, setLugares] = useState<Lugar[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [editingLugar, setEditingLugar] = useState<Lugar | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        nombre: "",
        nota: "",
        latitud: "",
        longitud: ""
    })

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

    useEffect(() => {
        fetchLugares()
    }, [search])

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

    const openCreateModal = () => {
        setEditingLugar(null)
        setFormData({ nombre: "", nota: "", latitud: "", longitud: "" })
        setIsModalOpen(true)
    }

    const handleMapChange = (lat: number, lng: number) => {
        setFormData(prev => ({
            ...prev,
            latitud: lat.toFixed(6),
            longitud: lng.toFixed(6)
        }))
    }

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

    const handleDelete = async (id: number) => {
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-outfit text-primary">{t('title')}</h2>
                    <p className="text-muted-foreground italic">{t('description')}</p>
                </div>
                <Button onClick={openCreateModal} className="gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4" /> {t('newPlace')}
                </Button>
            </div>

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

                <TabsContent value="tabla" className="space-y-4">
                    <Card className="border-border/50 bg-card/50 backdrop-blur-md shadow-xl overflow-hidden">
                        <CardHeader className="p-4 border-b bg-muted/20">
                            <div className="relative max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder={tCommon('search')}
                                    className="pl-10 h-10 border-none bg-background/50 focus-visible:ring-1"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead className="font-bold">{t('fields.name')}</TableHead>
                                        <TableHead className="font-bold">{t('fields.latitude')} / {t('fields.longitude')}</TableHead>
                                        <TableHead className="font-bold">{t('records')}</TableHead>
                                        <TableHead className="font-bold">{t('fields.description')}</TableHead>
                                        <TableHead className="text-right font-bold">{tCommon('actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-60 text-center">
                                                <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary opacity-30" />
                                            </TableCell>
                                        </TableRow>
                                    ) : lugares.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-40 text-center text-muted-foreground italic">
                                                {tCommon('loading')}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        lugares.map((lugar) => (
                                            <TableRow key={lugar.id} className="group hover:bg-primary/5 transition-all">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                                            <MapPin className="w-4 h-4" />
                                                        </div>
                                                        <span className="font-bold text-sm tracking-tight">{lugar.nombre}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {lugar.latitud ? (
                                                        <div className="flex items-center gap-2 text-xs font-mono bg-muted/50 w-fit px-2 py-1 rounded border border-border/50">
                                                            <Globe className="w-3 h-3 text-muted-foreground" />
                                                            {parseFloat(lugar.latitud).toFixed(4)}, {parseFloat(lugar.longitud!).toFixed(4)}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">{t('noCoordinates')}</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-xs font-medium text-muted-foreground">
                                                            {lugar._count?.mediciones || 0} {t('records')}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] text-xs text-muted-foreground truncate">
                                                    {lugar.nota || "—"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => openEditModal(lugar)}>
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(lugar.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

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
        </div>
    )
}
