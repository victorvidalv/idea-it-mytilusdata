/**
 * Validadores para el modelo de Lugares
 * Idioma: Español
 */

import { z } from "zod";

/**
 * Esquema para crear un nuevo lugar
 */
export const createLugarSchema = z.object({
    nombre: z.string({
        message: 'El nombre debe ser un texto'
    }).min(1, 'El nombre es requerido')
     .max(200, 'El nombre no puede exceder los 200 caracteres')
     .trim(),
    nota: z.string({
        message: 'La nota debe ser un texto'
    }).max(1000, 'La nota no puede exceder los 1000 caracteres')
     .trim()
     .optional()
     .nullable(),
    latitud: z.preprocess(
        (val) => (val === null || val === "" ? null : val),
        z.coerce.number({
            message: 'La latitud debe ser un número'
        }).min(-90, 'La latitud debe estar entre -90 y 90')
         .max(90, 'La latitud debe estar entre -90 y 90')
         .nullable()
         .optional()
    ),
    longitud: z.preprocess(
        (val) => (val === null || val === "" ? null : val),
        z.coerce.number({
            message: 'La longitud debe ser un número'
        }).min(-180, 'La longitud debe estar entre -180 y 180')
         .max(180, 'La longitud debe estar entre -180 y 180')
         .nullable()
         .optional()
    ),
});

/**
 * Esquema para actualizar un lugar existente
 */
export const updateLugarSchema = createLugarSchema.partial();

/**
 * Esquema para filtrar lugares
 */
export const filterLugaresSchema = z.object({
    q: z.string({
        message: 'La búsqueda debe ser un texto'
    }).optional(),
    page: z.preprocess(
        (val) => (val === null || val === "" ? undefined : val),
        z.coerce.number({
            message: 'La página debe ser un número'
        }).int('La página debe ser un entero')
         .min(1, 'La página debe ser al menos 1')
         .default(1)
         .optional()
    ),
    limit: z.preprocess(
        (val) => (val === null || val === "" ? undefined : val),
        z.coerce.number({
            message: 'El límite debe ser un número'
        }).int('El límite debe ser un entero')
         .min(1, 'El límite debe ser al menos 1')
         .max(100, 'El límite no puede exceder 100')
         .default(50)
         .optional()
    ),
});

/**
 * Esquema para validación de ID individual
 */
export const lugarIdSchema = z.object({
    id: z.coerce.number({
        message: 'El ID debe ser un número'
    }).int('El ID debe ser un entero')
     .positive('El ID debe ser positivo')
     .refine((val) => !isNaN(val), 'El ID debe ser un número válido'),
});

// Tipos inferidos
export type CreateLugarInput = z.infer<typeof createLugarSchema>;
export type UpdateLugarInput = z.infer<typeof updateLugarSchema>;
export type FilterLugaresInput = z.infer<typeof filterLugaresSchema>;
export type LugarIdInput = z.infer<typeof lugarIdSchema>;
