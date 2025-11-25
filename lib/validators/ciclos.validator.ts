/**
 * Validadores para el modelo de Ciclos
 * Idioma: Español
 */

import { z } from "zod";

/**
 * Esquema para crear un nuevo ciclo
 */
export const createCicloSchema = z.object({
    nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    fecha_siembra: z.string().or(z.date()).transform((val) => new Date(val)),
    fecha_finalizacion: z.preprocess(
        (val) => (val === "" ? null : val),
        z.string().or(z.date()).nullable().optional()
    ).transform((val) => (val ? new Date(val) : null)),
    lugar_id: z.number().int().positive("El centro es requerido"),
    activo: z.boolean().default(true),
    notas: z.string().optional(),
});

/**
 * Esquema para actualizar un ciclo existente
 */
export const updateCicloSchema = createCicloSchema.partial().extend({
    id: z.number().int().positive().optional(),
});

/**
 * Esquema para filtrar ciclos
 */
export const filterCiclosSchema = z.object({
    lugar_id: z.preprocess(
        (val) => (val === null || val === "" || val === "all" ? undefined : val),
        z.coerce.number().int().positive().optional()
    ),
    activo: z.preprocess(
        (val) => (val === null || val === "" || val === "all" ? undefined : val),
        z.union([z.string(), z.boolean()]).optional().transform((val) => {
            if (typeof val === "boolean") return val;
            if (val === "true") return true;
            if (val === "false") return false;
            return undefined;
        })
    ),
    page: z.preprocess(
        (val) => (val === null || val === "" ? undefined : val),
        z.coerce.number().int().positive().default(1)
    ),
    limit: z.preprocess(
        (val) => (val === null || val === "" ? undefined : val),
        z.coerce.number().int().positive().default(20)
    ),
});

/**
 * Esquema para validación de ID individual
 */
export const cicloIdSchema = z.object({
    id: z.coerce.number().int().positive(),
});

// Tipos inferidos
export type CreateCicloInput = z.infer<typeof createCicloSchema>;
export type UpdateCicloInput = z.infer<typeof updateCicloSchema>;
export type FilterCiclosInput = z.infer<typeof filterCiclosSchema>;
