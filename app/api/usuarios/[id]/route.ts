import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withRole } from "@/lib/middleware";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/usuarios/[id]
 * Obtener usuario por ID (solo para ADMIN)
 */
export const GET = withRole(async (request: NextRequest, { params }: RouteParams) => {
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
        console.error("Error al obtener usuario:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["ADMIN"]);

/**
 * PATCH /api/usuarios/[id]
 * Actualizar usuario (solo ADMIN)
 */
export const PATCH = withRole(async (request: NextRequest, { params }: RouteParams) => {
    try {
        const { id } = await params;
        const usuarioId = parseInt(id, 10);
        const currentUser = (request as any).user;

        if (isNaN(usuarioId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { activo, rol } = body;

        // Validaciones básicas
        if (activo !== undefined && typeof activo !== "boolean") {
            return NextResponse.json(
                { success: false, message: "El campo 'activo' debe ser boolean" },
                { status: 400 }
            );
        }

        const rolesValidos = ["ADMIN", "EQUIPO", "PUBLICO"];
        if (rol !== undefined && !rolesValidos.includes(rol)) {
            return NextResponse.json(
                { success: false, message: "Rol inválido" },
                { status: 400 }
            );
        }

        // Impedir que un admin se quite su propio rol de admin o se desactive
        if (usuarioId === currentUser.userId) {
            if (activo === false) {
                return NextResponse.json(
                    { success: false, message: "No puede desactivar su propia cuenta" },
                    { status: 400 }
                );
            }
            if (rol && rol !== "ADMIN") {
                return NextResponse.json(
                    { success: false, message: "No puede quitarse el rol de administrador a sí mismo" },
                    { status: 400 }
                );
            }
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

        // Construir data para update
        const updateData: any = {};
        if (activo !== undefined) updateData.activo = activo;
        if (rol !== undefined) updateData.rol = rol;

        const usuarioActualizado = await prisma.usuario.update({
            where: { id: usuarioId },
            data: updateData,
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
                activo: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Usuario actualizado correctamente",
            data: usuarioActualizado,
        });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["ADMIN"]);
