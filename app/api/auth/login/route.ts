import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, generateToken, AuthResponse } from "@/lib/auth";
import { withRateLimit } from "@/lib/middleware";
import { withCSRFProtection } from "@/lib/middleware";
import { loginSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/auth/login
 * Autenticar usuario existente con protecciones de seguridad
 */
export const POST = withRateLimit(
    withCSRFProtection(async (request: NextRequest): Promise<NextResponse> => {
        try {
            const body = await request.json();
            const validatedData = loginSchema.parse(body);
            const { email, password } = validatedData;

            logger.info("Intento de login", {
                email: email.toLowerCase().trim(),
                action: "login_attempt",
            });

            // Buscar usuario por email
            const usuario = await prisma.usuario.findUnique({
                where: { email: email.toLowerCase().trim() },
            });

            // Verificar existencia del usuario
            if (!usuario) {
                logger.warn("Login fallido: usuario no encontrado", {
                    email: email.toLowerCase().trim(),
                    action: "login_failed",
                    reason: "user_not_found",
                });

                throw new Error("Credenciales inválidas");
            }

            // Verificar si el usuario está activo
            if (!usuario.activo) {
                logger.warn("Login fallido: cuenta desactivada", {
                    email: email.toLowerCase().trim(),
                    userId: usuario.id,
                    action: "login_failed",
                    reason: "account_deactivated",
                });

                throw new Error("Cuenta desactivada. Contacte al administrador");
            }

            // Verificar contraseña
            const passwordValida = await verifyPassword(password, usuario.password_hash);

            if (!passwordValida) {
                logger.warn("Login fallido: contraseña incorrecta", {
                    email: email.toLowerCase().trim(),
                    userId: usuario.id,
                    action: "login_failed",
                    reason: "invalid_password",
                });

                throw new Error("Credenciales inválidas");
            }

            // Generar token JWT
            const token = generateToken(usuario.id, usuario.email);

            logger.info("Login exitoso", {
                userId: usuario.id,
                email: usuario.email,
                action: "login_success",
            });

            return NextResponse.json<AuthResponse>({
                success: true,
                message: "Inicio de sesión exitoso",
                token,
                user: {
                    id: usuario.id,
                    nombre: usuario.nombre,
                    email: usuario.email,
                },
            });
        } catch (error) {
            return handleApiError(error, {
                action: "login",
                path: "/api/auth/login",
                method: "POST",
            });
        }
    }) as (...args: unknown[]) => Promise<NextResponse>,
    {
        windowMs: 15 * 60 * 1000, // 15 minutos
        maxRequests: 5,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
    }
);
