import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth, isAuthError } from "@/lib/middleware/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * GET /api/tipos-registro/[id]
 * Obtener tipo de registro por ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const tipoId = parseInt(id, 10);

        if (isNaN(tipoId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const tipo = await prisma.tipoRegistro.findUnique({
            where: { id: tipoId },
            include: {
                _count: {
                    select: { mediciones: { where: { deleted_at: null } } },
                },
            },
        });

        if (!tipo) {
            return NextResponse.json(
                { success: false, message: "Tipo de registro no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: tipo });
    } catch (error) {
        console.error("Error al obtener tipo de registro:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/tipos-registro/[id]
 * Actualizar tipo de registro (solo descripción, código es inmutable)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const tipoId = parseInt(id, 10);

        if (isNaN(tipoId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { descripcion } = body;

        // Buscar tipo existente
        const tipoExistente = await prisma.tipoRegistro.findUnique({
            where: { id: tipoId },
        });

        if (!tipoExistente) {
            return NextResponse.json(
                { success: false, message: "Tipo de registro no encontrado" },
                { status: 404 }
            );
        }

        // Solo se puede actualizar la descripción
        if (descripcion === undefined) {
            return NextResponse.json(
                { success: false, message: "Solo se puede actualizar la descripción" },
                { status: 400 }
            );
        }

        const tipoActualizado = await prisma.tipoRegistro.update({
            where: { id: tipoId },
            data: { descripcion: descripcion?.trim() || null },
        });

        return NextResponse.json({
            success: true,
            message: "Tipo de registro actualizado exitosamente",
            data: tipoActualizado,
        });
    } catch (error) {
        console.error("Error al actualizar tipo de registro:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/tipos-registro/[id]
 * Eliminar tipo de registro (solo si no tiene mediciones asociadas)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { id } = await params;
        const tipoId = parseInt(id, 10);

        if (isNaN(tipoId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        // Verificar existencia
        const tipo = await prisma.tipoRegistro.findUnique({
            where: { id: tipoId },
            include: {
                _count: { select: { mediciones: { where: { deleted_at: null } } } },
            },
        });

        if (!tipo) {
            return NextResponse.json(
                { success: false, message: "Tipo de registro no encontrado" },
                { status: 404 }
            );
        }

        // Verificar si tiene mediciones asociadas
        if (tipo._count.mediciones > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: `No se puede eliminar: tiene ${tipo._count.mediciones} mediciones asociadas`
                },
                { status: 409 }
            );
        }

        // Eliminar
        await prisma.tipoRegistro.delete({ where: { id: tipoId } });

        return NextResponse.json({
            success: true,
            message: "Tipo de registro eliminado exitosamente",
        });
    } catch (error) {
        console.error("Error al eliminar tipo de registro:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
