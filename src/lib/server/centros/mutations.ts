/**
 * Operaciones de escritura (CRUD) para el módulo de centros.
 */

import { db } from '$lib/server/db';
import { lugares } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Rol } from '$lib/server/auth';
import { canModifyCentro, canDeleteCentro } from './authorization';
import { getCentroById, countCiclosByLugar } from './queries';
import { buildGeoPoint } from './transforms';
import type { CentroFormData } from './types';

/** Resultado de operaciones de mutación */
export type MutationResult =
	| { success: true }
	| { success: false; error: string; status: number };

/**
 * Crea un nuevo centro de cultivo.
 */
export async function createCentro(
	data: CentroFormData,
	userId: number
): Promise<void> {
	const geom = buildGeoPoint(data.latitud, data.longitud);

	await db.insert(lugares).values({
		nombre: data.nombre,
		geom,
		userId
	});
}

/**
 * Actualiza un centro existente.
 * Retorna error si no tiene permisos.
 */
export async function updateCentro(
	centroId: number,
	data: CentroFormData,
	userId: number,
	userRol: Rol
): Promise<MutationResult> {
	const centro = await getCentroById(centroId);

	if (!centro) {
		return { success: false, error: 'Centro no encontrado', status: 404 };
	}

	if (!canModifyCentro(centro.userId, userId, userRol)) {
		return { success: false, error: 'No tiene permisos para editar este centro', status: 403 };
	}

	const geom = buildGeoPoint(data.latitud, data.longitud);

	await db
		.update(lugares)
		.set({ nombre: data.nombre, geom })
		.where(eq(lugares.id, centroId));

	return { success: true };
}

/**
 * Elimina un centro.
 * Retorna error si no tiene permisos o tiene ciclos asociados.
 */
export async function deleteCentro(
	centroId: number,
	userId: number,
	userRol: Rol
): Promise<MutationResult> {
	const centro = await getCentroById(centroId);

	if (!centro) {
		return { success: false, error: 'Centro no encontrado', status: 404 };
	}

	if (!canDeleteCentro(centro.userId, userId, userRol)) {
		return { success: false, error: 'No tiene permisos para eliminar este centro', status: 403 };
	}

	const ciclosCount = await countCiclosByLugar(centroId);

	if (ciclosCount > 0) {
		return { success: false, error: 'No se puede eliminar un centro con ciclos asociados', status: 400 };
	}

	await db.delete(lugares).where(eq(lugares.id, centroId));

	return { success: true };
}