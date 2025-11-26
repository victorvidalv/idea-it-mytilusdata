// --- API PÚBLICA v1 - CICLOS ---
// Endpoints para listar y crear ciclos con autenticación vía API Key

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withApiKey } from "@/lib/middleware";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/v1/ciclos
 * Listar todos los ciclos activos
 * Requiere permiso: ciclos:read
 */
export const GET = withApiKey(async (request: NextRequest) => {
    const apiKey = (request as any).apiKey;
    try {
        const { searchParams } = new URL(request.url);
        const lugarId = searchParams.get("lugar_id");
        const activo = searchParams.get("activo");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
        const skip = (page - 1) * limit;

        const where: any = { deleted_at: null };

        if (lugarId) {
            where.lugar_id = parseInt(lugarId);
        }

        if (activo !== null && activo !== undefined) {
            where.activo = activo === "true";
        }

        const [ciclos, total] = await Promise.all([
            prisma.ciclo.findMany({
                where,
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
                orderBy: { fecha_siembra: "desc" },
                skip,
                take: limit,
            }),
            prisma.ciclo.count({ where }),
        ]);

        logger.info("API v1: Ciclos listados", {
            apiKeyId: apiKey.id,
            total,
            page,
        });

        return NextResponse.json({
            success: true,
            data: ciclos,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error al listar ciclos (API v1):", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["ciclos:read"]);

/**
 * POST /api/v1/ciclos
 * Crear nuevo ciclo
 * Requiere permiso: ciclos:write
 */
export const POST = withApiKey(async (request: NextRequest) => {
    const apiKey = (request as any).apiKey;
    try {
        const body = await request.json();
        const { nombre, fecha_siembra, fecha_finalizacion, lugar_id, notas } = body;

        // Validaciones
        if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "El nombre es requerido" },
                { status: 400 }
            );
        }

        if (!fecha_siembra) {
            return NextResponse.json(
                { success: false, message: "La fecha de siembra es requerida" },
                { status: 400 }
            );
        }

        if (!lugar_id || isNaN(parseInt(lugar_id))) {
            return NextResponse.json(
                { success: false, message: "El lugar es requerido" },
                { status: 400 }
            );
        }

        // Verificar que el lugar existe
        const lugar = await prisma.lugar.findFirst({
            where: { id: parseInt(lugar_id), deleted_at: null },
        });

        if (!lugar) {
            return NextResponse.json(
                { success: false, message: "Lugar no encontrado" },
                { status: 404 }
            );
        }

        // Crear ciclo
        const nuevoCiclo = await prisma.ciclo.create({
            data: {
                nombre: nombre.trim(),
                fecha_siembra: new Date(fecha_siembra),
                fecha_finalizacion: fecha_finalizacion ? new Date(fecha_finalizacion) : null,
                lugar_id: parseInt(lugar_id),
                notas: notas?.trim() || null,
                creado_por_id: apiKey.creado_por_id,
            },
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

        logger.info("API v1: Ciclo creado", {
            apiKeyId: apiKey.id,
            cicloId: nuevoCiclo.id,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Ciclo creado exitosamente",
                data: nuevoCiclo,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error al crear ciclo (API v1):", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["ciclos:write"]);
