import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError, getClientIp } from "@/lib/middleware/auth";
import { MedicionesService } from "@/lib/services";
import {
  createMedicionSchema,
  filterMedicionesSchema,
} from "@/lib/validators";
import { handleApiError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/mediciones
 * Listar mediciones con filtros opcionales
 */
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);

    // Extraer parámetros de consulta
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

    // Validar filtros usando Zod
    const validatedFilters = filterMedicionesSchema.parse(filters);

    // Obtener página y límite con valores por defecto
    const page = validatedFilters.page || 1;
    const limit = validatedFilters.limit || 20;

    // Usar el servicio para obtener mediciones
    const result = await MedicionesService.findAll(validatedFilters, page, limit);

    logger.info("Mediciones listadas exitosamente", {
      userId: auth.id,
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
      userId: auth.id,
      path: request.url,
      method: "GET",
    });
  }
}

/**
 * POST /api/mediciones
 * Crear nueva medición
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();

    // Validar datos usando Zod
    const validatedData = createMedicionSchema.parse(body);

    // Usar el servicio para crear la medición
    const nuevaMedicion = await MedicionesService.create(
      validatedData,
      auth.id,
      getClientIp(request)
    );

    logger.info("Medición creada exitosamente", {
      userId: auth.id,
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
      userId: auth.id,
      path: request.url,
      method: "POST",
    });
  }
}
