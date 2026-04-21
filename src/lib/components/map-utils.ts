/**
 * Utilidades para el componente MapLibreMap
 */
import type { LngLat, Map as MapLibreMapType } from 'maplibre-gl';

/** Coordenadas por defecto (Puerto Montt, Chile) */
export const DEFAULT_LATITUDE = -41.4689;
export const DEFAULT_LONGITUDE = -72.9411;

/**
 * Formatea coordenadas a 4 decimales de precisión
 * Usado al seleccionar coordenadas desde el mapa
 */
export function formatCoordinate(value: number): string {
	return (Math.round(value * 10000) / 10000).toString();
}

/**
 * Procesa coordenadas del mapa y retorna strings formateados
 */
export function processMapCoordinates(coords: { lat: number; lng: number }): {
	lat: string;
	lng: string;
} {
	return {
		lat: formatCoordinate(coords.lat),
		lng: formatCoordinate(coords.lng)
	};
}

/**
 * Determina si las coordenadas son personalizadas (diferentes del default)
 */
export function hasCustomCoordinates(lat: number, lng: number): boolean {
	return lat !== DEFAULT_LATITUDE || lng !== DEFAULT_LONGITUDE;
}

/**
 * Crea un objeto LngLat a partir de coordenadas
 */
export function createLngLat(lng: number, lat: number): LngLat {
	return { lng, lat } as LngLat;
}

/**
 * Obtiene las coordenadas iniciales del marcador
 * Retorna null si usa coordenadas por defecto, o LngLat si son personalizadas
 */
export function getInitialMarkerPosition(lat: number, lng: number): LngLat | null {
	return hasCustomCoordinates(lat, lng) ? createLngLat(lng, lat) : null;
}

/**
 * Programa llamadas a resize para asegurar renderizado correcto del mapa
 */
export function scheduleMapResize(map: MapLibreMapType): void {
	setTimeout(() => map.resize(), 100);
	setTimeout(() => map.resize(), 300);
}