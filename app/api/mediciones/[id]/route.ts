import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    verifyAuth,
    isAuthError,
    getClientIp,
} from "@/lib/middleware/auth";
import {
    registrarCambio,
    cambiosUpdate,
    cambiosSoftDelete,
} from "@/lib/bitacora";

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
        const medicionId = parseInt(id, 10);

        if (isNaN(medicionId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const medicion = await prisma.medicion.findFirst({
            where: { id: medicionId, deleted_at: null },
            include: {
                lugar: {
                    select: {
                        id: true,
                        nombre: true,
                        nota: true,
                        latitud: true,
                        longitud: true,
                    },
                },
                unidad: { select: { id: true, nombre: true, sigla: true } },
                tipo: { select: { id: true, codigo: true, descripcion: true } },
                registrado_por: { select: { id: true, nombre: true, email: true } },
            },
        });

        if (!medicion) {
            return NextResponse.json(
                { success: false, message: "Medición no encontrada" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: medicion });
    } catch (error) {
        console.error("Error al obtener medición:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
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
        const medicionId = parseInt(id, 10);

        if (isNaN(medicionId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { valor, fecha_medicion, lugar_id, unidad_id, tipo_id } = body;

        // Buscar medición existente
        const medicionExistente = await prisma.medicion.findFirst({
            where: { id: medicionId, deleted_at: null },
        });

        if (!medicionExistente) {
            return NextResponse.json(
                { success: false, message: "Medición no encontrada" },
                { status: 404 }
            );
        }

        // Preparar datos a actualizar
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const datosActualizados: any = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const datosAnteriores: any = {};

        // Validar valor
        if (valor !== undefined) {
            const valorNumerico = parseFloat(valor);
            if (isNaN(valorNumerico)) {
                return NextResponse.json(
                    { success: false, message: "El valor debe ser numérico" },
                    { status: 400 }
                );
            }
            datosActualizados.valor = valorNumerico;
            datosAnteriores.valor = medicionExistente.valor;
        }

        // Validar fecha
        if (fecha_medicion !== undefined) {
            const fechaParsed = new Date(fecha_medicion);
            if (isNaN(fechaParsed.getTime())) {
                return NextResponse.json(
                    { success: false, message: "Formato de fecha inválido" },
                    { status: 400 }
                );
            }
            if (fechaParsed > new Date()) {
                return NextResponse.json(
                    { success: false, message: "La fecha de medición no puede ser futura" },
                    { status: 400 }
                );
            }
            datosActualizados.fecha_medicion = fechaParsed;
            datosAnteriores.fecha_medicion = medicionExistente.fecha_medicion;
        }

        // Validar lugar
        if (lugar_id !== undefined) {
            const lugarIdNum = parseInt(lugar_id, 10);
            const lugar = await prisma.lugar.findFirst({
                where: { id: lugarIdNum, deleted_at: null },
            });
            if (!lugar) {
                return NextResponse.json(
                    { success: false, message: "Lugar no encontrado o eliminado" },
                    { status: 400 }
                );
            }
            datosActualizados.lugar_id = lugarIdNum;
            datosAnteriores.lugar_id = medicionExistente.lugar_id;
        }

        // Validar unidad
        if (unidad_id !== undefined) {
            const unidadIdNum = parseInt(unidad_id, 10);
            const unidad = await prisma.unidad.findFirst({
                where: { id: unidadIdNum, deleted_at: null },
            });
            if (!unidad) {
                return NextResponse.json(
                    { success: false, message: "Unidad no encontrada o eliminada" },
                    { status: 400 }
                );
            }
            datosActualizados.unidad_id = unidadIdNum;
            datosAnteriores.unidad_id = medicionExistente.unidad_id;
        }

        // Validar tipo
        if (tipo_id !== undefined) {
            const tipoIdNum = parseInt(tipo_id, 10);
            const tipo = await prisma.tipoRegistro.findUnique({
                where: { id: tipoIdNum },
            });
            if (!tipo) {
                return NextResponse.json(
                    { success: false, message: "Tipo de registro no encontrado" },
                    { status: 400 }
                );
            }
            datosActualizados.tipo_id = tipoIdNum;
            datosAnteriores.tipo_id = medicionExistente.tipo_id;
        }

        if (Object.keys(datosActualizados).length === 0) {
            return NextResponse.json(
                { success: false, message: "No hay datos para actualizar" },
                { status: 400 }
            );
        }

        // Agregar timestamp de actualización
        datosActualizados.updated_at = new Date();

        // Actualizar medición
        const medicionActualizada = await prisma.medicion.update({
            where: { id: medicionId },
            data: datosActualizados,
            include: {
                lugar: { select: { id: true, nombre: true } },
                unidad: { select: { id: true, nombre: true, sigla: true } },
                tipo: { select: { id: true, codigo: true, descripcion: true } },
                registrado_por: { select: { id: true, nombre: true, email: true } },
            },
        });

        // Registrar en bitácora
        await registrarCambio(
            "mediciones",
            medicionId,
            "UPDATE",
            cambiosUpdate(datosAnteriores, datosActualizados),
            auth.id,
            getClientIp(request)
        );

        return NextResponse.json({
            success: true,
            message: "Medición actualizada exitosamente",
            data: medicionActualizada,
        });
    } catch (error) {
        console.error("Error al actualizar medición:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
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
        const medicionId = parseInt(id, 10);

        if (isNaN(medicionId)) {
            return NextResponse.json(
                { success: false, message: "ID inválido" },
                { status: 400 }
            );
        }

        // Buscar medición existente
        const medicion = await prisma.medicion.findFirst({
            where: { id: medicionId, deleted_at: null },
        });

        if (!medicion) {
            return NextResponse.json(
                { success: false, message: "Medición no encontrada" },
                { status: 404 }
            );
        }

        // Soft delete
        await prisma.medicion.update({
            where: { id: medicionId },
            data: {
                deleted_at: new Date(),
                updated_at: new Date(),
            },
        });

        // Registrar en bitácora
        await registrarCambio(
            "mediciones",
            medicionId,
            "SOFT_DELETE",
            cambiosSoftDelete(),
            auth.id,
            getClientIp(request)
        );

        return NextResponse.json({
            success: true,
            message: "Medición eliminada exitosamente",
        });
    } catch (error) {
        console.error("Error al eliminar medición:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
