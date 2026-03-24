/**
 * Operaciones de escritura (CRUD) para el módulo de ciclos productivos.
 */

import { db } from '$lib/server/db';
import { ciclos } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { ROLES, type Rol } from '$lib/server/auth';
import { canModifyCiclo, canDeleteCiclo } from './authorization';
import { getCicloById, getLugarById } from './queries';
import type { CicloFormData, MutationResult } from './types';

/**
 * Crea un nuevo ciclo productivo.
 * Verifica que el lugar existe y el usuario tiene permisos sobre él.
 */
export async function createCiclo(
	data: CicloFormData,
	userId: number,
	userRol: Rol
): Promise<MutationResult> {
	// Verificar que el centro existe
	const lugar = await getLugarById(data.lugarId);
	if (!lugar) {
		return { success: false, error: true, message: 'Centro de cultivo no encontrado', status: 404 };
	}

	// Verificar permisos sobre el centro
	const isAdmin = userRol === ROLES.ADMIN;
	if (lugar.userId !== userId && !isAdmin) {
		return { success: false, error: true, message: 'No tiene permisos sobre este centro', status: 403 };
	}

	await db.insert(ciclos).values({
		nombre: data.nombre,
		fechaSiembra: new Date(data.fechaSiembra),
		lugarId: data.lugarId,
		userId,
		activo: true
	});

	return { success: true, message: 'Ciclo productivo creado exitosamente' };
}

/**
 * Actualiza el estado activo de un ciclo (finalizar/reactivar).
 */
export async function toggleCicloActive(
	cicloId: number,
	newActive: boolean,
	userId: number,
	userRol: Rol
): Promise<MutationResult> {
	const ciclo = await getCicloById(cicloId);

	if (!ciclo) {
		return { success: false, error: true, message: 'Ciclo no encontrado', status: 404 };
	}

	if (!canModifyCiclo(ciclo.userId, userId, userRol)) {
		return { success: false, error: true, message: 'No tiene permisos sobre este ciclo', status: 403 };
	}

	const updateData: { activo: boolean; fechaFinalizacion?: Date | null } = { activo: newActive };

	// Registrar fecha de finalización al desactivar
	if (!newActive) {
		updateData.fechaFinalizacion = new Date();
	} else {
		updateData.fechaFinalizacion = null;
	}

	await db.update(ciclos).set(updateData).where(eq(ciclos.id, cicloId));

	return { success: true, message: newActive ? 'Ciclo reactivado' : 'Ciclo finalizado' };
}

/**
 * Elimina un ciclo.
 * Verifica permisos antes de eliminar.
 */
export async function deleteCiclo(
	cicloId: number,
	userId: number,
	userRol: Rol
): Promise<MutationResult> {
	const ciclo = await getCicloById(cicloId);

	if (!ciclo) {
		return { success: false, error: true, message: 'Ciclo no encontrado', status: 404 };
	}

	if (!canDeleteCiclo(ciclo.userId, userId, userRol)) {
		return { success: false, error: true, message: 'No tiene permisos para eliminar este ciclo', status: 403 };
	}

	await db.delete(ciclos).where(eq(ciclos.id, cicloId));

	return { success: true, message: 'Ciclo eliminado exitosamente' };
}