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
import type { Actions, RequestEvent } from './$types';

export const actions = {
	default: async (event: RequestEvent) => {
		const { request, url, getClientAddress } = event;
		const data = await request.formData();
		const email = data.get('email');
		const nombre = data.get('nombre');
		const terms = data.get('terms');
		const turnstileToken = data.get('cf-turnstile-response');

		// Obtener IP del cliente
		const clientIp = getClientAddress();

		// Validar email básico
		if (!email || typeof email !== 'string' || !email.includes('@')) {
			return fail(400, { email, missing: true, message: 'Correo electrónico inválido' });
		}

		// --- Rate Limiting por IP ---
		const ipRateLimit = await checkRateLimit(clientIp, 'IP');
		if (!ipRateLimit.allowed) {
			return fail(429, {
				email,
				rateLimited: true,
				message: ipRateLimit.message || 'Demasiados intentos. Intenta más tarde.',
				resetIn: ipRateLimit.resetIn
			});
		}

		// --- Rate Limiting por Email ---
		const emailRateLimit = await checkRateLimit(email, 'EMAIL');
		if (!emailRateLimit.allowed) {
			return fail(429, {
				email,
				rateLimited: true,
				message: emailRateLimit.message || 'Demasiados intentos para este correo.',
				resetIn: emailRateLimit.resetIn
			});
		}

		// --- Verificar Cooldown de Email ---
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
				// Registrar intentos de rate limiting
				await logRateLimitAttempt(clientIp, 'IP');
				await logRateLimitAttempt(email, 'EMAIL');
				await updateEmailCooldown(email);

				await createMagicLink(email, user.nombre, url.origin);
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

				// --- Verificar CAPTCHA para usuarios nuevos ---
				const captchaValid = await verifyTurnstile(
					typeof turnstileToken === 'string' ? turnstileToken : '',
					clientIp
				);

				if (!captchaValid) {
					return fail(400, {
						email,
						nombre,
						requiresRegistration: true,
						captchaError: true,
						message: 'Verificación de seguridad fallida. Por favor, completa el CAPTCHA.'
					});
				}

				// Registrar intentos de rate limiting
				await logRateLimitAttempt(clientIp, 'IP');
				await logRateLimitAttempt(email, 'EMAIL');
				await updateEmailCooldown(email);

				// Crear usuario y enviar enlace mágico
				await createMagicLink(email, nombre, url.origin);
				return { success: true };
			}
		} catch (error) {
			console.error('Login action error:', error);
			return fail(500, {
				email,
				nombre,
				error: true,
				message: 'No se pudo procesar la solicitud. Inténtalo de nuevo.'
			});
		}
	}
} satisfies Actions;
