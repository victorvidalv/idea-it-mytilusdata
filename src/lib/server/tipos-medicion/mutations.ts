/**
 * Operaciones de escritura (CRUD) para el módulo de tipos de medición.
 */

import { db } from '$lib/server/db';
import { tiposRegistro } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { MutationResult, TipoMedicionFormData } from './types';

/**
 * Normaliza el código del tipo de medición.
 * Convierte a mayúsculas y reemplaza espacios por guiones bajos.
 */
export function normalizeCodigo(codigo: string): string {
	return codigo.toUpperCase().replace(/\s+/g, '_');
}

/**
 * Detecta si un error es de violación de unicidad (código duplicado).
 */
function isUniqueConstraintError(error: unknown): boolean {
	return error instanceof Error && error.message?.includes('UNIQUE');
}

/**
 * Crea un nuevo tipo de medición.
 */
export async function createTipoMedicion(data: TipoMedicionFormData): Promise<MutationResult> {
	const codigo = normalizeCodigo(data.codigo);

	try {
		await db.insert(tiposRegistro).values({
			codigo,
			unidadBase: data.unidadBase
		});
		return { success: true, message: 'Tipo de medición creado exitosamente' };
	} catch (error) {
		if (isUniqueConstraintError(error)) {
			return { success: false, error: true, message: 'El código ya existe', status: 400 };
		}
		return { success: false, error: true, message: 'Error interno al crear', status: 500 };
	}
}

/**
 * Actualiza un tipo de medición existente.
 */
export async function updateTipoMedicion(
	id: number,
	data: TipoMedicionFormData
): Promise<MutationResult> {
	const codigo = normalizeCodigo(data.codigo);

	try {
		await db
			.update(tiposRegistro)
			.set({ codigo, unidadBase: data.unidadBase })
			.where(eq(tiposRegistro.id, id));
		return { success: true, message: 'Tipo de medición actualizado' };
	} catch (error) {
		if (isUniqueConstraintError(error)) {
			return { success: false, error: true, message: 'El código ya existe', status: 400 };
		}
		return { success: false, error: true, message: 'Error interno al actualizar', status: 500 };
	}
}

/**
 * Elimina un tipo de medición.
 * Nota: Fallará si hay mediciones que referencian este tipo (foreign key constraint).
 */
export async function deleteTipoMedicion(id: number): Promise<MutationResult> {
	try {
		await db.delete(tiposRegistro).where(eq(tiposRegistro.id, id));
		return { success: true, message: 'Tipo de medición eliminado' };
	} catch {
		return {
			success: false,
			error: true,
			message: 'No se puede eliminar (probablemente en uso)',
			status: 400
		};
	}
}