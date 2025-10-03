import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

/**
 * Middleware para restringir acceso por roles
 * @param rolesPermitidos - Lista de roles que tienen acceso
 * @returns Middleware de Next.js
 */
export function withRole(
    handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
    rolesPermitidos: string[]
) {
    return async (request: NextRequest, context?: any) => {
        try {
            const authHeader = request.headers.get("authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return NextResponse.json(
                    { success: false, error: "No autorizado" },
                    { status: 401 }
                );
            }

            const token = authHeader.substring(7);
            const decoded = verifyToken(token);

            if (!decoded) {
                return NextResponse.json(
                    { success: false, error: "Token inválido o expirado" },
                    { status: 401 }
                );
            }

            if (!rolesPermitidos.includes(decoded.rol)) {
                return NextResponse.json(
                    { success: false, error: "No tiene permisos para realizar esta acción" },
                    { status: 403 }
                );
            }

            // Adjuntar datos del usuario al request (vía headers para los handlers)
            const requestWithUser = request;
            (requestWithUser as any).user = decoded;

            return handler(requestWithUser, context);
        } catch (error) {
            console.error("Error en middleware de rol:", error);
            return NextResponse.json(
                { success: false, error: "Error interno de servidor" },
                { status: 500 }
            );
        }
    };
}
