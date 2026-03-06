import { z } from 'zod';
import { fail } from '@sveltejs/kit';

// --- Esquemas de validación ---

/** Esquema para login (email y nombre opcional) */
export const loginSchema = z.object({
	email: z.string().email('Email inválido').min(1, 'El email es requerido'),
	nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional()
});

/** Esquema para crear/editar centro de cultivo */
export const centroSchema = z.object({
	nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es muy largo'),
	latitud: z.union([
		z.number().min(-90).max(90),
		z.nan().transform(() => null),
		z.null()
	]).optional(),
	longitud: z.union([
		z.number().min(-180).max(180),
		z.nan().transform(() => null),
		z.null()
	]).optional()
});

/** Esquema para crear/editar ciclo */
export const cicloSchema = z.object({
	nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es muy largo'),
	fechaSiembra: z.string().min(1, 'La fecha de siembra es requerida'),
	lugarId: z.number().int().positive('Debe seleccionar un centro de cultivo')
});

/** Esquema para crear registro de medición */
export const registroSchema = z.object({
	valor: z.coerce.number({ message: 'El valor debe ser un número' }),
	fechaMedicion: z.string().min(1, 'La fecha de medición es requerida'),
	tipoId: z.number().int().positive('Debe seleccionar un tipo de medición'),
	origenId: z.number().int().positive('Debe seleccionar un origen'),
	cicloId: z.number().int().positive('Debe seleccionar un ciclo').optional()
});

/** Esquema completo para crear un registro (incluye lugarId y notas) */
export const registroCreateSchema = registroSchema.extend({
	lugarId: z.number().int().positive('Debe seleccionar un centro de cultivo'),
	cicloId: z.number().int().positive('Debe seleccionar un ciclo').optional().nullable(),
	notas: z.string().optional().default('')
});

// --- Tipos inferidos ---

export type LoginInput = z.infer<typeof loginSchema>;
export type CentroInput = z.infer<typeof centroSchema>;
export type CicloInput = z.infer<typeof cicloSchema>;
export type RegistroInput = z.infer<typeof registroSchema>;
export type RegistroCreateInput = z.infer<typeof registroCreateSchema>;

// --- Helper para validación ---

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
		// Convertir números
		if (key === 'latitud' || key === 'longitud' || key === 'lugarId' || 
		    key === 'tipoId' || key === 'origenId' || key === 'cicloId' || key === 'centroId') {
			data[key] = parseFloat(value as string);
		} else if (key === 'valor') {
			data[key] = parseFloat(value as string);
		} else {
			data[key] = value;
		}
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