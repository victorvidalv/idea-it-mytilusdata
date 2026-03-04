/**
 * Funciones de transformación para el módulo de centros.
 */

import type { Rol } from '$lib/server/auth';
import { calculateIsOwner } from './authorization';
import type { Lugar, CentroConPermisos, GeoPoint } from './types';

/**
 * Transforma un lugar de la DB al formato esperado por el cliente.
 * Extrae latitud/longitud de la columna geom (PostGIS).
 * geom: { x: longitud, y: latitud }
 */
export function transformarLugarParaCliente(lugar: Lugar) {
	return {
		id: lugar.id,
		nombre: lugar.nombre,
		latitud: lugar.geom?.y ?? lugar.latitud ?? null,
		longitud: lugar.geom?.x ?? lugar.longitud ?? null,
		userId: lugar.userId,
		createdAt: lugar.createdAt ? new Date(lugar.createdAt).toISOString() : null
	};
}

/**
 * Construye un punto geométrico para PostGIS si las coordenadas son válidas.
 * Retorna null si alguna coordenada es null/undefined.
 */
export function buildGeoPoint(
	latitud: number | null | undefined,
	longitud: number | null | undefined
): GeoPoint | null {
	return latitud != null && longitud != null
		? { x: longitud, y: latitud }
		: null;
}

/**
 * Transforma una lista de lugares con conteo de ciclos y permisos.
 */
export function transformarCentrosConPermisos(
	lugares: Lugar[],
	conteoCiclos: Map<number, number>,
	userId: number,
	userRol: Rol
): CentroConPermisos[] {
	return lugares.map((centro) => ({
		...transformarLugarParaCliente(centro),
		totalCiclos: conteoCiclos.get(centro.id) ?? 0,
		isOwner: calculateIsOwner(centro.userId, userId, userRol)
	}));
}