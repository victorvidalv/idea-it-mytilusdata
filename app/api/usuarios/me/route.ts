import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth, isAuthError } from "@/lib/middleware/auth";

/**
 * GET /api/usuarios/me
 * Obtener perfil del usuario autenticado
 */
export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id: auth.id },
            select: {
                id: true,
                nombre: true,
                email: true,
                activo: true,
                created_at: true,
                _count: {
                    select: {
                        mediciones: { where: { deleted_at: null } },
                        lugares: { where: { deleted_at: null } },
                        unidades: { where: { deleted_at: null } },
                    },
                },
            },
        });

        if (!usuario) {
            return NextResponse.json(
                { success: false, message: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: usuario });
    } catch (error) {
        console.error("Error al obtener perfil:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
