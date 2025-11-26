// --- API PÚBLICA v1 - UNIDADES ---
// Endpoints para listar y crear unidades con autenticación vía API Key

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withApiKey } from "@/lib/middleware";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/v1/unidades
 * Listar todas las unidades activas
 * Requiere permiso: unidades:read
 */
export const GET = withApiKey(async (request: NextRequest) => {
    const apiKey = (request as any).apiKey;
    try {
        const { searchParams } = new URL(request.url);
        const busqueda = searchParams.get("q");

        const where: { deleted_at: null; nombre?: { contains: string; mode: "insensitive" } } = {
            deleted_at: null,
        };

        if (busqueda) {
            where.nombre = { contains: busqueda, mode: "insensitive" };
        }

        const unidades = await prisma.unidad.findMany({
            where,
            select: {
                id: true,
                nombre: true,
                sigla: true,
            },
            orderBy: { nombre: "asc" },
        });

        logger.info("API v1: Unidades listadas", {
            apiKeyId: apiKey.id,
            total: unidades.length,
        });

        return NextResponse.json({
            success: true,
            data: unidades,
            total: unidades.length,
        });
    } catch (error) {
        console.error("Error al listar unidades (API v1):", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["unidades:read"]);

/**
 * POST /api/v1/unidades
 * Crear nueva unidad
 * Requiere permiso: unidades:write
 */
export const POST = withApiKey(async (request: NextRequest) => {
    const apiKey = (request as any).apiKey;
    try {
        const body = await request.json();
        const { nombre, sigla } = body;

        // Validaciones
        if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "El nombre es requerido" },
                { status: 400 }
            );
        }

        if (!sigla || typeof sigla !== "string" || sigla.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "La sigla es requerida" },
                { status: 400 }
            );
        }

        // Crear unidad
        const nuevaUnidad = await prisma.unidad.create({
            data: {
                nombre: nombre.trim(),
                sigla: sigla.trim(),
                creado_por_id: apiKey.creado_por_id,
            },
            select: {
                id: true,
                nombre: true,
                sigla: true,
            },
        });

        logger.info("API v1: Unidad creada", {
            apiKeyId: apiKey.id,
            unidadId: nuevaUnidad.id,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Unidad creada exitosamente",
                data: nuevaUnidad,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error al crear unidad (API v1):", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["unidades:write"]);
