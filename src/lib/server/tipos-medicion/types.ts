/**
 * Tipos específicos del módulo de tipos de medición.
 */

import type { tiposRegistro } from '$lib/server/db/schema';

/** Tipo inferido de la tabla tipos_registro */
export type TipoRegistro = typeof tiposRegistro.$inferSelect;

/** Tipo para insertar un nuevo tipo de registro */
export type TipoRegistroInsert = typeof tiposRegistro.$inferInsert;

/** Datos del formulario de creación/edición de tipo de medición */
export type TipoMedicionFormData = {
	codigo: string;
	unidadBase: string;
};

/** Resultado de operaciones de mutación */
export type MutationResult =
	| { success: true; message: string }
	| { success: false; error: true; message: string; status: number };

/** Datos de semilla para tipos de medición iniciales */
export const TIPOS_MEDICION_SEED: TipoRegistroInsert[] = [
	{ codigo: 'TALLA_LONGITUD', unidadBase: 'mm' },
	{ codigo: 'PESO_VIVO', unidadBase: 'g' },
	{ codigo: 'TEMPERATURA_AGUA', unidadBase: 'C' },
	{ codigo: 'SALINIDAD', unidadBase: 'psu' },
	{ codigo: 'OXIGENO_DISUELTO', unidadBase: 'mg/L' },
	{ codigo: 'CLOROFILA_A', unidadBase: 'ug/L' }
];