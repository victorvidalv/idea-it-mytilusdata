// --- API PÚBLICA v1 - UNIDADES [ID] ---
// Endpoints para obtener y editar unidad específica

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withApiKey } from "@/lib/middleware";
import { logger } from "@/lib/utils/logger";
import { Prisma } from "@prisma/client";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/unidades/[id]
 * Obtener unidad por ID
 * Requiere permiso: unidades:read
 */
export const GET = withApiKey(async (request: NextRequest, { params }: RouteParams) => {
    const apiKey = (request as any).apiKey;
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
            select: {
                id: true,
                nombre: true,
                sigla: true,
            },
        });

        if (!unidad) {
            return NextResponse.json(
                { success: false, message: "Unidad no encontrada" },
                { status: 404 }
            );
        }

        logger.info("API v1: Unidad obtenida", {
            apiKeyId: apiKey.id,
            unidadId: unidad.id,
        });

        return NextResponse.json({ success: true, data: unidad });
    } catch (error) {
        console.error("Error al obtener unidad (API v1):", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["unidades:read"]);

/**
 * PUT /api/v1/unidades/[id]
 * Actualizar unidad
 * Requiere permiso: unidades:write
 */
export const PUT = withApiKey(async (request: NextRequest, { params }: RouteParams) => {
    const apiKey = (request as any).apiKey;
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

        // Preparar datos a actualizar
        const datosActualizados: Prisma.UnidadUpdateInput = {};

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
            select: {
                id: true,
                nombre: true,
                sigla: true,
            },
        });

        logger.info("API v1: Unidad actualizada", {
            apiKeyId: apiKey.id,
            unidadId: unidadActualizada.id,
        });

        return NextResponse.json({
            success: true,
            message: "Unidad actualizada exitosamente",
            data: unidadActualizada,
        });
    } catch (error) {
        console.error("Error al actualizar unidad (API v1):", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["unidades:write"]);
