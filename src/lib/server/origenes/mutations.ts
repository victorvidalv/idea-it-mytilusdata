/**
 * Operaciones de escritura (CRUD) para el módulo de orígenes de datos.
 */

import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { origenDatos } from '$lib/server/db/schema';
import type { MutationResult, OrigenFormData } from './types';

/**
 * Crea un nuevo origen de datos.
 */
export async function createOrigen(data: OrigenFormData): Promise<MutationResult> {
	try {
		await db.insert(origenDatos).values({ nombre: data.nombre });
		return { success: true, message: 'Origen de datos creado exitosamente' };
	} catch {
		return { success: false, error: 'Error interno al crear', status: 500 };
	}
}

/**
 * Actualiza un origen de datos existente.
 */
export async function updateOrigen(id: number, data: OrigenFormData): Promise<MutationResult> {
	try {
		await db.update(origenDatos).set({ nombre: data.nombre }).where(eq(origenDatos.id, id));
		return { success: true, message: 'Origen de datos actualizado' };
	} catch {
		return { success: false, error: 'Error interno al actualizar', status: 500 };
	}
}

/**
 * Elimina un origen de datos.
 */
export async function deleteOrigen(id: number): Promise<MutationResult> {
	try {
		await db.delete(origenDatos).where(eq(origenDatos.id, id));
		return { success: true, message: 'Origen de datos eliminado' };
	} catch {
		return { success: false, error: 'No se puede eliminar (probablemente en uso)', status: 400 };
	}
}