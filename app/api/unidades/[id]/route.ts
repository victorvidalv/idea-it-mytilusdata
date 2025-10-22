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
 * GET /api/unidades/[id]
 * Obtener unidad por ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const unidadId = parseInt(id, 10);

        if (isNaN(unidadId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const unidad = await prisma.unidad.findFirst({
            where: { id: unidadId, deleted_at: null },
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

        if (!unidad) {
            return NextResponse.json(
                { success: false, message: "Unidad no encontrada" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: unidad });
    } catch (error) {
        console.error("Error al obtener unidad:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/unidades/[id]
 * Actualizar unidad
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const unidadId = parseInt(id, 10);

        if (isNaN(unidadId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { nombre, sigla } = body;

        // Buscar unidad existente
        const unidadExistente = await prisma.unidad.findFirst({
            where: { id: unidadId, deleted_at: null },
        });

        if (!unidadExistente) {
            return NextResponse.json(
                { success: false, message: "Unidad no encontrada" },
                { status: 404 }
            );
        }

        // Validaciones
        const datosActualizados: { nombre?: string; sigla?: string } = {};

        if (nombre !== undefined) {
            if (typeof nombre !== "string" || nombre.trim().length === 0) {
                return NextResponse.json(
                    { success: false, message: "El nombre no puede estar vacío" },
                    { status: 400 }
                );
            }
            datosActualizados.nombre = nombre.trim();
        }

        if (sigla !== undefined) {
            if (typeof sigla !== "string" || sigla.trim().length === 0) {
                return NextResponse.json(
                    { success: false, message: "La sigla no puede estar vacía" },
                    { status: 400 }
                );
            }

            // Verificar unicidad de sigla (excepto la actual)
            const siglaDuplicada = await prisma.unidad.findFirst({
                where: {
                    sigla: sigla.trim(),
                    deleted_at: null,
                    id: { not: unidadId },
                },
            });

            if (siglaDuplicada) {
                return NextResponse.json(
                    { success: false, message: `La sigla "${sigla}" ya existe` },
                    { status: 409 }
                );
            }
            datosActualizados.sigla = sigla.trim();
        }

        if (Object.keys(datosActualizados).length === 0) {
            return NextResponse.json(
                { success: false, message: "No hay datos para actualizar" },
                { status: 400 }
            );
        }

        // Actualizar unidad
        const unidadActualizada = await prisma.unidad.update({
            where: { id: unidadId },
            data: datosActualizados,
            include: {
                creador: {
                    select: { id: true, nombre: true, email: true },
                },
            },
        });



        return NextResponse.json({
            success: true,
            message: "Unidad actualizada exitosamente",
            data: unidadActualizada,
        });
    } catch (error) {
        console.error("Error al actualizar unidad:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/unidades/[id]
 * Eliminar unidad (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const unidadId = parseInt(id, 10);

        if (isNaN(unidadId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        // Buscar unidad existente
        const unidad = await prisma.unidad.findFirst({
            where: { id: unidadId, deleted_at: null },
        });

        if (!unidad) {
            return NextResponse.json(
                { success: false, message: "Unidad no encontrada" },
                { status: 404 }
            );
        }

        // Verificar si tiene mediciones activas
        const medicionesActivas = await prisma.medicion.count({
            where: { unidad_id: unidadId, deleted_at: null },
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
        await prisma.unidad.update({
            where: { id: unidadId },
            data: { deleted_at: new Date() },
        });



        return NextResponse.json({
            success: true,
            message: "Unidad eliminada exitosamente",
        });
    } catch (error) {
        console.error("Error al eliminar unidad:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
