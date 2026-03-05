/**
 * Consultas de lectura para el módulo de tipos de medición.
 */

import { db } from '$lib/server/db';
import { tiposRegistro } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { TIPOS_MEDICION_SEED, type TipoRegistro, type TipoRegistroInsert } from './types';

/**
 * Obtiene todos los tipos de registro (medición).
 */
export async function getTiposRegistro(): Promise<TipoRegistro[]> {
	return await db.select().from(tiposRegistro);
}

/**
 * Obtiene un tipo de registro por su ID.
 */
export async function getTipoRegistroById(id: number): Promise<TipoRegistro | undefined> {
	const [tipo] = await db
		.select()
		.from(tiposRegistro)
		.where(eq(tiposRegistro.id, id))
		.limit(1);

	return tipo;
}

/**
 * Verifica si la tabla de tipos de registro está vacía y la puebla con datos iniciales.
 * Retorna los tipos de registro existentes o los recién creados.
 */
export async function ensureTiposRegistroSeeded(): Promise<TipoRegistro[]> {
	let tipos = await getTiposRegistro();

	if (tipos.length === 0) {
		await db.insert(tiposRegistro).values(TIPOS_MEDICION_SEED as TipoRegistroInsert[]);
		tipos = await getTiposRegistro();
	}

	return tipos;
}