import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, generateToken, AuthResponse } from "@/lib/auth";
import { withRateLimit } from "@/lib/middleware";
import { withCSRFProtection } from "@/lib/middleware";
import { registroSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/utils/errors";
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

                throw new Error("El email ya está registrado");
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

            logger.info("Registro exitoso", {
                userId: nuevoUsuario.id,
                email: nuevoUsuario.email,
                nombre: nuevoUsuario.nombre,
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
