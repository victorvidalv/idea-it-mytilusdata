// --- ENDPOINT PARA REVOCAR API KEY ---
// DELETE /api/admin/api-keys/[id]

import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/middleware";
import { ApiKeysService } from "@/lib/services/api-keys";
import { apiKeyIdSchema } from "@/lib/validators/api-keys.validator";
import { handleApiError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/api-keys/[id]
 * Obtener API Key por ID
 */
export const GET = withRole(async (request: NextRequest, { params }: RouteParams) => {
    const user = (request as any).user;
    try {
        const { id } = await params;
        const validated = apiKeyIdSchema.parse({ id });

        const apiKey = await ApiKeysService.findById(validated.id);

        if (!apiKey) {
            return NextResponse.json(
                { success: false, message: "API Key no encontrada" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: apiKey,
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
 * DELETE /api/admin/api-keys/[id]
 * Revocar API Key
 */
export const DELETE = withRole(async (request: NextRequest, { params }: RouteParams) => {
    const user = (request as any).user;
    try {
        const { id } = await params;
        const validated = apiKeyIdSchema.parse({ id });

        const isAdmin = user.rol === "ADMIN";
        await ApiKeysService.revoke(validated.id, user.userId, isAdmin);

        logger.info("API Key revocada exitosamente", {
            userId: user.userId,
            apiKeyId: validated.id,
        });

        return NextResponse.json({
            success: true,
            message: "API Key revocada exitosamente",
        });
    } catch (error) {
        return handleApiError(error, {
            userId: user.userId,
            path: request.url,
            method: "DELETE",
        });
    }
}, ["ADMIN"]);
