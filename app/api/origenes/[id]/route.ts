import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    verifyAuth,
    isAuthError,
    getClientIp,
} from "@/lib/middleware/auth";


interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/origenes/[id]
 * Obtener origen por ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const origenId = parseInt(id, 10);

        if (isNaN(origenId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const origen = await prisma.origenDato.findFirst({
            where: { id: origenId, deleted_at: null },
            include: {
                creador: {
                    select: { id: true, nombre: true, email: true },
                },
                mediciones: {
                    where: { deleted_at: null },
                    take: 10,
                    orderBy: { created_at: "desc" },
                },
            },
        });

        if (!origen) {
            return NextResponse.json(
                { success: false, message: "Origen no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: origen });
    } catch (error) {
        console.error("Error al obtener origen:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/origenes/[id]
 * Actualizar origen
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const origenId = parseInt(id, 10);

        if (isNaN(origenId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { nombre, descripcion } = body;

        // Buscar origen existente
        const origenExistente = await prisma.origenDato.findFirst({
            where: { id: origenId, deleted_at: null },
        });

        if (!origenExistente) {
            return NextResponse.json(
                { success: false, message: "Origen no encontrado" },
                { status: 404 }
            );
        }

        // Validaciones
        const datosActualizados: { nombre?: string; descripcion?: string | null } = {};

        if (nombre !== undefined) {
            if (typeof nombre !== "string" || nombre.trim().length === 0) {
                return NextResponse.json(
                    { success: false, message: "El nombre no puede estar vacío" },
                    { status: 400 }
                );
            }

            // Verificar unicidad de nombre (excepto el actual)
            const nombreDuplicado = await prisma.origenDato.findFirst({
                where: {
                    nombre: nombre.trim(),
                    deleted_at: null,
                    id: { not: origenId },
                },
            });

            if (nombreDuplicado) {
                return NextResponse.json(
                    { success: false, message: `El origen "${nombre}" ya existe` },
                    { status: 409 }
                );
            }
            datosActualizados.nombre = nombre.trim();
        }

        if (descripcion !== undefined) {
            datosActualizados.descripcion = descripcion?.trim() || null;
        }

        if (Object.keys(datosActualizados).length === 0) {
            return NextResponse.json(
                { success: false, message: "No hay datos para actualizar" },
                { status: 400 }
            );
        }

        // Actualizar origen
        const origenActualizado = await prisma.origenDato.update({
            where: { id: origenId },
            data: datosActualizados,
            include: {
                creador: {
                    select: { id: true, nombre: true, email: true },
                },
            },
        });



        return NextResponse.json({
            success: true,
            message: "Origen actualizado exitosamente",
            data: origenActualizado,
        });
    } catch (error) {
        console.error("Error al actualizar origen:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/origenes/[id]
 * Eliminar origen (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const origenId = parseInt(id, 10);

        if (isNaN(origenId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        // Buscar origen existente
        const origen = await prisma.origenDato.findFirst({
            where: { id: origenId, deleted_at: null },
        });

        if (!origen) {
            return NextResponse.json(
                { success: false, message: "Origen no encontrado" },
                { status: 404 }
            );
        }

        // Verificar si tiene mediciones activas
        const medicionesActivas = await prisma.medicion.count({
            where: { origen_id: origenId, deleted_at: null },
        });

        if (medicionesActivas > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `No se puede eliminar: tiene ${medicionesActivas} medición(es) asociada(s)`,
                },
                { status: 409 }
            );
        }

        // Soft delete
        await prisma.origenDato.update({
            where: { id: origenId },
            data: { deleted_at: new Date() },
        });



        return NextResponse.json({
            success: true,
            message: "Origen eliminado exitosamente",
        });
    } catch (error) {
        console.error("Error al eliminar origen:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
