/**
 * Operaciones de escritura (CRUD) para el módulo de registros.
 */

import { db } from '$lib/server/db';
import { mediciones } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { type Rol } from '$lib/server/auth';
import { canModifyRegistro, canDeleteRegistro } from './authorization';
import { getRegistroById } from './queries';
import type { RegistroFormData, MedicionUpdateData } from './types';

/** Resultado de operaciones de mutación */
export type MutationResult =
	| { success: true }
	| { success: false; error: string; status: number };

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
		cicloId: data.cicloId ?? null,
		tipoId: data.tipoId,
		origenId: data.origenId,
		notas: data.notas,
		userId
	});
}

/**
 * Actualiza un registro existente.
 * Verifica permisos mediante canModifyRegistro antes de actualizar.
 */
export async function updateRegistro(
	id: number,
	data: MedicionUpdateData,
	userId: number,
	userRol: Rol
): Promise<MutationResult> {
	const registro = await getRegistroById(id);
	if (!registro) {
		return { success: false, error: 'Registro no encontrado', status: 404 };
	}

	if (!canModifyRegistro(registro.userId, userId, userRol)) {
		return { success: false, error: 'No tienes permiso para modificar este registro', status: 403 };
	}

	await db.update(mediciones).set(data).where(eq(mediciones.id, id));
	return { success: true };
}

/**
 * Elimina un registro.
 * Verifica permisos mediante canDeleteRegistro antes de eliminar.
 */
export async function deleteRegistro(
	id: number,
	userId: number,
	userRol: Rol
): Promise<MutationResult> {
	const registro = await getRegistroById(id);
	if (!registro) {
		return { success: false, error: 'Registro no encontrado', status: 404 };
	}

	if (!canDeleteRegistro(registro.userId, userId, userRol)) {
		return { success: false, error: 'No tienes permiso para eliminar este registro', status: 403 };
	}

	await db.delete(mediciones).where(eq(mediciones.id, id));
	return { success: true };
}