/**
 * Tipos específicos del módulo de centros de cultivo.
 */

import type { lugares } from '$lib/server/db/schema';
import type { CentroInput } from '$lib/validations';

/** Centro con permisos calculados para la UI */
export type CentroConPermisos = {
	id: number;
	nombre: string;
	latitud: number | null;
	longitud: number | null;
	userId: number;
	createdAt: string | null;
	totalCiclos: number;
	isOwner: boolean;
};

/** Datos del formulario de creación/edición de centro (reutiliza tipo de validaciones) */
export type CentroFormData = CentroInput;

/** Tipo para punto geométrico PostGIS */
export type GeoPoint = {
	x: number; // longitud
	y: number; // latitud
};

/** Tipo inferido de la tabla lugares */
export type Lugar = typeof lugares.$inferSelect;