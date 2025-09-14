import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth, isAuthError } from "@/lib/middleware/auth";

/**
 * GET /api/tipos-registro
 * Listar todos los tipos de registro
 * Nota: Estos son catálogos fijos (PRUEBA, MUESTRA, DATO_PREVIO)
 */
export async function GET(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const tipos = await prisma.tipoRegistro.findMany({
            orderBy: { id: "asc" },
            include: {
                _count: {
                    select: { mediciones: { where: { deleted_at: null } } },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: tipos,
            total: tipos.length,
        });
    } catch (error) {
        console.error("Error al listar tipos de registro:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/tipos-registro
 * Crear nuevo tipo de registro (solo admin)
 */
export async function POST(request: NextRequest) {
    const auth = await verifyAuth(request);
    if (isAuthError(auth)) return auth;

    try {
        const body = await request.json();
        const { codigo, descripcion } = body;

        // Validaciones
        if (!codigo || typeof codigo !== "string" || codigo.trim().length === 0) {
            return NextResponse.json(
                { success: false, message: "El código es requerido" },
                { status: 400 }
            );
        }

        // Normalizar código (mayúsculas, sin espacios)
        const codigoNormalizado = codigo.toUpperCase().trim().replace(/\s+/g, "_");

        // Verificar unicidad
        const existente = await prisma.tipoRegistro.findUnique({
            where: { codigo: codigoNormalizado },
        });

        if (existente) {
            return NextResponse.json(
                { success: false, message: `El código "${codigoNormalizado}" ya existe` },
                { status: 409 }
            );
        }

        // Crear tipo de registro
        const nuevoTipo = await prisma.tipoRegistro.create({
            data: {
                codigo: codigoNormalizado,
                descripcion: descripcion?.trim() || null,
            },
        });

        return NextResponse.json(
            {
                success: true,
                message: "Tipo de registro creado exitosamente",
                data: nuevoTipo,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error al crear tipo de registro:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
