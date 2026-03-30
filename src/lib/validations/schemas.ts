import { z } from 'zod';

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