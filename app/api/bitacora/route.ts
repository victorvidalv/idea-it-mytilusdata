import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth, isAuthError } from "@/lib/middleware/auth";

/**
 * GET /api/bitacora
 * Listar registros de auditoría con filtros
 * Solo lectura - la bitácora no se modifica manualmente
 */
export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { searchParams } = new URL(request.url);

        // Parámetros de paginación
        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
        const skip = (page - 1) * limit;

        // Filtros
        const tablaAfectada = searchParams.get("tabla");
        const accion = searchParams.get("accion");
        const usuarioId = searchParams.get("usuario_id");
        const registroId = searchParams.get("registro_id");
        const fechaDesde = searchParams.get("fecha_desde");
        const fechaHasta = searchParams.get("fecha_hasta");

        // Construir where dinámico
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (tablaAfectada) {
            where.tabla_afectada = tablaAfectada;
        }

        if (accion) {
            where.accion = accion.toUpperCase();
        }

        if (usuarioId) {
            const id = parseInt(usuarioId, 10);
            if (!isNaN(id)) where.usuario_id = id;
        }

        if (registroId) {
            const id = parseInt(registroId, 10);
            if (!isNaN(id)) where.registro_id = id;
        }

        if (fechaDesde || fechaHasta) {
            where.fecha_evento = {};
            if (fechaDesde) {
                where.fecha_evento.gte = new Date(fechaDesde);
            }
            if (fechaHasta) {
                where.fecha_evento.lte = new Date(fechaHasta);
            }
        }

        // Ejecutar consultas
        const [registros, total] = await Promise.all([
            prisma.bitacoraCambio.findMany({
                where,
                include: {
                    usuario: {
                        select: { id: true, nombre: true, email: true },
                    },
                },
                orderBy: { fecha_evento: "desc" },
                skip,
                take: limit,
            }),
            prisma.bitacoraCambio.count({ where }),
        ]);

        // Parsear campo cambios JSON
        const registrosParsed = registros.map((reg) => ({
            ...reg,
            cambios: reg.cambios ? JSON.parse(reg.cambios) : null,
        }));

        return NextResponse.json({
            success: true,
            data: registrosParsed,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error al listar bitácora:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
