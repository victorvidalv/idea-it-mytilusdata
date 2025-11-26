// --- ENDPOINTS DE ADMINISTRACIÓN DE API KEYS ---
// /api/admin/api-keys - CRUD para claves de API

import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/middleware";
import { ApiKeysService } from "@/lib/services/api-keys";
import { createApiKeySchema } from "@/lib/validators/api-keys.validator";
import { handleApiError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/admin/api-keys
 * Listar todas las API Keys (solo ADMIN)
 */
export const GET = withRole(async (request: NextRequest) => {
    const user = (request as any).user;
    try {
        // Si es ADMIN, mostrar todas las claves
        // Si no, solo las propias (aunque este endpoint debería ser solo ADMIN)
        const apiKeys = user.rol === "ADMIN"
            ? await ApiKeysService.findAll()
            : await ApiKeysService.findAllByUser(user.userId);

        return NextResponse.json({
            success: true,
            data: apiKeys,
            total: apiKeys.length,
        });
    } catch (error) {
        return handleApiError(error, {
            userId: user.userId,
            path: request.url,
            method: "GET",
        });
    }
}, ["ADMIN"]);

/**
 * POST /api/admin/api-keys
 * Crear nueva API Key
 */
export const POST = withRole(async (request: NextRequest) => {
    const user = (request as any).user;
    try {
        const body = await request.json();
        const validatedData = createApiKeySchema.parse(body);

        const nuevaApiKey = await ApiKeysService.create(
            {
                nombre: validatedData.nombre,
                permisos: validatedData.permisos,
            },
            user.userId
        );

        logger.info("API Key creada exitosamente", {
            userId: user.userId,
            apiKeyId: nuevaApiKey.id,
            nombre: nuevaApiKey.nombre,
        });

        // Retornar la clave completa (única vez que se muestra)
        return NextResponse.json(
            {
                success: true,
                message: "API Key creada exitosamente. Guarde la clave, no se mostrará de nuevo.",
                data: nuevaApiKey,
            },
            { status: 201 }
        );
    } catch (error) {
        return handleApiError(error, {
            userId: user.userId,
            path: request.url,
            method: "POST",
        });
    }
}, ["ADMIN"]);
