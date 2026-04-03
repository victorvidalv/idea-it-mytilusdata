/**
 * Tipos específicos del módulo de orígenes de datos.
 */

import type { origenDatos } from '$lib/server/db/schema';

/** Tipo inferido de la tabla origenDatos */
export type OrigenDatos = typeof origenDatos.$inferSelect;

/** Datos del formulario para crear/editar origen */
export type OrigenFormData = {
	nombre: string;
};

/** Resultado de operaciones de mutación */
export type MutationResult =
	| { success: true; message: string }
	| { success: false; error: string; status: number };

/** Datos de la página de orígenes */
export type OrigenesPageData = {
	authorized: boolean;
	origenes: OrigenDatos[];
};