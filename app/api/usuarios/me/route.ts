import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withRole } from "@/lib/middleware";

/**
 * GET /api/usuarios/me
 * Obtener perfil del usuario autenticado (Disponible para todos los roles)
 */
export const GET = withRole(async (request: NextRequest) => {
    const userToken = (request as any).user;
    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id: userToken.userId },
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
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
}, ["ADMIN", "EQUIPO", "PUBLICO"]);
