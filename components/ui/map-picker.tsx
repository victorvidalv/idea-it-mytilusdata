"use client"

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

// Corregir problema de iconos de Leaflet en Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

interface MapPickerProps {
    lat: number | string
    lng: number | string
    onChange: (lat: number, lng: number) => void
}

function LocationMarker({ lat, lng, onChange }: MapPickerProps) {
    const map = useMap()

    useMapEvents({
        click(e) {
            onChange(e.latlng.lat, e.latlng.lng)
        },
    })

    return lat && lng ? (
        <Marker position={[Number(lat), Number(lng)]} icon={icon} />
    ) : null
}

export default function MapPicker({ lat, lng, onChange }: MapPickerProps) {
    const t = useTranslations('places')
    const center: [number, number] = [-41.4693, -72.9424] // Puerto Montt

    return (
        <div className="h-[300px] w-full rounded-lg overflow-hidden border border-border shadow-inner relative z-0">
            <MapContainer
                center={lat && lng ? [Number(lat), Number(lng)] : center}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker lat={lat} lng={lng} onChange={onChange} />
            </MapContainer>
            <div className="absolute bottom-2 left-2 z-[1000] bg-background/80 backdrop-blur px-2 py-1 rounded text-[10px] font-medium border shadow-sm">
                {t('clickToPosition')}
            </div>
        </div>
    )
}
