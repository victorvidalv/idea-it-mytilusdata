import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    verifyAuth,
    isAuthError,
    getClientIp,
} from "@/lib/middleware/auth";

import { Prisma } from "@prisma/client";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/lugares/[id]
 * Obtener lugar por ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const lugarId = parseInt(id, 10);

        if (isNaN(lugarId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const lugar = await prisma.lugar.findFirst({
            where: { id: lugarId, deleted_at: null },
            include: {
                creador: {
                    select: { id: true, nombre: true, email: true },
                },
                mediciones: {
                    where: { deleted_at: null },
                    take: 20,
                    orderBy: { fecha_medicion: "desc" },
                    include: {
                        unidad: { select: { nombre: true, sigla: true } },
                        tipo: { select: { codigo: true, descripcion: true } },
                    },
                },
            },
        });

        if (!lugar) {
            return NextResponse.json(
                { success: false, message: "Lugar no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: lugar });
    } catch (error) {
        console.error("Error al obtener lugar:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/lugares/[id]
 * Actualizar lugar
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const lugarId = parseInt(id, 10);

        if (isNaN(lugarId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { nombre, nota, latitud, longitud } = body;

        // Buscar lugar existente
        const lugarExistente = await prisma.lugar.findFirst({
            where: { id: lugarId, deleted_at: null },
        });

        if (!lugarExistente) {
            return NextResponse.json(
                { success: false, message: "Lugar no encontrado" },
                { status: 404 }
            );
        }

        // Preparar datos a actualizar
        const datosActualizados: Prisma.LugarUpdateInput = {};

        if (nombre !== undefined) {
            if (typeof nombre !== "string" || nombre.trim().length === 0) {
                return NextResponse.json(
                    { success: false, message: "El nombre no puede estar vacío" },
                    { status: 400 }
                );
            }
            datosActualizados.nombre = nombre.trim();
        }

        if (nota !== undefined) {
            datosActualizados.nota = nota?.trim() || null;
        }

        if (latitud !== undefined) {
            if (latitud === null) {
                datosActualizados.latitud = null;
            } else {
                const lat = parseFloat(latitud);
                if (isNaN(lat) || lat < -90 || lat > 90) {
                    return NextResponse.json(
                        { success: false, message: "Latitud inválida (debe estar entre -90 y 90)" },
                        { status: 400 }
                    );
                }
                datosActualizados.latitud = lat;
            }
        }

        if (longitud !== undefined) {
            if (longitud === null) {
                datosActualizados.longitud = null;
            } else {
                const lng = parseFloat(longitud);
                if (isNaN(lng) || lng < -180 || lng > 180) {
                    return NextResponse.json(
                        { success: false, message: "Longitud inválida (debe estar entre -180 y 180)" },
                        { status: 400 }
                    );
                }
                datosActualizados.longitud = lng;
            }
        }

        if (Object.keys(datosActualizados).length === 0) {
            return NextResponse.json(
                { success: false, message: "No hay datos para actualizar" },
                { status: 400 }
            );
        }

        // Actualizar lugar
        const lugarActualizado = await prisma.lugar.update({
            where: { id: lugarId },
            data: datosActualizados,
            include: {
                creador: {
                    select: { id: true, nombre: true, email: true },
                },
            },
        });



        return NextResponse.json({
            success: true,
            message: "Lugar actualizado exitosamente",
            data: lugarActualizado,
        });
    } catch (error) {
        console.error("Error al actualizar lugar:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/lugares/[id]
 * Eliminar lugar (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const lugarId = parseInt(id, 10);

        if (isNaN(lugarId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        // Buscar lugar existente
        const lugar = await prisma.lugar.findFirst({
            where: { id: lugarId, deleted_at: null },
        });

        if (!lugar) {
            return NextResponse.json(
                { success: false, message: "Lugar no encontrado" },
                { status: 404 }
            );
        }

        // Verificar si tiene mediciones activas
        const medicionesActivas = await prisma.medicion.count({
            where: { lugar_id: lugarId, deleted_at: null },
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
        await prisma.lugar.update({
            where: { id: lugarId },
            data: { deleted_at: new Date() },
        });



        return NextResponse.json({
            success: true,
            message: "Lugar eliminado exitosamente",
        });
    } catch (error) {
        console.error("Error al eliminar lugar:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
