import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/middleware";
import { MedicionesService } from "@/lib/services";
import {
  createMedicionSchema,
  filterMedicionesSchema,
} from "@/lib/validators";
import { handleApiError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";
import { getClientIp } from "@/lib/middleware/auth";

/**
 * GET /api/mediciones
 * Listar mediciones con filtros opcionales (ADMIN e INVESTIGADOR)
 */
export const GET = withRole(async (request: NextRequest) => {
  const user = (request as any).user;
  try {
    const { searchParams } = new URL(request.url);

    const filters = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      lugar_id: searchParams.get("lugar_id"),
      unidad_id: searchParams.get("unidad_id"),
      tipo_id: searchParams.get("tipo_id"),
      autor_id: searchParams.get("autor_id"),
      fecha_desde: searchParams.get("fecha_desde"),
      fecha_hasta: searchParams.get("fecha_hasta"),
    };

    const validatedFilters = filterMedicionesSchema.parse(filters);
    const page = validatedFilters.page || 1;
    const limit = validatedFilters.limit || 20;

    const result = await MedicionesService.findAll(validatedFilters, page, limit);

    logger.info("Mediciones listadas exitosamente", {
      userId: user.userId,
      total: result.pagination.total,
      page: result.pagination.page,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
        hasNext: result.pagination.hasNext,
        hasPrevious: result.pagination.hasPrevious,
      },
    });
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      path: request.url,
      method: "GET",
    });
  }
}, ["ADMIN", "INVESTIGADOR"]);

/**
 * POST /api/mediciones
 * Crear nueva medición (ADMIN e INVESTIGADOR)
 */
export const POST = withRole(async (request: NextRequest) => {
  const user = (request as any).user;
  try {
    const body = await request.json();
    const validatedData = createMedicionSchema.parse(body);

    const nuevaMedicion = await MedicionesService.create(
      validatedData,
      user.userId,
      getClientIp(request)
    );

    logger.info("Medición creada exitosamente", {
      userId: user.userId,
      medicionId: nuevaMedicion.id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Medición registrada exitosamente",
        data: nuevaMedicion,
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
}, ["ADMIN", "INVESTIGADOR"]);
