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
 * Listar mediciones con filtros opcionales (ADMIN y EQUIPO)
 */
export const GET = withRole(async (request: NextRequest) => {
  const user = (request as any).user;
  try {
    // Extraer parámetros de búsqueda de la URL
    const { searchParams } = new URL(request.url);

    // Mapear filtros conocidos
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

    // Validar filtros con el esquema Zod
    const validatedFilters = filterMedicionesSchema.parse(filters);
    const page = validatedFilters.page || 1;
    const limit = validatedFilters.limit || 20;

    // Obtener mediciones desde el servicio
    const result = await MedicionesService.findAll(validatedFilters, page, limit);

    // Registrar acción en el logger
    logger.info("Mediciones listadas exitosamente", {
      userId: user.userId,
      total: result.pagination.total,
      page: result.pagination.page,
    });

    // Retornar respuesta exitosa con paginación


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
}, ["ADMIN", "EQUIPO"]);

/**
 * POST /api/mediciones
 * Crear nueva medición (ADMIN y EQUIPO)
 */
export const POST = withRole(async (request: NextRequest) => {
  const user = (request as any).user;
  try {
    // Parsear y validar el cuerpo de la solicitud
    const body = await request.json();
    const validatedData = createMedicionSchema.parse(body);

    // Crear la nueva medición usando el servicio
    const nuevaMedicion = await MedicionesService.create(
      validatedData,
      user.userId,
      getClientIp(request)
    );

    // Registrar creación exitosa
    logger.info("Medición creada exitosamente", {
      userId: user.userId,
      medicionId: nuevaMedicion.id,
    });

    // Retornar respuesta de creación exitosa (201)


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
}, ["ADMIN", "EQUIPO"]);
