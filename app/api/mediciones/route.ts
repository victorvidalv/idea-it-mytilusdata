import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    verifyAuth,
    isAuthError,
    getClientIp,
} from "@/lib/middleware/auth";
import { registrarCambio, cambiosCreate } from "@/lib/bitacora";

/**
 * GET /api/mediciones
 * Listar mediciones con filtros opcionales
 */
export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { searchParams } = new URL(request.url);

        // Parámetros de paginación
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
        const skip = (page - 1) * limit;

        // Filtros
        const lugarId = searchParams.get("lugar_id");
        const unidadId = searchParams.get("unidad_id");
        const tipoId = searchParams.get("tipo_id");
        const registradoPorId = searchParams.get("autor_id");
        const fechaDesde = searchParams.get("fecha_desde");
        const fechaHasta = searchParams.get("fecha_hasta");

        // Construir where dinámico
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = { deleted_at: null };

        if (lugarId) {
            const id = parseInt(lugarId, 10);
            if (!isNaN(id)) where.lugar_id = id;
        }

        if (unidadId) {
            const id = parseInt(unidadId, 10);
            if (!isNaN(id)) where.unidad_id = id;
        }

        if (tipoId) {
            const id = parseInt(tipoId, 10);
            if (!isNaN(id)) where.tipo_id = id;
        }

        if (registradoPorId) {
            const id = parseInt(registradoPorId, 10);
            if (!isNaN(id)) where.registrado_por_id = id;
        }

        if (fechaDesde || fechaHasta) {
            where.fecha_medicion = {};
            if (fechaDesde) {
                where.fecha_medicion.gte = new Date(fechaDesde);
            }
            if (fechaHasta) {
                where.fecha_medicion.lte = new Date(fechaHasta);
            }
        }

        // Ejecutar consultas
        const [mediciones, total] = await Promise.all([
            prisma.medicion.findMany({
                where,
                include: {
                    lugar: { select: { id: true, nombre: true } },
                    unidad: { select: { id: true, nombre: true, sigla: true } },
                    tipo: { select: { id: true, codigo: true, descripcion: true } },
                    registrado_por: { select: { id: true, nombre: true, email: true } },
                },
                orderBy: { fecha_medicion: "desc" },
                skip,
                take: limit,
            }),
            prisma.medicion.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            data: mediciones,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error al listar mediciones:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
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
        const { valor, fecha_medicion, lugar_id, unidad_id, tipo_id, notas } = body;

        // Validaciones de campos requeridos
        if (valor === undefined || valor === null) {
            return NextResponse.json(
                { success: false, message: "El valor es requerido" },
                { status: 400 }
            );
        }

        const valorNumerico = parseFloat(valor);
        if (isNaN(valorNumerico)) {
            return NextResponse.json(
                { success: false, message: "El valor debe ser numérico" },
                { status: 400 }
            );
        }

        if (!fecha_medicion) {
            return NextResponse.json(
                { success: false, message: "La fecha de medición es requerida" },
                { status: 400 }
            );
        }

        const fechaParsed = new Date(fecha_medicion);
        if (isNaN(fechaParsed.getTime())) {
            return NextResponse.json(
                { success: false, message: "Formato de fecha inválido" },
                { status: 400 }
            );
        }

        // Validar fecha no futura
        if (fechaParsed > new Date()) {
            return NextResponse.json(
                { success: false, message: "La fecha de medición no puede ser futura" },
                { status: 400 }
            );
        }

        if (!lugar_id) {
            return NextResponse.json(
                { success: false, message: "El lugar es requerido" },
                { status: 400 }
            );
        }

        if (!unidad_id) {
            return NextResponse.json(
                { success: false, message: "La unidad es requerida" },
                { status: 400 }
            );
        }

        if (!tipo_id) {
            return NextResponse.json(
                { success: false, message: "El tipo de registro es requerido" },
                { status: 400 }
            );
        }

        // Validar existencia de relaciones
        const [lugar, unidad, tipo] = await Promise.all([
            prisma.lugar.findFirst({
                where: { id: parseInt(lugar_id, 10), deleted_at: null },
            }),
            prisma.unidad.findFirst({
                where: { id: parseInt(unidad_id, 10), deleted_at: null },
            }),
            prisma.tipoRegistro.findUnique({
                where: { id: parseInt(tipo_id, 10) },
            }),
        ]);

        if (!lugar) {
            return NextResponse.json(
                { success: false, message: "Lugar no encontrado o eliminado" },
                { status: 400 }
            );
        }

        if (!unidad) {
            return NextResponse.json(
                { success: false, message: "Unidad no encontrada o eliminada" },
                { status: 400 }
            );
        }

        if (!tipo) {
            return NextResponse.json(
                { success: false, message: "Tipo de registro no encontrado" },
                { status: 400 }
            );
        }

        // Crear medición
        const nuevaMedicion = await prisma.medicion.create({
            data: {
                valor: valorNumerico,
                fecha_medicion: fechaParsed,
                lugar_id: lugar.id,
                unidad_id: unidad.id,
                tipo_id: tipo.id,
                registrado_por_id: auth.id,
                notas: notas || null,
            },
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
            nuevaMedicion.id,
            "CREATE",
            cambiosCreate({
                valor: valorNumerico,
                fecha_medicion: fechaParsed.toISOString(),
                lugar_id: lugar.id,
                unidad_id: unidad.id,
                tipo_id: tipo.id,
                notas: notas || null,
            }),
            auth.id,
            getClientIp(request)
        );

        return NextResponse.json(
            {
                success: true,
                message: "Medición registrada exitosamente",
                data: nuevaMedicion,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error al crear medición:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
