import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
    verifyAuth,
    isAuthError,
    getClientIp,
} from "@/lib/middleware/auth";
import {
    registrarCambio,
    cambiosCreate,
} from "@/lib/bitacora";

/**
 * GET /api/origenes
 * Listar todos los orígenes de datos activos (no eliminados)
 */
export async function GET(request: NextRequest) {
    // Verificar autenticación
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const origenes = await prisma.origenDato.findMany({
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
            data: origenes,
            total: origenes.length,
        });
    } catch (error) {
        console.error("Error al listar orígenes:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/origenes
 * Crear nuevo origen de datos
 */
export async function POST(request: NextRequest) {
    // Verificar autenticación
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const body = await request.json();
        const { nombre, descripcion } = body;

        // Validaciones
        if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "El nombre es requerido" },
                { status: 400 }
            );
        }

        // Verificar unicidad de nombre (solo entre no eliminados)
        const existente = await prisma.origenDato.findFirst({
            where: { nombre: nombre.trim(), deleted_at: null },
        });

        if (existente) {
            return NextResponse.json(
                { success: false, message: `El origen "${nombre}" ya existe` },
                { status: 409 }
            );
        }

        // Crear origen
        const nuevoOrigen = await prisma.origenDato.create({
            data: {
                nombre: nombre.trim(),
                descripcion: descripcion?.trim() || null,
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
            "origen_datos",
            nuevoOrigen.id,
            "CREATE",
            cambiosCreate({ nombre: nuevoOrigen.nombre, descripcion: nuevoOrigen.descripcion }),
            auth.id,
            getClientIp(request)
        );

        return NextResponse.json(
            {
                success: true,
                message: "Origen creado exitosamente",
                data: nuevoOrigen,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error al crear origen:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
