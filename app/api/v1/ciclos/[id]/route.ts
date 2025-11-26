// --- API PÚBLICA v1 - CICLOS [ID] ---
// Endpoints para obtener y editar ciclo específico

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withApiKey } from "@/lib/middleware";
import { logger } from "@/lib/utils/logger";
import { Prisma } from "@prisma/client";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/ciclos/[id]
 * Obtener ciclo por ID
 * Requiere permiso: ciclos:read
 */
export const GET = withApiKey(async (request: NextRequest, { params }: RouteParams) => {
    const apiKey = (request as any).apiKey;
    try {
        const { id } = await params;
        const cicloId = parseInt(id, 10);

        if (isNaN(cicloId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const ciclo = await prisma.ciclo.findFirst({
            where: { id: cicloId, deleted_at: null },
            select: {
                id: true,
                nombre: true,
                fecha_siembra: true,
                fecha_finalizacion: true,
                activo: true,
                notas: true,
                created_at: true,
                lugar: {
                    select: { id: true, nombre: true },
                },
                _count: {
                    select: { mediciones: { where: { deleted_at: null } } },
                },
            },
        });

        if (!ciclo) {
            return NextResponse.json(
                { success: false, message: "Ciclo no encontrado" },
                { status: 404 }
            );
        }

        logger.info("API v1: Ciclo obtenido", {
            apiKeyId: apiKey.id,
            cicloId: ciclo.id,
        });

        return NextResponse.json({ success: true, data: ciclo });
    } catch (error) {
        console.error("Error al obtener ciclo (API v1):", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["ciclos:read"]);

/**
 * PUT /api/v1/ciclos/[id]
 * Actualizar ciclo
 * Requiere permiso: ciclos:write
 */
export const PUT = withApiKey(async (request: NextRequest, { params }: RouteParams) => {
    const apiKey = (request as any).apiKey;
    try {
        const { id } = await params;
        const cicloId = parseInt(id, 10);

        if (isNaN(cicloId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { nombre, fecha_siembra, fecha_finalizacion, activo, notas } = body;

        // Buscar ciclo existente
        const cicloExistente = await prisma.ciclo.findFirst({
            where: { id: cicloId, deleted_at: null },
        });

        if (!cicloExistente) {
            return NextResponse.json(
                { success: false, message: "Ciclo no encontrado" },
                { status: 404 }
            );
        }

        // Preparar datos a actualizar
        const datosActualizados: Prisma.CicloUpdateInput = {};

        if (nombre !== undefined) {
            if (typeof nombre !== "string" || nombre.trim().length === 0) {
                return NextResponse.json(
                    { success: false, message: "El nombre no puede estar vacío" },
                    { status: 400 }
                );
            }
            datosActualizados.nombre = nombre.trim();
        }

        if (fecha_siembra !== undefined) {
            datosActualizados.fecha_siembra = new Date(fecha_siembra);
        }

        if (fecha_finalizacion !== undefined) {
            datosActualizados.fecha_finalizacion = fecha_finalizacion
                ? new Date(fecha_finalizacion)
                : null;
        }

        if (activo !== undefined) {
            datosActualizados.activo = Boolean(activo);
        }

        if (notas !== undefined) {
            datosActualizados.notas = notas?.trim() || null;
        }

        if (Object.keys(datosActualizados).length === 0) {
            return NextResponse.json(
                { success: false, message: "No hay datos para actualizar" },
                { status: 400 }
            );
        }

        // Actualizar ciclo
        const cicloActualizado = await prisma.ciclo.update({
            where: { id: cicloId },
            data: datosActualizados,
            select: {
                id: true,
                nombre: true,
                fecha_siembra: true,
                fecha_finalizacion: true,
                activo: true,
                notas: true,
                created_at: true,
                lugar: {
                    select: { id: true, nombre: true },
                },
            },
        });

        logger.info("API v1: Ciclo actualizado", {
            apiKeyId: apiKey.id,
            cicloId: cicloActualizado.id,
        });

        return NextResponse.json({
            success: true,
            message: "Ciclo actualizado exitosamente",
            data: cicloActualizado,
        });
    } catch (error) {
        console.error("Error al actualizar ciclo (API v1):", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["ciclos:write"]);
