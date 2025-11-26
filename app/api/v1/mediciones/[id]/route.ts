// --- API PÚBLICA v1 - MEDICIONES [ID] ---
// Endpoints para obtener y editar medición específica

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withApiKey } from "@/lib/middleware";
import { logger } from "@/lib/utils/logger";
import { Prisma } from "@prisma/client";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/mediciones/[id]
 * Obtener medición por ID
 * Requiere permiso: mediciones:read
 */
export const GET = withApiKey(async (request: NextRequest, { params }: RouteParams) => {
    const apiKey = (request as any).apiKey;
    try {
        const { id } = await params;
        const medicionId = parseInt(id, 10);

        if (isNaN(medicionId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const medicion = await prisma.medicion.findFirst({
            where: { id: medicionId, deleted_at: null },
            select: {
                id: true,
                valor: true,
                fecha_medicion: true,
                notas: true,
                created_at: true,
                lugar: {
                    select: { id: true, nombre: true },
                },
                unidad: {
                    select: { id: true, nombre: true, sigla: true },
                },
                tipo: {
                    select: { id: true, codigo: true, descripcion: true },
                },
                origen: {
                    select: { id: true, nombre: true },
                },
                ciclo: {
                    select: { id: true, nombre: true },
                },
            },
        });

        if (!medicion) {
            return NextResponse.json(
                { success: false, message: "Medición no encontrada" },
                { status: 404 }
            );
        }

        logger.info("API v1: Medición obtenida", {
            apiKeyId: apiKey.id,
            medicionId: medicion.id,
        });

        return NextResponse.json({ success: true, data: medicion });
    } catch (error) {
        console.error("Error al obtener medición (API v1):", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["mediciones:read"]);

/**
 * PUT /api/v1/mediciones/[id]
 * Actualizar medición
 * Requiere permiso: mediciones:write
 */
export const PUT = withApiKey(async (request: NextRequest, { params }: RouteParams) => {
    const apiKey = (request as any).apiKey;
    try {
        const { id } = await params;
        const medicionId = parseInt(id, 10);

        if (isNaN(medicionId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { valor, fecha_medicion, notas, ciclo_id } = body;

        // Buscar medición existente
        const medicionExistente = await prisma.medicion.findFirst({
            where: { id: medicionId, deleted_at: null },
        });

        if (!medicionExistente) {
            return NextResponse.json(
                { success: false, message: "Medición no encontrada" },
                { status: 404 }
            );
        }

        // Preparar datos a actualizar
        const datosActualizados: Prisma.MedicionUpdateInput = {
            updated_at: new Date(),
        };

        if (valor !== undefined) {
            const valorNumerico = parseFloat(valor);
            if (isNaN(valorNumerico)) {
                return NextResponse.json(
                    { success: false, message: "El valor debe ser numérico" },
                    { status: 400 }
                );
            }
            datosActualizados.valor = valorNumerico;
        }

        if (fecha_medicion !== undefined) {
            datosActualizados.fecha_medicion = new Date(fecha_medicion);
        }

        if (notas !== undefined) {
            datosActualizados.notas = notas?.trim() || null;
        }

        if (ciclo_id !== undefined) {
            if (ciclo_id === null) {
                datosActualizados.ciclo = { disconnect: true };
            } else {
                // Verificar que el ciclo existe
                const ciclo = await prisma.ciclo.findFirst({
                    where: { id: parseInt(ciclo_id), deleted_at: null },
                });
                if (!ciclo) {
                    return NextResponse.json(
                        { success: false, message: "Ciclo no encontrado" },
                        { status: 404 }
                    );
                }
                datosActualizados.ciclo = { connect: { id: parseInt(ciclo_id) } };
            }
        }

        // Actualizar medición
        const medicionActualizada = await prisma.medicion.update({
            where: { id: medicionId },
            data: datosActualizados,
            select: {
                id: true,
                valor: true,
                fecha_medicion: true,
                notas: true,
                created_at: true,
                updated_at: true,
                lugar: {
                    select: { id: true, nombre: true },
                },
                unidad: {
                    select: { id: true, nombre: true, sigla: true },
                },
                tipo: {
                    select: { id: true, codigo: true },
                },
                ciclo: {
                    select: { id: true, nombre: true },
                },
            },
        });

        logger.info("API v1: Medición actualizada", {
            apiKeyId: apiKey.id,
            medicionId: medicionActualizada.id,
        });

        return NextResponse.json({
            success: true,
            message: "Medición actualizada exitosamente",
            data: medicionActualizada,
        });
    } catch (error) {
        console.error("Error al actualizar medición (API v1):", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["mediciones:write"]);
