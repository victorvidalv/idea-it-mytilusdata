/**
 * Parsing y validación de datos para el módulo de orígenes de datos.
 */

import type { OrigenFormData } from './types';

/** Resultado de parsear FormData para crear origen */
export type ParseCreateResult =
	| { success: true; data: OrigenFormData }
	| { success: false; error: string };

/** Resultado de parsear FormData para actualizar origen */
export type ParseUpdateResult =
	| { success: true; id: number; data: OrigenFormData }
	| { success: false; error: string };

/** Resultado de parsear FormData para eliminar origen */
export type ParseDeleteResult =
	| { success: true; id: number }
	| { success: false; error: string };

/**
 * Parsea y valida los datos del formulario de creación.
 */
export function parseCreateForm(formData: FormData): ParseCreateResult {
	const nombre = formData.get('nombre') as string;

	if (!nombre) {
		return { success: false, error: 'El nombre es requerido' };
	}

	return { success: true, data: { nombre } };
}

/**
 * Parsea y valida los datos del formulario de actualización.
 */
export function parseUpdateForm(formData: FormData): ParseUpdateResult {
	const id = Number(formData.get('id'));
	const nombre = formData.get('nombre') as string;

	if (!id || !nombre) {
		return { success: false, error: 'ID y nombre son requeridos' };
	}

	return { success: true, id, data: { nombre } };
}

/**
 * Parsea y valida los datos del formulario de eliminación.
 */
export function parseDeleteForm(formData: FormData): ParseDeleteResult {
	const id = Number(formData.get('id'));

	if (!id) {
		return { success: false, error: 'ID no proporcionado' };
	}

	return { success: true, id };
}