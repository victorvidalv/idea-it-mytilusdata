import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withRole } from "@/lib/middleware";

/**
 * GET /api/usuarios
 * Listar usuarios activos (solo para ADMIN)
 */
export const GET = withRole(async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const busqueda = searchParams.get("q");
        const incluirInactivos = searchParams.get("inactivos") === "true";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (!incluirInactivos) {
            where.activo = true;
        }

        if (busqueda) {
            where.OR = [
                { nombre: { contains: busqueda, mode: 'insensitive' } },
                { email: { contains: busqueda, mode: 'insensitive' } },
            ];
        }

        const usuarios = await prisma.usuario.findMany({
            where,
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
                activo: true,
                created_at: true,
                _count: {
                    select: {
                        mediciones: { where: { deleted_at: null } },
                        lugares: { where: { deleted_at: null } },
                        unidades: { where: { deleted_at: null } },
                    },
                },
            },
            orderBy: { nombre: "asc" },
        });

        return NextResponse.json({
            success: true,
            data: usuarios,
            total: usuarios.length,
        });
    } catch (error) {
        console.error("Error al listar usuarios:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["ADMIN"]);

/**
 * POST /api/usuarios
 * Crear nuevo usuario (solo para ADMIN)
 */
export const POST = withRole(async (request: NextRequest) => {
    try {
        const body = await request.json();
        const { nombre, email, password, rol } = body;

        // Validaciones básicas
        if (!nombre || !email || !password || !rol) {
            return NextResponse.json(
                { success: false, message: "Todos los campos (nombre, email, password, rol) son requeridos" },
                { status: 400 }
            );
        }

        const rolesValidos = ["ADMIN", "EQUIPO", "PUBLICO"];
        if (!rolesValidos.includes(rol)) {
            return NextResponse.json(
                { success: false, message: "Rol inválido" },
                { status: 400 }
            );
        }

        // Verificar si el email ya existe
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email },
        });

        if (usuarioExistente) {
            return NextResponse.json(
                { success: false, message: "El correo electrónico ya está registrado" },
                { status: 400 }
            );
        }

        // Encriptar contraseña
        // Importación dinámica para evitar problemas de tipos o circularidad si fuera el caso
        const { hashPassword } = await import("@/lib/auth");
        const password_hash = await hashPassword(password);

        // Crear usuario
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre,
                email,
                password_hash,
                rol,
                activo: true,
            },
            select: {
                id: true,
                nombre: true,
                email: true,
                rol: true,
                activo: true,
                created_at: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Usuario creado exitosamente",
            data: nuevoUsuario,
        }, { status: 201 });

    } catch (error) {
        console.error("Error al crear usuario:", error);
        return NextResponse.json(
            { success: false, message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}, ["ADMIN"]);
