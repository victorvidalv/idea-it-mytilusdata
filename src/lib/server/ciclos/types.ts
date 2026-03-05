/**
 * Tipos específicos del módulo de ciclos productivos.
 */

import type { ciclos, lugares } from '$lib/server/db/schema';
import type { CicloInput } from '$lib/validations';

/** Ciclo con datos enriquecidos para la UI (incluye nombre del lugar) */
export type CicloConLugar = {
	id: number;
	nombre: string;
	fechaSiembra: string | null;
	fechaFinalizacion: string | null;
	lugarId: number;
	userId: number;
	activo: boolean;
	lugarNombre: string;
	isOwner: boolean;
};

/** Datos del formulario de creación de ciclo (reutiliza tipo de validaciones) */
export type CicloFormData = CicloInput;

/** Tipo inferido de la tabla ciclos */
export type Ciclo = typeof ciclos.$inferSelect;

/** Tipo inferido de la tabla lugares (para centros) */
export type Lugar = typeof lugares.$inferSelect;

/** Resultado de operaciones de mutación */
export type MutationResult =
	| { success: true; message: string }
	| { success: false; error: true; message: string; status: number };