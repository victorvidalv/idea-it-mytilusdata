// --- SERVICIO DE GESTIÓN DE API KEYS ---
// Operaciones CRUD para claves de API

import prisma from "@/lib/prisma";
import { generateApiKey, hashApiKey } from "@/lib/middleware/api-key";
import type { ApiPermission } from "@/lib/middleware/api-key";

/**
 * Datos para crear una nueva API Key
 */
export interface CreateApiKeyInput {
    nombre: string;
    permisos: ApiPermission[];
}

/**
 * Respuesta al crear una API Key (incluye la clave en texto plano UNA SOLA VEZ)
 */
export interface CreateApiKeyResponse {
    id: number;
    nombre: string;
    key: string; // Clave completa - mostrar al usuario una sola vez
    prefix: string;
    permisos: string[];
    created_at: Date;
}

/**
 * API Key listada (sin la clave real)
 */
export interface ApiKeyListItem {
    id: number;
    nombre: string;
    key_prefix: string;
    permisos: string[];
    activa: boolean;
    ultimo_uso: Date | null;
    created_at: Date;
    revocada_at: Date | null;
}

/**
 * Servicio para gestión de API Keys
 */
export const ApiKeysService = {
    /**
     * Crear una nueva API Key
     * @param data - Datos de la nueva clave
     * @param userId - ID del usuario que crea la clave
     * @returns La clave creada incluyendo el secreto (mostrarlo una sola vez)
     */
    async create(
        data: CreateApiKeyInput,
        userId: number
    ): Promise<CreateApiKeyResponse> {
        // Validar que el nombre no esté vacío
        if (!data.nombre || data.nombre.trim().length === 0) {
            throw new Error("El nombre de la API Key es requerido");
        }

        // Validar que tenga al menos un permiso
        if (!data.permisos || data.permisos.length === 0) {
            throw new Error("Debe seleccionar al menos un permiso");
        }

        // Generar clave segura
        const { key, prefix, hash } = generateApiKey();

        // Crear registro en base de datos
        const apiKey = await prisma.apiKey.create({
            data: {
                nombre: data.nombre.trim(),
                key_hash: hash,
                key_prefix: prefix,
                permisos: data.permisos,
                creado_por_id: userId,
            },
            select: {
                id: true,
                nombre: true,
                key_prefix: true,
                permisos: true,
                created_at: true,
            },
        });

        // Retornar incluyendo la clave en texto plano (única vez)
        return {
            id: apiKey.id,
            nombre: apiKey.nombre,
            key, // ¡IMPORTANTE: Esta es la única vez que se muestra!
            prefix: apiKey.key_prefix,
            permisos: apiKey.permisos,
            created_at: apiKey.created_at,
        };
    },

    /**
     * Listar todas las API Keys de un usuario
     * @param userId - ID del usuario
     * @returns Lista de API Keys (sin los secretos)
     */
    async findAllByUser(userId: number): Promise<ApiKeyListItem[]> {
        const apiKeys = await prisma.apiKey.findMany({
            where: { creado_por_id: userId },
            select: {
                id: true,
                nombre: true,
                key_prefix: true,
                permisos: true,
                activa: true,
                ultimo_uso: true,
                created_at: true,
                revocada_at: true,
            },
            orderBy: { created_at: "desc" },
        });

        return apiKeys;
    },

    /**
     * Listar todas las API Keys (solo para ADMIN)
     * @returns Lista de todas las API Keys
     */
    async findAll(): Promise<(ApiKeyListItem & { creador: { nombre: string; email: string } })[]> {
        const apiKeys = await prisma.apiKey.findMany({
            select: {
                id: true,
                nombre: true,
                key_prefix: true,
                permisos: true,
                activa: true,
                ultimo_uso: true,
                created_at: true,
                revocada_at: true,
                creador: {
                    select: { nombre: true, email: true },
                },
            },
            orderBy: { created_at: "desc" },
        });

        return apiKeys;
    },

    /**
     * Revocar (desactivar) una API Key
     * @param id - ID de la API Key
     * @param userId - ID del usuario que revoca (para verificar propiedad)
     * @param isAdmin - Si es admin puede revocar cualquier clave
     */
    async revoke(id: number, userId: number, isAdmin: boolean = false): Promise<void> {
        // Verificar que existe y pertenece al usuario (o es admin)
        const apiKey = await prisma.apiKey.findUnique({
            where: { id },
            select: { creado_por_id: true, activa: true },
        });

        if (!apiKey) {
            throw new Error("API Key no encontrada");
        }

        if (!isAdmin && apiKey.creado_por_id !== userId) {
            throw new Error("No tiene permisos para revocar esta API Key");
        }

        if (!apiKey.activa) {
            throw new Error("La API Key ya está revocada");
        }

        // Revocar la clave
        await prisma.apiKey.update({
            where: { id },
            data: {
                activa: false,
                revocada_at: new Date(),
            },
        });
    },

    /**
     * Obtener una API Key por ID
     * @param id - ID de la API Key
     */
    async findById(id: number): Promise<ApiKeyListItem | null> {
        const apiKey = await prisma.apiKey.findUnique({
            where: { id },
            select: {
                id: true,
                nombre: true,
                key_prefix: true,
                permisos: true,
                activa: true,
                ultimo_uso: true,
                created_at: true,
                revocada_at: true,
            },
        });

        return apiKey;
    },
};
