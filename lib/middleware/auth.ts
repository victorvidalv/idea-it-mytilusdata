import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Interfaz de usuario autenticado
 */
export interface AuthenticatedUser {
    id: number;
    email: string;
    nombre: string;
    activo: boolean;
}

/**
 * Respuesta de error estándar
 */
interface ErrorResponse {
    success: false;
    message: string;
}

/**
 * Verificar autenticación de usuario desde token JWT
 * @param request - Request de Next.js
 * @returns Usuario autenticado o respuesta de error
 */
export async function verifyAuth(
    request: NextRequest
): Promise<AuthenticatedUser | NextResponse<ErrorResponse>> {
    // Obtener token del header Authorization
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: "Token de autenticación requerido",
            },
            { status: 401 }
        );
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token
    const decoded = verifyToken(token);

    if (!decoded) {
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: "Token inválido o expirado",
            },
            { status: 401 }
        );
    }

    // Buscar usuario en base de datos
    const usuario = await prisma.usuario.findUnique({
        where: { id: decoded.userId },
        select: {
            id: true,
            email: true,
            nombre: true,
            activo: true,
        },
    });

    if (!usuario) {
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: "Usuario no encontrado",
            },
            { status: 401 }
        );
    }

    if (!usuario.activo) {
        return NextResponse.json<ErrorResponse>(
            {
                success: false,
                message: "Cuenta desactivada",
            },
            { status: 403 }
        );
    }

    return usuario;
}

/**
 * Verificar si el resultado es un usuario o una respuesta de error
 */
export function isAuthError(
    result: AuthenticatedUser | NextResponse<ErrorResponse>
): result is NextResponse<ErrorResponse> {
    return result instanceof NextResponse;
}

/**
 * Obtener IP del cliente
 */
export function getClientIp(request: NextRequest): string {
    return (
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown"
    );
}
