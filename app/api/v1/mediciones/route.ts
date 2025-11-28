// --- API PÚBLICA v1 - MEDICIONES ---
// Endpoints para listar y crear mediciones con autenticación vía API Key

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withApiKey } from "@/lib/middleware";
import { logger } from "@/lib/utils/logger";
import { MedicionesService } from "@/lib/services/mediciones";
import {
    createMedicionSchema,
    filterMedicionesSchema,
} from "@/lib/validators/mediciones.validator";

/**
 * GET /api/v1/mediciones
 * Listar mediciones con filtros
 * Requiere permiso: mediciones:read
 */
export const GET = withApiKey(async (request: NextRequest) => {
    const apiKey = (request as any).apiKey;
    try {
        const { searchParams } = new URL(request.url);
        
        // Validar filtros usando Zod
        const validationResult = filterMedicionesSchema.safeParse({
            lugar_id: searchParams.get("lugar_id"),
            unidad_id: searchParams.get("unidad_id"),
            tipo_id: searchParams.get("tipo_id"),
            ciclo_id: searchParams.get("ciclo_id"),
            autor_id: searchParams.get("autor_id"),
            fecha_desde: searchParams.get("fecha_desde"),
            fecha_hasta: searchParams.get("fecha_hasta"),
            page: searchParams.get("page"),
            limit: searchParams.get("limit"),
        });

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Error de validación",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const filters = validationResult.data;
        const page = filters.page || 1;
        const limit = filters.limit || 50;

        const result = await MedicionesService.findAll(filters, page, limit, false);

        logger.info("API v1: Mediciones listadas", {
            apiKeyId: apiKey.id,
            total: result.pagination.total,
            page: result.pagination.page,
        });

        return NextResponse.json({
            success: true,
            data: result.data,
            pagination: result.pagination,
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

        // Validar datos usando Zod
        const validationResult = createMedicionSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Error de validación",
                    errors: validationResult.error.flatten().fieldErrors,
                },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Verificar relaciones existen
        const [lugar, unidad, tipo, origen] = await Promise.all([
            prisma.lugar.findFirst({ where: { id: data.lugar_id, deleted_at: null } }),
            prisma.unidad.findFirst({ where: { id: data.unidad_id, deleted_at: null } }),
            prisma.tipoRegistro.findUnique({ where: { id: data.tipo_id } }),
            prisma.origenDato.findFirst({ where: { id: data.origen_id, deleted_at: null } }),
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
        if (data.ciclo_id) {
            const ciclo = await prisma.ciclo.findFirst({
                where: { id: data.ciclo_id, deleted_at: null },
            });
            if (!ciclo) {
                return NextResponse.json(
                    { success: false, message: "Ciclo no encontrado" },
                    { status: 404 }
                );
            }
        }

        // Crear medición usando el servicio
        const nuevaMedicion = await MedicionesService.create(
            data,
            apiKey.creado_por_id,
            request.headers.get('x-forwarded-for') || 'unknown',
            false
        );

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
