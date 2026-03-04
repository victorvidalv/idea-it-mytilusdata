/**
 * Operaciones de escritura (CRUD) para el módulo de registros.
 */

import { db } from '$lib/server/db';
import { mediciones } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { ROLES, type Rol } from '$lib/server/auth';
import type { RegistroFormData, MedicionUpdateData } from './types';

/**
 * Crea un nuevo registro de medición.
 */
export async function createRegistro(
	data: RegistroFormData,
	userId: number
): Promise<void> {
	await db.insert(mediciones).values({
		valor: data.valor,
		fechaMedicion: new Date(data.fechaMedicion),
		lugarId: data.lugarId,
		cicloId: data.cicloId,
		tipoId: data.tipoId,
		origenId: data.origenId,
		notas: data.notas,
		userId
	});
}

/**
 * Actualiza un registro existente.
 * ADMIN puede actualizar cualquier registro, otros usuarios solo los propios.
 */
export async function updateRegistro(
	id: number,
	data: MedicionUpdateData,
	userId: number,
	userRol: Rol
): Promise<void> {
	if (userRol === ROLES.ADMIN) {
		await db.update(mediciones).set(data).where(eq(mediciones.id, id));
	} else {
		await db
			.update(mediciones)
			.set(data)
			.where(and(eq(mediciones.id, id), eq(mediciones.userId, userId)));
	}
}

/**
 * Elimina un registro.
 * ADMIN puede eliminar cualquier registro, otros usuarios solo los propios.
 */
export async function deleteRegistro(
	id: number,
	userId: number,
	userRol: Rol
): Promise<void> {
	if (userRol === ROLES.ADMIN) {
		await db.delete(mediciones).where(eq(mediciones.id, id));
	} else {
		await db
			.delete(mediciones)
			.where(and(eq(mediciones.id, id), eq(mediciones.userId, userId)));
	}
}