import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth, isAuthError } from "@/lib/middleware/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/bitacora/[id]
 * Obtener registro de bitácora por ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const bitacoraId = parseInt(id, 10);

        if (isNaN(bitacoraId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const registro = await prisma.bitacoraCambio.findUnique({
            where: { id: bitacoraId },
            include: {
                usuario: {
                    select: { id: true, nombre: true, email: true },
                },
            },
        });

        if (!registro) {
            return NextResponse.json(
                { success: false, message: "Registro de bitácora no encontrado" },
                { status: 404 }
            );
        }

        // Parsear campo cambios JSON
        const registroParsed = {
            ...registro,
            cambios: registro.cambios ? JSON.parse(registro.cambios) : null,
        };

        return NextResponse.json({ success: true, data: registroParsed });
    } catch (error) {
        console.error("Error al obtener registro de bitácora:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
