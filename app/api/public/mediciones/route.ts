import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * API pública para obtener mediciones
 * Autenticación por token en header: Authorization: Bearer <API_TOKEN>
 * El token se define en .env como API_PUBLIC_TOKEN
 */

export async function GET(request: NextRequest) {
    try {
        // Verificar token de API
        const authHeader = request.headers.get("authorization");
        const apiToken = process.env.API_PUBLIC_TOKEN;

        if (!apiToken) {
            return NextResponse.json(
                { success: false, error: "API token not configured" },
                { status: 500 }
            );
        }

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { success: false, error: "Missing authorization header" },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        if (token !== apiToken) {
            return NextResponse.json(
                { success: false, error: "Invalid API token" },
                { status: 401 }
            );
        }

        // Obtener parámetros de filtro opcionales
        const { searchParams } = new URL(request.url);
        const lugarId = searchParams.get("lugar_id");
        const unidadId = searchParams.get("unidad_id");
        const tipoId = searchParams.get("tipo_id");
        const limit = parseInt(searchParams.get("limit") || "1000");
        const offset = parseInt(searchParams.get("offset") || "0");

        // Construir filtros
        const where: Record<string, unknown> = {};
        if (lugarId) where.lugar_id = parseInt(lugarId);
        if (unidadId) where.unidad_id = parseInt(unidadId);
        if (tipoId) where.tipo_id = parseInt(tipoId);

        // Obtener mediciones con relaciones
        const mediciones = await prisma.medicion.findMany({
            where,
            include: {
                lugar: {
                    select: {
                        id: true,
                        nombre: true,
                    }
                },
                unidad: {
                    select: {
                        id: true,
                        nombre: true,
                        sigla: true,
                    }
                },
                tipo: {
                    select: {
                        id: true,
                        codigo: true,
                        descripcion: true,
                    }
                },
                registrado_por: {
                    select: {
                        id: true,
                        nombre: true,
                        email: true,
                    }
                }
            },
            orderBy: { fecha_medicion: "desc" },
            take: limit,
            skip: offset,
        });

        // Contar total
        const total = await prisma.medicion.count({ where });

        // Formatear respuesta
        const data = mediciones.map((m: any) => ({
            id: m.id,
            valor: Number(m.valor),
            fecha_medicion: m.fecha_medicion.toISOString(),
            notas: m.notas,
            lugar: {
                id: m.lugar.id,
                nombre: m.lugar.nombre,
            },
            unidad: {
                id: m.unidad.id,
                nombre: m.unidad.nombre,
                sigla: m.unidad.sigla,
            },
            tipo: {
                id: m.tipo.id,
                codigo: m.tipo.codigo,
                descripcion: m.tipo.descripcion,
            },
            registrado_por: {
                id: m.registrado_por.id,
                nombre: m.registrado_por.nombre,
                email: m.registrado_por.email,
            },
            created_at: m.created_at.toISOString(),
            updated_at: m.updated_at.toISOString(),
        }));

        return NextResponse.json({
            success: true,
            data,
            pagination: {
                total,
                limit,
                offset,
                hasMore: offset + data.length < total,
            }
        });

    } catch (error) {
        console.error("Error en API pública:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
