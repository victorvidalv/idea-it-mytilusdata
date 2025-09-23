import { NextRequest, NextResponse } from "next/server";
import { verifyAuth, isAuthError, getClientIp } from "@/lib/middleware/auth";
import { MedicionesService } from "@/lib/services";
import {
  updateMedicionSchema,
  medicionIdSchema,
} from "@/lib/validators";
import { handleApiError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/mediciones/[id]
 * Obtener medición por ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await verifyAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;

    // Validar ID usando Zod
    const validatedId = medicionIdSchema.parse({ id });

    // Usar el servicio para obtener la medición
    const medicion = await MedicionesService.findById(validatedId.id);

    if (!medicion) {
      return NextResponse.json(
        { success: false, message: "Medición no encontrada" },
        { status: 404 }
      );
    }

    logger.info("Medición obtenida exitosamente", {
      userId: auth.id,
      medicionId: medicion.id,
    });

    return NextResponse.json({ success: true, data: medicion });
  } catch (error) {
    return handleApiError(error, {
      userId: auth.id,
      path: request.url,
      method: "GET",
    });
  }
}

/**
 * PUT /api/mediciones/[id]
 * Actualizar medición
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await verifyAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;
    const body = await request.json();

    // Validar ID usando Zod
    const validatedId = medicionIdSchema.parse({ id });

    // Validar datos de actualización usando Zod
    const validatedData = updateMedicionSchema.parse(body);

    // Verificar que haya datos para actualizar
    if (Object.keys(validatedData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No hay datos para actualizar" },
        { status: 400 }
      );
    }

    // Usar el servicio para actualizar la medición
    const medicionActualizada = await MedicionesService.update(
      validatedId.id,
      validatedData,
      auth.id,
      getClientIp(request)
    );

    logger.info("Medición actualizada exitosamente", {
      userId: auth.id,
      medicionId: medicionActualizada.id,
    });

    return NextResponse.json({
      success: true,
      message: "Medición actualizada exitosamente",
      data: medicionActualizada,
    });
  } catch (error) {
    return handleApiError(error, {
      userId: auth.id,
      path: request.url,
      method: "PUT",
    });
  }
}

/**
 * DELETE /api/mediciones/[id]
 * Eliminar medición (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await verifyAuth(request);
  if (isAuthError(auth)) return auth;

  try {
    const { id } = await params;

    // Validar ID usando Zod
    const validatedId = medicionIdSchema.parse({ id });

    // Usar el servicio para eliminar la medición
    await MedicionesService.softDelete(
      validatedId.id,
      auth.id,
      getClientIp(request)
    );

    logger.info("Medición eliminada exitosamente", {
      userId: auth.id,
      medicionId: validatedId.id,
    });

    return NextResponse.json({
      success: true,
      message: "Medición eliminada exitosamente",
    });
  } catch (error) {
    return handleApiError(error, {
      userId: auth.id,
      path: request.url,
      method: "DELETE",
    });
  }
}
