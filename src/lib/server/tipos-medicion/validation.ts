/**
 * Funciones de validación para el módulo de tipos de medición.
 */

import type { TipoMedicionFormData } from './types';

/** Resultado del parsing de FormData para tipos de medición */
export type ParseResult =
	| { success: true; data: TipoMedicionFormData }
	| { success: false; error: string };

/**
 * Extrae y valida los datos del formulario para crear un tipo de medición.
 */
export function parseCreateFormData(formData: FormData): ParseResult {
	const codigo = formData.get('codigo') as string;
	const unidadBase = formData.get('unidadBase') as string;

	if (!codigo || !unidadBase) {
		return { success: false, error: 'Código y unidad son requeridos' };
	}

	return {
		success: true,
		data: { codigo, unidadBase }
	};
}

/**
 * Extrae y valida los datos del formulario para actualizar un tipo de medición.
 */
export function parseUpdateFormData(formData: FormData):
	| { success: true; id: number; data: TipoMedicionFormData }
	| { success: false; error: string } {

	const id = Number(formData.get('id'));
	const codigo = formData.get('codigo') as string;
	const unidadBase = formData.get('unidadBase') as string;

	if (!id) {
		return { success: false, error: 'ID no proporcionado' };
	}

	if (!codigo || !unidadBase) {
		return { success: false, error: 'Todos los campos son requeridos' };
	}

	return {
		success: true,
		id,
		data: { codigo, unidadBase }
	};
}

/**
 * Extrae y valida el ID del formulario para eliminar un tipo de medición.
 */
export function parseDeleteFormData(formData: FormData):
	| { success: true; id: number }
	| { success: false; error: string } {

	const id = Number(formData.get('id'));

	if (!id) {
		return { success: false, error: 'ID no proporcionado' };
	}

	return { success: true, id };
}