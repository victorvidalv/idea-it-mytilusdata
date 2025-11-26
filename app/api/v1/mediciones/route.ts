// --- API PÚBLICA v1 - MEDICIONES ---
// Endpoints para listar y crear mediciones con autenticación vía API Key

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withApiKey } from "@/lib/middleware";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/v1/mediciones
 * Listar mediciones con filtros
 * Requiere permiso: mediciones:read
 */
export const GET = withApiKey(async (request: NextRequest) => {
    const apiKey = (request as any).apiKey;
    try {
        const { searchParams } = new URL(request.url);
        const lugarId = searchParams.get("lugar_id");
        const cicloId = searchParams.get("ciclo_id");
        const fechaDesde = searchParams.get("fecha_desde");
        const fechaHasta = searchParams.get("fecha_hasta");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
        const skip = (page - 1) * limit;

        const where: any = { deleted_at: null };

        if (lugarId) {
            where.lugar_id = parseInt(lugarId);
        }

        if (cicloId) {
            where.ciclo_id = parseInt(cicloId);
        }

        if (fechaDesde) {
            where.fecha_medicion = {
                ...where.fecha_medicion,
                gte: new Date(fechaDesde),
            };
        }

        if (fechaHasta) {
            where.fecha_medicion = {
                ...where.fecha_medicion,
                lte: new Date(fechaHasta),
            };
        }

        const [mediciones, total] = await Promise.all([
            prisma.medicion.findMany({
                where,
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
                    ciclo: {
                        select: { id: true, nombre: true },
                    },
                },
                orderBy: { fecha_medicion: "desc" },
                skip,
                take: limit,
            }),
            prisma.medicion.count({ where }),
        ]);

        logger.info("API v1: Mediciones listadas", {
            apiKeyId: apiKey.id,
            total,
            page,
        });

        return NextResponse.json({
            success: true,
            data: mediciones,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error al listar mediciones (API v1):", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["mediciones:read"]);

/**
 * POST /api/v1/mediciones
 * Crear nueva medición
 * Requiere permiso: mediciones:write
 */
export const POST = withApiKey(async (request: NextRequest) => {
    const apiKey = (request as any).apiKey;
    try {
        const body = await request.json();
        const { valor, fecha_medicion, lugar_id, unidad_id, tipo_id, origen_id, ciclo_id, notas } = body;

        // Validaciones básicas
        if (valor === undefined || valor === null) {
            return NextResponse.json(
                { success: false, message: "El valor es requerido" },
                { status: 400 }
            );
        }

        if (!fecha_medicion) {
            return NextResponse.json(
                { success: false, message: "La fecha de medición es requerida" },
                { status: 400 }
            );
        }

        if (!lugar_id || isNaN(parseInt(lugar_id))) {
            return NextResponse.json(
                { success: false, message: "El lugar es requerido" },
                { status: 400 }
            );
        }

        if (!unidad_id || isNaN(parseInt(unidad_id))) {
            return NextResponse.json(
                { success: false, message: "La unidad es requerida" },
                { status: 400 }
            );
        }

        if (!tipo_id || isNaN(parseInt(tipo_id))) {
            return NextResponse.json(
                { success: false, message: "El tipo es requerido" },
                { status: 400 }
            );
        }

        if (!origen_id || isNaN(parseInt(origen_id))) {
            return NextResponse.json(
                { success: false, message: "El origen es requerido" },
                { status: 400 }
            );
        }

        // Verificar relaciones existen
        const [lugar, unidad, tipo, origen] = await Promise.all([
            prisma.lugar.findFirst({ where: { id: parseInt(lugar_id), deleted_at: null } }),
            prisma.unidad.findFirst({ where: { id: parseInt(unidad_id), deleted_at: null } }),
            prisma.tipoRegistro.findUnique({ where: { id: parseInt(tipo_id) } }),
            prisma.origenDato.findFirst({ where: { id: parseInt(origen_id), deleted_at: null } }),
        ]);

        if (!lugar) {
            return NextResponse.json(
                { success: false, message: "Lugar no encontrado" },
                { status: 404 }
            );
        }
        if (!unidad) {
            return NextResponse.json(
                { success: false, message: "Unidad no encontrada" },
                { status: 404 }
            );
        }
        if (!tipo) {
            return NextResponse.json(
                { success: false, message: "Tipo de registro no encontrado" },
                { status: 404 }
            );
        }
        if (!origen) {
            return NextResponse.json(
                { success: false, message: "Origen de datos no encontrado" },
                { status: 404 }
            );
        }

        // Verificar ciclo si se proporciona
        if (ciclo_id) {
            const ciclo = await prisma.ciclo.findFirst({
                where: { id: parseInt(ciclo_id), deleted_at: null },
            });
            if (!ciclo) {
                return NextResponse.json(
                    { success: false, message: "Ciclo no encontrado" },
                    { status: 404 }
                );
            }
        }

        // Crear medición
        const nuevaMedicion = await prisma.medicion.create({
            data: {
                valor: parseFloat(valor),
                fecha_medicion: new Date(fecha_medicion),
                lugar_id: parseInt(lugar_id),
                unidad_id: parseInt(unidad_id),
                tipo_id: parseInt(tipo_id),
                origen_id: parseInt(origen_id),
                ciclo_id: ciclo_id ? parseInt(ciclo_id) : null,
                notas: notas?.trim() || null,
                registrado_por_id: apiKey.creado_por_id,
            },
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
                    select: { id: true, codigo: true },
                },
                ciclo: {
                    select: { id: true, nombre: true },
                },
            },
        });

        logger.info("API v1: Medición creada", {
            apiKeyId: apiKey.id,
            medicionId: nuevaMedicion.id,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Medición creada exitosamente",
                data: nuevaMedicion,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error al crear medición (API v1):", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["mediciones:write"]);
