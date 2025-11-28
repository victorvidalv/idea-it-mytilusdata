// --- API PÚBLICA v1 - CICLOS ---
// Endpoints para listar y crear ciclos con autenticación vía API Key

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withApiKey } from "@/lib/middleware";
import { logger } from "@/lib/utils/logger";
import { CiclosService } from "@/lib/services/ciclos";
import {
    createCicloSchema,
    filterCiclosSchema,
} from "@/lib/validators/ciclos.validator";

/**
 * GET /api/v1/ciclos
 * Listar todos los ciclos activos
 * Requiere permiso: ciclos:read
 */
export const GET = withApiKey(async (request: NextRequest) => {
    const apiKey = (request as any).apiKey;
    try {
        const { searchParams } = new URL(request.url);
        
        // Validar filtros usando Zod
        const validationResult = filterCiclosSchema.safeParse({
            lugar_id: searchParams.get("lugar_id"),
            activo: searchParams.get("activo"),
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

        const result = await CiclosService.findAll(filters, page, limit, false);

        logger.info("API v1: Ciclos listados", {
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

        // Validar datos usando Zod
        const validationResult = createCicloSchema.safeParse(body);

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

        // Verificar que el lugar existe
        const lugar = await prisma.lugar.findFirst({
            where: { id: data.lugar_id, deleted_at: null },
        });

        if (!lugar) {
            return NextResponse.json(
                { success: false, message: "Lugar no encontrado" },
                { status: 404 }
            );
        }

        // Crear ciclo usando el servicio
        const nuevoCiclo = await CiclosService.create(
            data,
            apiKey.creado_por_id
        );

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
