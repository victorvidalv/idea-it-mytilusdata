/**
 * Datos iniciales para el módulo de registros.
 */

import { db } from '$lib/server/db';
import { origenDatos } from '$lib/server/db/schema';

/** Orígenes de datos predefinidos para las mediciones */
const ORIGENES_INICIALES = [
	{ nombre: 'Manual / Terreno' },
	{ nombre: 'Laboratorio' },
	{ nombre: 'Satelital' },
	{ nombre: 'Sensor IoT' },
	{ nombre: 'PSMB' }
];

/**
 * Asegura que existan los orígenes de datos iniciales.
 * Si la tabla está vacía, inserta los orígenes predefinidos.
 */
export async function ensureOrigenesSeed(): Promise<typeof origenDatos.$inferSelect[]> {
	let origenes = await db.select().from(origenDatos);
	
	if (origenes.length === 0) {
		await db.insert(origenDatos).values(ORIGENES_INICIALES);
		origenes = await db.select().from(origenDatos);
	}
	
	return origenes;
}