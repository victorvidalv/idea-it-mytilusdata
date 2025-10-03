import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/middleware";
import { MedicionesService } from "@/lib/services";
import {
  updateMedicionSchema,
  medicionIdSchema,
} from "@/lib/validators";
import { handleApiError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";
import { getClientIp } from "@/lib/middleware/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/mediciones/[id]
 * Obtener medición por ID (ADMIN e INVESTIGADOR)
 */
export const GET = withRole(async (request: NextRequest, { params }: RouteParams) => {
  const user = (request as any).user;
  try {
    const { id } = await params;
    const validatedId = medicionIdSchema.parse({ id });
    const medicion = await MedicionesService.findById(validatedId.id);

    if (!medicion) {
      return NextResponse.json(
        { success: false, message: "Medición no encontrada" },
        { status: 404 }
      );
    }

    logger.info("Medición obtenida exitosamente", {
      userId: user.userId,
      medicionId: medicion.id,
    });

    return NextResponse.json({ success: true, data: medicion });
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      path: request.url,
      method: "GET",
    });
  }
}, ["ADMIN", "INVESTIGADOR"]);

/**
 * PUT /api/mediciones/[id]
 * Actualizar medición (ADMIN e INVESTIGADOR)
 */
export const PUT = withRole(async (request: NextRequest, { params }: RouteParams) => {
  const user = (request as any).user;
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedId = medicionIdSchema.parse({ id });
    const validatedData = updateMedicionSchema.parse(body);

    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No hay datos para actualizar" },
        { status: 400 }
      );
    }

    const medicionActualizada = await MedicionesService.update(
      validatedId.id,
      validatedData,
      user.userId,
      getClientIp(request)
    );

    logger.info("Medición actualizada exitosamente", {
      userId: user.userId,
      medicionId: medicionActualizada.id,
    });

    return NextResponse.json({
      success: true,
      message: "Medición actualizada exitosamente",
      data: medicionActualizada,
    });
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      path: request.url,
      method: "PUT",
    });
  }
}, ["ADMIN", "INVESTIGADOR"]);

/**
 * DELETE /api/mediciones/[id]
 * Eliminar medición (soft delete) (Solo ADMIN e INVESTIGADOR)
 */
export const DELETE = withRole(async (request: NextRequest, { params }: RouteParams) => {
  const user = (request as any).user;
  try {
    const { id } = await params;
    const validatedId = medicionIdSchema.parse({ id });

    await MedicionesService.softDelete(
      validatedId.id,
      user.userId,
      getClientIp(request)
    );

    logger.info("Medición eliminada exitosamente", {
      userId: user.userId,
      medicionId: validatedId.id,
    });

    return NextResponse.json({
      success: true,
      message: "Medición eliminada exitosamente",
    });
  } catch (error) {
    return handleApiError(error, {
      userId: user.userId,
      path: request.url,
      method: "DELETE",
    });
  }
}, ["ADMIN", "INVESTIGADOR"]);
