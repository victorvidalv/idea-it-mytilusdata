import { MapContainer, TileLayer, Marker, Polyline, Popup, Tooltip } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { calculateDistance } from "../utils/geo-calculations"

interface Lugar {
    id: number
    nombre: string
    nota: string | null
    latitud: string | null
    longitud: string | null
    _count?: { mediciones: number }
}

interface LugaresMapProps {
    lugares: Lugar[]
    t: any
}

// Corregir problema de iconos de Leaflet en Next.js
const markerIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

// Componente para mostrar el mapa con todos los lugares y líneas de distancia
export function LugaresMap({ lugares, t }: LugaresMapProps) {
    // Filtrar lugares con coordenadas
    const lugaresConCoordenadas = lugares.filter(l => l.latitud && l.longitud)
    
    // Definir centro del mapa (Puerto Montt)
    const center: [number, number] = [-41.4693, -72.9424]
    
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
