/**
 * Utilidades para el componente MapLibreMap
 */
import type { LngLat } from 'maplibre-gl';

/** Coordenadas por defecto (Puerto Montt, Chile) */
export const DEFAULT_LATITUDE = -41.4689;
export const DEFAULT_LONGITUDE = -72.9411;

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