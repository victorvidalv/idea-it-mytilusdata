// --- VALIDADORES ZOD PARA API KEYS ---
// Esquemas de validación para operaciones con claves de API

import { z } from "zod";

/**
 * Permisos disponibles para API Keys
 */
export const PERMISOS_DISPONIBLES = [
    "lugares:read",
    "lugares:write",
    "ciclos:read",
    "ciclos:write",
    "mediciones:read",
    "mediciones:write",
    "unidades:read",
    "unidades:write",
] as const;

/**
 * Schema para validar permisos
 */
const permisoSchema = z.enum(PERMISOS_DISPONIBLES);

/**
 * Schema para crear una nueva API Key
 */
export const createApiKeySchema = z.object({
    nombre: z
        .string()
        .min(1, "El nombre es requerido")
        .max(100, "El nombre no puede exceder 100 caracteres")
        .transform((val) => val.trim()),
    permisos: z
        .array(permisoSchema)
        .min(1, "Debe seleccionar al menos un permiso")
        .max(PERMISOS_DISPONIBLES.length, "Permisos inválidos"),
});

/**
 * Schema para validar ID de API Key
 */
export const apiKeyIdSchema = z.object({
    id: z.coerce.number().int().positive("ID inválido"),
});

/**
 * Tipos inferidos de los schemas
 */
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type ApiKeyIdInput = z.infer<typeof apiKeyIdSchema>;
