import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    verifyAuth,
    isAuthError,
    getClientIp,
} from "@/lib/middleware/auth";


/**
 * GET /api/unidades
 * Listar todas las unidades activas (no eliminadas)
 */
export async function GET(request: NextRequest) {
    // Verificar autenticación
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const unidades = await prisma.unidad.findMany({
            where: { deleted_at: null },
            include: {
                creador: {
                    select: { id: true, nombre: true, email: true },
                },
            },
            orderBy: { nombre: "asc" },
        });

        return NextResponse.json({
            success: true,
            data: unidades,
            total: unidades.length,
        });
    } catch (error) {
        console.error("Error al listar unidades:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/unidades
 * Crear nueva unidad
 */
export async function POST(request: NextRequest) {
    // Verificar autenticación
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const body = await request.json();
        const { nombre, sigla } = body;

        // Validaciones
        if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "El nombre es requerido" },
                { status: 400 }
            );
        }

        if (!sigla || typeof sigla !== "string" || sigla.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "La sigla es requerida" },
                { status: 400 }
            );
        }

        // Verificar unicidad de sigla (solo entre no eliminadas)
        const existente = await prisma.unidad.findFirst({
            where: { sigla: sigla.trim(), deleted_at: null },
        });

        if (existente) {
            return NextResponse.json(
                { success: false, message: `La sigla "${sigla}" ya existe` },
                { status: 409 }
            );
        }

        // Crear unidad
        const nuevaUnidad = await prisma.unidad.create({
            data: {
                nombre: nombre.trim(),
                sigla: sigla.trim(),
                creado_por_id: auth.id,
            },
            include: {
                creador: {
                    select: { id: true, nombre: true, email: true },
                },
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Unidad creada exitosamente",
                data: nuevaUnidad,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error al crear unidad:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
