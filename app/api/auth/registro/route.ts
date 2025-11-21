import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, generateToken, AuthResponse } from "@/lib/auth";
import { withRateLimit } from "@/lib/middleware";
import { withCSRFProtection } from "@/lib/middleware";
import { registroSchema } from "@/lib/validators";
import { handleApiError, ApiError } from "@/lib/utils/errors";

import { logger } from "@/lib/utils/logger";

/**
 * POST /api/auth/registro
 * Registrar nuevo usuario en el sistema con protecciones de seguridad
 */
export const POST = withRateLimit(
    withCSRFProtection(async (request: NextRequest): Promise<NextResponse> => {
        try {
            const body = await request.json();
            const validatedData = registroSchema.parse(body);
            const { nombre, email, password } = validatedData;

            logger.info("Intento de registro", {
                email: email.toLowerCase().trim(),
                nombre: nombre.trim(),
                action: "registro_attempt",
            });

            // Verificar si el email ya está registrado
            const usuarioExistente = await prisma.usuario.findUnique({
                where: { email: email.toLowerCase().trim() },
            });

            if (usuarioExistente) {
                logger.warn("Registro fallido: email ya registrado", {
                    email: email.toLowerCase().trim(),
                    action: "registro_failed",
                    reason: "email_already_registered",
                });

                throw ApiError.badRequest("El email ya está registrado");
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



            // Generar token JWT
            const userAny = nuevoUsuario as any;
            const token = generateToken(nuevoUsuario.id, nuevoUsuario.email, userAny.rol);

            logger.info("Registro exitoso", {
                userId: nuevoUsuario.id,
                email: nuevoUsuario.email,
                nombre: nuevoUsuario.nombre,
                rol: userAny.rol,
                action: "registro_success",
            });

            return NextResponse.json<AuthResponse>({
                success: true,
                message: "Usuario registrado exitosamente",
                token,
                user: {
                    id: nuevoUsuario.id,
                    nombre: nuevoUsuario.nombre,
                    email: nuevoUsuario.email,
                    rol: userAny.rol,
                },
            }, { status: 201 });
        } catch (error) {
            return handleApiError(error, {
                action: "registro",
                path: "/api/auth/registro",
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
