/**
 * Consultas de lectura para el módulo de ciclos productivos.
 */

import { db } from '$lib/server/db';
import { ciclos, lugares } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Rol } from '$lib/server/auth';
import { canViewAllCiclos } from './authorization';
import type { Ciclo, Lugar } from './types';

/**
 * Obtiene los ciclos accesibles para el usuario.
 * ADMIN e INVESTIGADOR ven todos, USUARIO solo los propios.
 */
export async function getCiclosByUser(userId: number, userRol: Rol): Promise<Ciclo[]> {
	return canViewAllCiclos(userRol)
		? await db.select().from(ciclos)
		: await db.select().from(ciclos).where(eq(ciclos.userId, userId));
}

/**
 * Obtiene un ciclo por su ID.
 */
export async function getCicloById(cicloId: number): Promise<Ciclo | undefined> {
	const [ciclo] = await db
		.select()
		.from(ciclos)
		.where(eq(ciclos.id, cicloId))
		.limit(1);

	return ciclo;
}

/**
 * Obtiene un lugar (centro) por su ID.
 */
export async function getLugarById(lugarId: number): Promise<Lugar | undefined> {
	const [lugar] = await db
		.select()
		.from(lugares)
		.where(eq(lugares.id, lugarId))
		.limit(1);

	return lugar;
}

/**
 * Obtiene los lugares (centros) accesibles para el usuario.
 * ADMIN e INVESTIGADOR ven todos, USUARIO solo los propios.
 */
export async function getLugaresByUser(userId: number, userRol: Rol): Promise<Lugar[]> {
	return canViewAllCiclos(userRol)
		? await db.select().from(lugares)
		: await db.select().from(lugares).where(eq(lugares.userId, userId));
}