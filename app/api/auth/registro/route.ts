import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, generateToken, AuthResponse } from "@/lib/auth";

/**
 * POST /api/auth/registro
 * Registrar nuevo usuario en el sistema
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nombre, email, password } = body;

        // Validar campos requeridos
        if (!nombre || !email || !password) {
            return NextResponse.json<AuthResponse>(
                {
                    success: false,
                    message: "Todos los campos son requeridos: nombre, email, password",
                },
                { status: 400 }
            );
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json<AuthResponse>(
                {
                    success: false,
                    message: "Formato de email inválido",
                },
                { status: 400 }
            );
        }

        // Validar longitud mínima de contraseña
        if (password.length < 6) {
            return NextResponse.json<AuthResponse>(
                {
                    success: false,
                    message: "La contraseña debe tener al menos 6 caracteres",
                },
                { status: 400 }
            );
        }

        // Verificar si el email ya está registrado
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (usuarioExistente) {
            return NextResponse.json<AuthResponse>(
                {
                    success: false,
                    message: "El email ya está registrado",
                },
                { status: 409 }
            );
        }

        // Crear hash de contraseña
        const password_hash = await hashPassword(password);

        // Crear usuario en base de datos
        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre: nombre.trim(),
                email: email.toLowerCase().trim(),
                password_hash,
                activo: true,
            },
        });

        // Registrar en bitácora
        await prisma.bitacoraCambio.create({
            data: {
                tabla_afectada: "usuarios",
                registro_id: nuevoUsuario.id,
                accion: "CREATE",
                cambios: JSON.stringify({
                    nombre: { anterior: null, nuevo: nuevoUsuario.nombre },
                    email: { anterior: null, nuevo: nuevoUsuario.email },
                }),
                usuario_id: nuevoUsuario.id,
                ip_origen: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
            },
        });

        // Generar token JWT
        const token = generateToken(nuevoUsuario.id, nuevoUsuario.email);

        return NextResponse.json<AuthResponse>(
            {
                success: true,
                message: "Usuario registrado exitosamente",
                token,
                user: {
                    id: nuevoUsuario.id,
                    nombre: nuevoUsuario.nombre,
                    email: nuevoUsuario.email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error en registro:", error);
        return NextResponse.json<AuthResponse>(
            {
                success: false,
                message: "Error interno del servidor",
            },
            { status: 500 }
        );
    }
}
