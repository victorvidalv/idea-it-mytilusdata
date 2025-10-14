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

/**
 * PATCH /api/usuarios/me
 * Actualizar perfil del usuario autenticado (nombre y/o contraseña)
 */
export const PATCH = withRole(async (request: NextRequest) => {
    const userToken = (request as any).user;
    try {
        const body = await request.json();
        const { nombre, password } = body;

        // Validar que hay algo que actualizar
        if (!nombre && !password) {
            return NextResponse.json(
                { success: false, message: "No hay datos para actualizar" },
                { status: 400 }
            );
        }

        // Construir datos de actualización
        const updateData: any = {};

        if (nombre && typeof nombre === "string" && nombre.trim().length > 0) {
            updateData.nombre = nombre.trim();
        }

        if (password && typeof password === "string") {
            if (password.length < 6) {
                return NextResponse.json(
                    { success: false, message: "La contraseña debe tener al menos 6 caracteres" },
                    { status: 400 }
                );
            }
            const { hashPassword } = await import("@/lib/auth");
            updateData.password_hash = await hashPassword(password);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { success: false, message: "No hay datos válidos para actualizar" },
                { status: 400 }
            );
        }

        const usuarioActualizado = await prisma.usuario.update({
            where: { id: userToken.userId },
            data: updateData,
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Perfil actualizado exitosamente",
            data: usuarioActualizado,
        });
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["ADMIN", "EQUIPO", "PUBLICO"]);
