import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, generateToken, AuthResponse } from "@/lib/auth";

/**
 * POST /api/auth/login
 * Autenticar usuario existente
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validar campos requeridos
        if (!email || !password) {
            return NextResponse.json<AuthResponse>(
                {
                    success: false,
                    message: "Email y contraseña son requeridos",
                },
                { status: 400 }
            );
        }

        // Buscar usuario por email
        const usuario = await prisma.usuario.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        // Verificar existencia del usuario
        if (!usuario) {
            return NextResponse.json<AuthResponse>(
                {
                    success: false,
                    message: "Credenciales inválidas",
                },
                { status: 401 }
            );
        }

        // Verificar si el usuario está activo
        if (!usuario.activo) {
            return NextResponse.json<AuthResponse>(
                {
                    success: false,
                    message: "Cuenta desactivada. Contacte al administrador",
                },
                { status: 403 }
            );
        }

        // Verificar contraseña
        const passwordValida = await verifyPassword(password, usuario.password_hash);

        if (!passwordValida) {
            return NextResponse.json<AuthResponse>(
                {
                    success: false,
                    message: "Credenciales inválidas",
                },
                { status: 401 }
            );
        }

        // Generar token JWT
        const token = generateToken(usuario.id, usuario.email);

        return NextResponse.json<AuthResponse>(
            {
                success: true,
                message: "Inicio de sesión exitoso",
                token,
                user: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error en login:", error);
        return NextResponse.json<AuthResponse>(
            {
                success: false,
                message: "Error interno del servidor",
            },
            { status: 500 }
        );
    }
}
