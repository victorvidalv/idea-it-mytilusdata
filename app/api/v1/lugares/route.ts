// --- API PÚBLICA v1 - LUGARES ---
// Endpoints para listar y crear lugares con autenticación vía API Key

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withApiKey } from "@/lib/middleware";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/v1/lugares
 * Listar todos los lugares activos
 * Requiere permiso: lugares:read
 */
export const GET = withApiKey(async (request: NextRequest) => {
    const apiKey = (request as any).apiKey;
    try {
        const { searchParams } = new URL(request.url);
        const busqueda = searchParams.get("q");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
        const skip = (page - 1) * limit;

        const where: { deleted_at: null; nombre?: { contains: string; mode: "insensitive" } } = {
            deleted_at: null,
        };

        if (busqueda) {
            where.nombre = { contains: busqueda, mode: "insensitive" };
        }

        const [lugares, total] = await Promise.all([
            prisma.lugar.findMany({
                where,
                select: {
                    id: true,
                    nombre: true,
                    nota: true,
                    latitud: true,
                    longitud: true,
                    created_at: true,
                },
                orderBy: { nombre: "asc" },
                skip,
                take: limit,
            }),
            prisma.lugar.count({ where }),
        ]);

        logger.info("API v1: Lugares listados", {
            apiKeyId: apiKey.id,
            total,
            page,
        });

        return NextResponse.json({
            success: true,
            data: lugares,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error al listar lugares (API v1):", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["lugares:read"]);

/**
 * POST /api/v1/lugares
 * Crear nuevo lugar
 * Requiere permiso: lugares:write
 */
export const POST = withApiKey(async (request: NextRequest) => {
    const apiKey = (request as any).apiKey;
    try {
        const body = await request.json();
        const { nombre, nota, latitud, longitud } = body;

        // Validaciones
        if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "El nombre es requerido" },
                { status: 400 }
            );
        }

        // Validar coordenadas si se proporcionan
        if (latitud !== undefined && latitud !== null) {
            const lat = parseFloat(latitud);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                return NextResponse.json(
                    { success: false, message: "Latitud inválida (debe estar entre -90 y 90)" },
                    { status: 400 }
                );
            }
        }

        if (longitud !== undefined && longitud !== null) {
            const lng = parseFloat(longitud);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                return NextResponse.json(
                    { success: false, message: "Longitud inválida (debe estar entre -180 y 180)" },
                    { status: 400 }
                );
            }
        }

        // Crear lugar (usando el creador de la API Key)
        const nuevoLugar = await prisma.lugar.create({
            data: {
                nombre: nombre.trim(),
                nota: nota?.trim() || null,
                latitud: latitud !== undefined && latitud !== null ? parseFloat(latitud) : null,
                longitud: longitud !== undefined && longitud !== null ? parseFloat(longitud) : null,
                creado_por_id: apiKey.creado_por_id,
            },
            select: {
                id: true,
                nombre: true,
                nota: true,
                latitud: true,
                longitud: true,
                created_at: true,
            },
        });

        logger.info("API v1: Lugar creado", {
            apiKeyId: apiKey.id,
            lugarId: nuevoLugar.id,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Lugar creado exitosamente",
                data: nuevoLugar,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error al crear lugar (API v1):", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["lugares:write"]);
