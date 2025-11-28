// --- API PÚBLICA v1 - LUGARES ---
// Endpoints para listar y crear lugares con autenticación vía API Key

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withApiKey } from "@/lib/middleware";
import { logger } from "@/lib/utils/logger";
import { LugaresService } from "@/lib/services/lugares";
import {
    createLugarSchema,
    filterLugaresSchema,
} from "@/lib/validators/lugares.validator";

/**
 * GET /api/v1/lugares
 * Listar todos los lugares activos
 * Requiere permiso: lugares:read
 */
export const GET = withApiKey(async (request: NextRequest) => {
    const apiKey = (request as any).apiKey;
    try {
        const { searchParams } = new URL(request.url);
        
        // Validar filtros usando Zod
        const validationResult = filterLugaresSchema.safeParse({
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

        const result = await LugaresService.findAll(filters, page, limit, false);

        logger.info("API v1: Lugares listados", {
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

        // Validar datos usando Zod
        const validationResult = createLugarSchema.safeParse(body);

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

        // Crear lugar usando el servicio
        const nuevoLugar = await LugaresService.create(
            data,
            apiKey.creado_por_id
        );

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
