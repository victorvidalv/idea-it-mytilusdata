import { NextRequest, NextResponse } from "next/server";
import { withCSRFProtection } from "@/lib/middleware";
import { logger } from "@/lib/utils/logger";
import type { ApiResponse } from "@/lib/types/api.types";

/**
 * GET /api/auth/csrf-token
 * Genera y envía un token CSRF en la cookie
 * Endpoint público que no requiere autenticación
 */
export const GET = withCSRFProtection(
    async (request: NextRequest): Promise<NextResponse> => {
        try {
            logger.info("CSRF token generado", {
                action: "csrf_token_generated",
                path: "/api/auth/csrf-token",
            });

            // El middleware withCSRFProtection ya genera y establece el token en la cookie
            // Solo retornamos una respuesta de éxito
            return NextResponse.json<ApiResponse<{ generated: boolean }>>({
                success: true,
                data: { generated: true },
            });
        } catch (err) {
            logger.error(
                "Error al generar token CSRF",
                err instanceof Error ? err : new Error(String(err)),
                { path: "/api/auth/csrf-token" }
            );

            return NextResponse.json<ApiResponse>(
                {
                    success: false,
                    error: {
                        code: "CSRF_GENERATION_ERROR",
                        message: "Error al generar token CSRF",
                    },
                },
                { status: 500 }
            );
        }
    }
);
