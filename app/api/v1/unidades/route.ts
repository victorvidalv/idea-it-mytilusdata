// --- API PÚBLICA v1 - UNIDADES ---
// Endpoints para listar y crear unidades con autenticación vía API Key

import { NextRequest, NextResponse } from "next/server";
import { withApiKey } from "@/lib/middleware";
import { logger } from "@/lib/utils/logger";
import { UnidadesService } from "@/lib/services/unidades";
import {
    createUnidadSchema,
    filterUnidadesSchema,
} from "@/lib/validators/unidades.validator";

/**
 * GET /api/v1/unidades
 * Listar todas las unidades activas
 * Requiere permiso: unidades:read
 */
export const GET = withApiKey(async (request: NextRequest) => {
    const apiKey = (request as any).apiKey;
    try {
        const { searchParams } = new URL(request.url);
        
        // Validar filtros usando Zod
        const validationResult = filterUnidadesSchema.safeParse({
            q: searchParams.get("q"),
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

        const result = await UnidadesService.findAll(filters, page, limit, false);

        logger.info("API v1: Unidades listadas", {
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

        // Validar datos usando Zod
        const validationResult = createUnidadSchema.safeParse(body);

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

        // Crear unidad usando el servicio
        const nuevaUnidad = await UnidadesService.create(
            data,
            apiKey.creado_por_id
        );

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
