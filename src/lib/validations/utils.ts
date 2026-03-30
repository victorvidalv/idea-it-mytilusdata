import { z } from 'zod';
import { fail } from '@sveltejs/kit';

// --- Tipos y helpers para validación ---

export type ValidationResult<T> = 
	| { success: true; data: T }
	| { success: false; errors: Record<string, string[]> };

/**
 * Valida datos contra un esquema Zod y retorna resultado estructurado.
 */
export function validateFormData<T>(
	schema: z.ZodSchema<T>,
	data: Record<string, unknown>
): ValidationResult<T> {
	const result = schema.safeParse(data);
	
	if (result.success) {
		return { success: true, data: result.data };
	}
	
	const errors: Record<string, string[]> = {};
	for (const issue of result.error.issues) {
		const path = issue.path.join('.') || '_form';
		if (!errors[path]) errors[path] = [];
		errors[path].push(issue.message);
	}
	
	return { success: false, errors };
}

/** Campos numéricos comunes en formularios */
const NUMERIC_FIELDS = new Set([
	'latitud', 'longitud', 'lugarId', 'tipoId', 
	'origenId', 'cicloId', 'centroId', 'valor'
]);

/**
 * Convierte un valor de FormData a su tipo apropiado.
 */
function parseFieldValue(key: string, value: FormDataEntryValue): unknown {
	if (NUMERIC_FIELDS.has(key)) {
		return parseFloat(value as string);
	}
	return value;
}

/**
 * Valida FormData y retorna datos parseados o fail() de SvelteKit.
 * Útil para form actions.
 */
export async function parseFormData<T>(
	schema: z.ZodSchema<T>,
	formData: FormData
): Promise<{ success: true; data: T } | { success: false; response: ReturnType<typeof fail> }> {
	const data: Record<string, unknown> = {};
	
	for (const [key, value] of formData.entries()) {
		data[key] = parseFieldValue(key, value);
	}
	
	const result = validateFormData(schema, data);
	
	if (result.success) {
		return { success: true, data: result.data };
	}
	
	// Extraer primer error general para mensaje
	const firstError = Object.values(result.errors)[0]?.[0] || 'Datos inválidos';
	
	return {
		success: false,
		response: fail(400, {
			error: true,
			message: firstError,
			errors: result.errors
		})
	};
}