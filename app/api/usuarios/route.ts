import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth, isAuthError } from "@/lib/middleware/auth";

/**
 * GET /api/usuarios
 * Listar usuarios activos (sin información sensible)
 */
export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { searchParams } = new URL(request.url);
        const busqueda = searchParams.get("q");
        const incluirInactivos = searchParams.get("inactivos") === "true";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (!incluirInactivos) {
            where.activo = true;
        }

        if (busqueda) {
            where.OR = [
                { nombre: { contains: busqueda } },
                { email: { contains: busqueda } },
            ];
        }

        const usuarios = await prisma.usuario.findMany({
            where,
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
            orderBy: { nombre: "asc" },
        });

        return NextResponse.json({
            success: true,
            data: usuarios,
            total: usuarios.length,
        });
    } catch (error) {
        console.error("Error al listar usuarios:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
