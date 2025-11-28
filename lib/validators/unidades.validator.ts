/**
 * Validadores para el modelo de Unidades
 * Idioma: Español
 */

import { z } from "zod";

/**
 * Esquema para crear una nueva unidad
 */
export const createUnidadSchema = z.object({
    nombre: z.string({
        message: 'El nombre debe ser un texto'
    }).min(1, 'El nombre es requerido')
     .max(100, 'El nombre no puede exceder los 100 caracteres')
     .trim(),
    sigla: z.string({
        message: 'La sigla debe ser un texto'
    }).min(1, 'La sigla es requerida')
     .max(20, 'La sigla no puede exceder los 20 caracteres')
     .trim(),
});

/**
 * Esquema para actualizar una unidad existente
 */
export const updateUnidadSchema = createUnidadSchema.partial();

/**
 * Esquema para filtrar unidades
 */
export const filterUnidadesSchema = z.object({
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
export const unidadIdSchema = z.object({
    id: z.coerce.number({
        message: 'El ID debe ser un número'
    }).int('El ID debe ser un entero')
     .positive('El ID debe ser positivo')
     .refine((val) => !isNaN(val), 'El ID debe ser un número válido'),
});

// Tipos inferidos
export type CreateUnidadInput = z.infer<typeof createUnidadSchema>;
export type UpdateUnidadInput = z.infer<typeof updateUnidadSchema>;
export type FilterUnidadesInput = z.infer<typeof filterUnidadesSchema>;
export type UnidadIdInput = z.infer<typeof unidadIdSchema>;
