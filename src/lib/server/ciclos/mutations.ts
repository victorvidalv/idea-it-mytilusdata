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

// --- Helpers de resultado ---

/** Construye un resultado de error */
function errorResult(message: string, status: number): MutationResult {
	return { success: false, error: true, message, status };
}

/** Construye un resultado de éxito */
function successResult(message: string): MutationResult {
	return { success: true, message };
}

// --- Mutaciones ---

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
		return errorResult('Centro de cultivo no encontrado', 404);
	}

	// Verificar permisos sobre el centro
	const isAdmin = userRol === ROLES.ADMIN;
	if (lugar.userId !== userId && !isAdmin) {
		return errorResult('No tiene permisos sobre este centro', 403);
	}

	await db.insert(ciclos).values({
		nombre: data.nombre,
		fechaSiembra: new Date(data.fechaSiembra),
		lugarId: data.lugarId,
		userId,
		activo: true
	});

	return successResult('Ciclo productivo creado exitosamente');
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
		return errorResult('Ciclo no encontrado', 404);
	}

	if (!canModifyCiclo(ciclo.userId, userId, userRol)) {
		return errorResult('No tiene permisos sobre este ciclo', 403);
	}

	const updateData = buildToggleUpdateData(newActive);
	await db.update(ciclos).set(updateData).where(eq(ciclos.id, cicloId));

	return successResult(newActive ? 'Ciclo reactivado' : 'Ciclo finalizado');
}

/** Construye los datos de actualización para toggle de activo */
function buildToggleUpdateData(newActive: boolean): { activo: boolean; fechaFinalizacion: Date | null } {
	return {
		activo: newActive,
		fechaFinalizacion: newActive ? null : new Date()
	};
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
		return errorResult('Ciclo no encontrado', 404);
	}

	if (!canDeleteCiclo(ciclo.userId, userId, userRol)) {
		return errorResult('No tiene permisos para eliminar este ciclo', 403);
	}

	await db.delete(ciclos).where(eq(ciclos.id, cicloId));

	return successResult('Ciclo eliminado exitosamente');
}