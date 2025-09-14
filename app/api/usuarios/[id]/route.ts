import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth, isAuthError } from "@/lib/middleware/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/usuarios/[id]
 * Obtener usuario por ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const usuarioId = parseInt(id, 10);

        if (isNaN(usuarioId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
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
        console.error("Error al obtener usuario:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/usuarios/[id]
 * Desactivar/activar usuario (solo administración)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const usuarioId = parseInt(id, 10);

        if (isNaN(usuarioId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        // No permitir desactivarse a sí mismo
        if (usuarioId === auth.id) {
            return NextResponse.json(
                { success: false, message: "No puede desactivar su propia cuenta" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { activo } = body;

        if (activo === undefined || typeof activo !== "boolean") {
            return NextResponse.json(
                { success: false, message: "El campo 'activo' (boolean) es requerido" },
                { status: 400 }
            );
        }

        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
        });

        if (!usuario) {
            return NextResponse.json(
                { success: false, message: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        const usuarioActualizado = await prisma.usuario.update({
            where: { id: usuarioId },
            data: { activo },
            select: {
                id: true,
                nombre: true,
                email: true,
                activo: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: activo ? "Usuario activado" : "Usuario desactivado",
            data: usuarioActualizado,
        });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
