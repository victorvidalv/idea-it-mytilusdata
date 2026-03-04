/**
 * Consultas de lectura para el módulo de centros.
 */

import { db } from '$lib/server/db';
import { lugares, ciclos } from '$lib/server/db/schema';
import { eq, count, inArray } from 'drizzle-orm';
import type { Rol } from '$lib/server/auth';
import { canViewAll } from './authorization';
import type { Lugar } from './types';

/**
 * Obtiene los centros (lugares) accesibles para el usuario.
 * ADMIN e INVESTIGADOR ven todos, USUARIO solo los propios.
 */
export async function getCentrosByUser(userId: number, userRol: Rol): Promise<Lugar[]> {
	return canViewAll(userRol)
		? await db.select().from(lugares)
		: await db.select().from(lugares).where(eq(lugares.userId, userId));
}

/**
 * Obtiene el conteo de ciclos por cada lugar.
 * Retorna un Map con lugarId -> total ciclos.
 */
export async function getCiclosCountByLugares(lugarIds: number[]): Promise<Map<number, number>> {
	if (lugarIds.length === 0) {
		return new Map();
	}

	const ciclosPorLugar = await db
		.select({ lugarId: ciclos.lugarId, total: count() })
		.from(ciclos)
		.where(inArray(ciclos.lugarId, lugarIds))
		.groupBy(ciclos.lugarId);

	return new Map(ciclosPorLugar.map((c) => [c.lugarId, c.total]));
}

/**
 * Obtiene un centro por su ID.
 */
export async function getCentroById(centroId: number): Promise<Lugar | undefined> {
	const [centro] = await db
		.select()
		.from(lugares)
		.where(eq(lugares.id, centroId))
		.limit(1);

	return centro;
}

/**
 * Cuenta los ciclos asociados a un lugar específico.
 */
export async function countCiclosByLugar(lugarId: number): Promise<number> {
	const [result] = await db
		.select({ total: count() })
		.from(ciclos)
		.where(eq(ciclos.lugarId, lugarId))
		.limit(1);

	return result?.total ?? 0;
}