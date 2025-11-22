import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/middleware";
import { CiclosService } from "@/lib/services/ciclos";
import { filterCiclosSchema, createCicloSchema } from "@/lib/validators/ciclos.validator";
import { handleApiError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/ciclos
 * Listar ciclos con filtros (ADMIN, EQUIPO)
 */
export const GET = withRole(async (request: NextRequest) => {
    const user = (request as any).user;
    try {
        const { searchParams } = new URL(request.url);
        const filters = {
            lugar_id: searchParams.get("lugar_id"),
            activo: searchParams.get("activo"),
            page: searchParams.get("page"),
            limit: searchParams.get("limit"),
        };

        const validatedFilters = filterCiclosSchema.parse(filters);
        const result = await CiclosService.findAll(
            validatedFilters,
            validatedFilters.page,
            validatedFilters.limit
        );

        return NextResponse.json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    } catch (error) {
        return handleApiError(error, {
            userId: user.userId,
            path: request.url,
            method: "GET",
        });
    }
}, ["ADMIN", "EQUIPO"]);

/**
 * POST /api/ciclos
 * Crear un nuevo ciclo
 */
export const POST = withRole(async (request: NextRequest) => {
    const user = (request as any).user;
    try {
        const body = await request.json();
        const validatedData = createCicloSchema.parse(body);

        const nuevoCiclo = await CiclosService.create(validatedData, user.userId);

        logger.info("Ciclo creado exitosamente desde API", {
            userId: user.userId,
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
        return handleApiError(error, {
            userId: user.userId,
            path: request.url,
            method: "POST",
        });
    }
}, ["ADMIN", "EQUIPO"]);
