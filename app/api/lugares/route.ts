import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    verifyAuth,
    isAuthError,
    getClientIp,
} from "@/lib/middleware/auth";
import { registrarCambio, cambiosCreate } from "@/lib/bitacora";

/**
 * GET /api/lugares
 * Listar todos los lugares activos
 */
export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const { searchParams } = new URL(request.url);
        const busqueda = searchParams.get("q");

        const where: { deleted_at: null; nombre?: { contains: string } } = {
            deleted_at: null,
        };

        if (busqueda) {
            where.nombre = { contains: busqueda };
        }

        const lugares = await prisma.lugar.findMany({
            where,
            include: {
                creador: {
                    select: { id: true, nombre: true, email: true },
                },
                _count: {
                    select: { mediciones: { where: { deleted_at: null } } },
                },
            },
            orderBy: { nombre: "asc" },
        });

        return NextResponse.json({
            success: true,
            data: lugares,
            total: lugares.length,
        });
    } catch (error) {
        console.error("Error al listar lugares:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/lugares
 * Crear nuevo lugar
 */
export async function POST(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const body = await request.json();
        const { nombre, nota, latitud, longitud } = body;

        // Validaciones
        if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "El nombre es requerido" },
                { status: 400 }
            );
        }

        // Validar coordenadas si se proporcionan
        if (latitud !== undefined && latitud !== null) {
            const lat = parseFloat(latitud);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                return NextResponse.json(
                    { success: false, message: "Latitud inválida (debe estar entre -90 y 90)" },
                    { status: 400 }
                );
            }
        }

        if (longitud !== undefined && longitud !== null) {
            const lng = parseFloat(longitud);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                return NextResponse.json(
                    { success: false, message: "Longitud inválida (debe estar entre -180 y 180)" },
                    { status: 400 }
                );
            }
        }

        // Crear lugar
        const nuevoLugar = await prisma.lugar.create({
            data: {
                nombre: nombre.trim(),
                nota: nota?.trim() || null,
                latitud: latitud !== undefined && latitud !== null ? parseFloat(latitud) : null,
                longitud: longitud !== undefined && longitud !== null ? parseFloat(longitud) : null,
                creado_por_id: auth.id,
            },
            include: {
                creador: {
                    select: { id: true, nombre: true, email: true },
                },
            },
        });

        // Registrar en bitácora
        await registrarCambio(
            "lugares",
            nuevoLugar.id,
            "CREATE",
            cambiosCreate({
                nombre: nuevoLugar.nombre,
                nota: nuevoLugar.nota,
                latitud: nuevoLugar.latitud?.toString(),
                longitud: nuevoLugar.longitud?.toString(),
            }),
            auth.id,
            getClientIp(request)
        );

        return NextResponse.json(
            {
                success: true,
                message: "Lugar creado exitosamente",
                data: nuevoLugar,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error al crear lugar:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
