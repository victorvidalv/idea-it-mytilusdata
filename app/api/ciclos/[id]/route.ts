import { NextRequest, NextResponse } from "next/server";
import { withRole } from "@/lib/middleware";
import { CiclosService } from "@/lib/services/ciclos";
import { updateCicloSchema, cicloIdSchema } from "@/lib/validators/ciclos.validator";
import { handleApiError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/ciclos/[id]
 */
export const GET = withRole(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = (request as any).user;
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const ciclo = await CiclosService.findById(id);

        if (!ciclo) {
            return NextResponse.json(
                { success: false, message: "Ciclo no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: ciclo });
    } catch (error) {
        return handleApiError(error, {
            userId: user.userId,
            path: request.url,
            method: "GET",
        });
    }
}, ["ADMIN", "EQUIPO"]);

/**
 * PATCH /api/ciclos/[id]
 */
export const PATCH = withRole(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = (request as any).user;
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await request.json();
        const validatedData = updateCicloSchema.parse({ ...body, id });

        const cicloActualizado = await CiclosService.update(id, validatedData, user.userId);

        return NextResponse.json({
            success: true,
            message: "Ciclo actualizado exitosamente",
            data: cicloActualizado,
        });
    } catch (error) {
        return handleApiError(error, {
            userId: user.userId,
            path: request.url,
            method: "PATCH",
        });
    }
}, ["ADMIN", "EQUIPO"]);

/**
 * DELETE /api/ciclos/[id]
 */
export const DELETE = withRole(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = (request as any).user;
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        await CiclosService.softDelete(id);

        return NextResponse.json({
            success: true,
            message: "Ciclo eliminado exitosamente",
        });
    } catch (error) {
        return handleApiError(error, {
            userId: user.userId,
            path: request.url,
            method: "DELETE",
        });
    }
}, ["ADMIN", "EQUIPO"]);
