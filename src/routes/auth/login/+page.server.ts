import { fail } from '@sveltejs/kit';
import { createMagicLink } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import {
	checkRateLimit,
	logRateLimitAttempt,
	checkEmailCooldown,
	updateEmailCooldown
} from '$lib/server/rateLimiter';
import { verifyTurnstile } from '$lib/server/captcha';
import { logMagicLinkSent, logLoginFailed, logUserCreated } from '$lib/server/audit';
import type { Actions, RequestEvent } from './$types';

export const actions = {
	default: async (event: RequestEvent) => {
		const { request, url, getClientAddress } = event;
		const data = await request.formData();
		const email = data.get('email');
		const nombre = data.get('nombre');
		const terms = data.get('terms');
		const turnstileToken = data.get('cf-turnstile-response');

		// Obtener IP del cliente y user agent
		const clientIp = getClientAddress();
		const userAgent = request.headers.get('user-agent') ?? undefined;

		// PASO 1: Validar formato de email
		if (!email || typeof email !== 'string' || !email.includes('@')) {
			return fail(400, { email, missing: true, message: 'Correo electrónico inválido' });
		}

		// PASO 2: Verificar rate limiting por IP → Si excede, RETORNAR ERROR
		const ipRateLimit = await checkRateLimit(clientIp, 'IP');
		if (!ipRateLimit.allowed) {
			return fail(429, {
				email,
				rateLimited: true,
				message: ipRateLimit.message || 'Demasiados intentos. Intenta más tarde.',
				resetIn: ipRateLimit.resetIn
			});
		}

		// PASO 3: Verificar rate limiting por email → Si excede, RETORNAR ERROR
		const emailRateLimit = await checkRateLimit(email, 'EMAIL');
		if (!emailRateLimit.allowed) {
			return fail(429, {
				email,
				rateLimited: true,
				message: emailRateLimit.message || 'Demasiados intentos para este correo.',
				resetIn: emailRateLimit.resetIn
			});
		}

		// PASO 4: Verificar cooldown de email → Si excede, RETORNAR ERROR
		const cooldown = await checkEmailCooldown(email);
		if (!cooldown.allowed) {
			return fail(429, {
				email,
				cooldownActive: true,
				message: cooldown.message || 'Espera antes de solicitar otro enlace.',
				remainingSeconds: cooldown.remainingSeconds
			});
		}

		try {
			// Validar si el usuario existe
			const [user] = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);

			if (user) {
				// Usuario existente: enviar enlace mágico
				// PASO 5: Registrar intento en rate limit logs (ANTES de llamar a Resend)
				await logRateLimitAttempt(clientIp, 'IP');
				await logRateLimitAttempt(email, 'EMAIL');

				// PASO 6: Actualizar cooldown (ANTES de llamar a Resend)
				await updateEmailCooldown(email);

				// PASO 7: RECÍÉN AHORA llamar a createMagicLink (que usa Resend)
				await createMagicLink(email, user.nombre, url.origin, userAgent, clientIp);

				// Registrar envío de magic link en auditoría
				await logMagicLinkSent({
					userId: user.id,
					email,
					ip: clientIp
				});

				return { success: true };
			} else {
				// Usuario nuevo: requiere registro
				if (!nombre) {
					// Primer paso: mostrar formulario de registro
					return { requiresRegistration: true, email };
				}

				// Validar nombre
				if (typeof nombre !== 'string' || nombre.length < 2) {
					return fail(400, {
						email,
						nombre,
						requiresRegistration: true,
						missing: true,
						message: 'Nombre es requerido'
					});
				}

				// Validar términos
				if (terms !== 'on' && terms !== 'true') {
					return fail(400, {
						email,
						nombre,
						requiresRegistration: true,
						missing: true,
						message: 'Debes aceptar las condiciones del servicio'
					});
				}

				// PASO 5 (para usuarios nuevos): Verificar CAPTCHA → Si falla, RETORNAR ERROR
				const captchaValid = await verifyTurnstile(
					typeof turnstileToken === 'string' ? turnstileToken : '',
					clientIp
				);

				if (!captchaValid) {
					// Registrar intento fallido en auditoría
					await logLoginFailed({
						email,
						ip: clientIp,
						userAgent,
						reason: 'CAPTCHA_FAILED'
					});

					return fail(400, {
						email,
						nombre,
						requiresRegistration: true,
						captchaError: true,
						message: 'Verificación de seguridad fallida. Por favor, completa el CAPTCHA.'
					});
				}

				// PASO 6: Registrar intento en rate limit logs (ANTES de llamar a Resend)
				await logRateLimitAttempt(clientIp, 'IP');
				await logRateLimitAttempt(email, 'EMAIL');

				// PASO 7: Actualizar cooldown (ANTES de llamar a Resend)
				await updateEmailCooldown(email);

				// PASO 8: RECÍÉN AHORA llamar a createMagicLink (que usa Resend)
				await createMagicLink(email, nombre, url.origin, userAgent, clientIp);

				// Nota: El usuario se crea en createMagicLink, pero no tenemos su ID aquí
				// El evento USER_CREATED se registrará cuando se complete el callback del magic link
				// Por ahora registramos el envío del magic link
				await logMagicLinkSent({
					email,
					ip: clientIp
				});

				return { success: true };
			}
		} catch (error) {
			console.error('Login action error:', error);

			// Registrar error en auditoría
			await logLoginFailed({
				email,
				ip: clientIp,
				userAgent,
				reason: 'INTERNAL_ERROR'
			});

			return fail(500, {
				email,
				nombre,
				error: true,
				message: 'No se pudo procesar la solicitud. Inténtalo de nuevo.'
			});
		}
	}
} satisfies Actions;
