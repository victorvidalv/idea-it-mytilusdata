/**
 * Consultas de lectura para el módulo de orígenes de datos.
 */

import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { origenDatos } from '$lib/server/db/schema';
import type { OrigenDatos } from './types';

/** Semillas iniciales para la tabla de orígenes de datos */
const ORIGENES_SEED = [
	{ nombre: 'Manual / Terreno' },
	{ nombre: 'Laboratorio' },
	{ nombre: 'Satelital' },
	{ nombre: 'Sensor IoT' },
	{ nombre: 'PSMB' }
] as const;

/**
 * Obtiene todos los orígenes de datos.
 */
export async function getOrigenes(): Promise<OrigenDatos[]> {
	return await db.select().from(origenDatos);
}

/**
 * Obtiene los orígenes de datos, creando las semillas si la tabla está vacía.
 */
export async function getOrigenesWithSeed(): Promise<OrigenDatos[]> {
	let origenes = await getOrigenes();

	if (origenes.length === 0) {
		await seedOrigenes();
		origenes = await getOrigenes();
	}

	return origenes;
}

/**
 * Inserta las semillas iniciales de orígenes de datos.
 */
async function seedOrigenes(): Promise<void> {
	await db.insert(origenDatos).values([...ORIGENES_SEED]);
}

/**
 * Obtiene un origen de datos por su ID.
 */
export async function getOrigenById(id: number): Promise<OrigenDatos | undefined> {
	const [origen] = await db
		.select()
		.from(origenDatos)
		.where(eq(origenDatos.id, id))
		.limit(1);

	return origen;
}