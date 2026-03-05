import { fail } from '@sveltejs/kit';
import { createMagicLink } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { checkRateLimit, checkEmailCooldown } from '$lib/server/rateLimiter';
import { verifyTurnstile } from '$lib/server/captcha';
import { logMagicLinkSent, logLoginFailed } from '$lib/server/audit';
import type { Actions, RequestEvent } from './$types';

// --- Contexto compartido entre helpers ---

interface LoginContext {
	email: string;
	clientIp: string;
	userAgent: string | undefined;
	origin: string;
}

// --- Helpers con responsabilidad única ---

/**
 * Verificar rate limits: IP, email y cooldown.
 * Retorna respuesta de error o null si todo está dentro de los límites.
 */
async function checkAllRateLimits(email: string, clientIp: string) {
	const ipCheck = await checkRateLimit(clientIp, 'IP');
	if (!ipCheck.allowed) {
		return fail(429, {
			email,
			rateLimited: true,
			message: ipCheck.message || 'Demasiados intentos. Intenta más tarde.',
			resetIn: ipCheck.resetIn
		});
	}

	const emailCheck = await checkRateLimit(email, 'EMAIL');
	if (!emailCheck.allowed) {
		return fail(429, {
			email,
			rateLimited: true,
			message: emailCheck.message || 'Demasiados intentos para este correo.',
			resetIn: emailCheck.resetIn
		});
	}

	const cooldown = await checkEmailCooldown(email);
	if (!cooldown.allowed) {
		return fail(429, {
			email,
			cooldownActive: true,
			message: cooldown.message || 'Espera antes de solicitar otro enlace.',
			remainingSeconds: cooldown.remainingSeconds
		});
	}

	return null;
}

/**
 * Enviar magic link a usuario existente y registrar en auditoría.
 */
async function handleExistingUserLogin(
	user: { id: number; nombre: string },
	ctx: LoginContext
) {
	const result = await createMagicLink(ctx.email, user.nombre, ctx.origin, ctx.userAgent, ctx.clientIp);

	if (!result.success) {
		await logLoginFailed({ email: ctx.email, ip: ctx.clientIp, userAgent: ctx.userAgent, reason: 'RATE_LIMITED_DEFENSIVE' });
		return fail(result.status, { email: ctx.email, rateLimited: true, message: result.error });
	}

	await logMagicLinkSent({ userId: user.id, email: ctx.email, ip: ctx.clientIp });
	return { success: true };
}

/**
 * Validar datos de registro, verificar CAPTCHA, crear usuario y enviar magic link.
 */
async function handleNewUserRegistration(
	nombre: FormDataEntryValue | null,
	terms: FormDataEntryValue | null,
	turnstileToken: FormDataEntryValue | null,
	ctx: LoginContext
) {
	// Sin nombre: mostrar formulario de registro
	if (!nombre) {
		return { requiresRegistration: true, email: ctx.email };
	}

	// Validar nombre
	if (typeof nombre !== 'string' || nombre.length < 2) {
		return fail(400, { email: ctx.email, nombre, requiresRegistration: true, missing: true, message: 'Nombre es requerido' });
	}

	// Validar aceptación de términos
	if (terms !== 'on' && terms !== 'true') {
		return fail(400, { email: ctx.email, nombre, requiresRegistration: true, missing: true, message: 'Debes aceptar las condiciones del servicio' });
	}

	// Verificar CAPTCHA
	const captchaValid = await verifyTurnstile(
		typeof turnstileToken === 'string' ? turnstileToken : '',
		ctx.clientIp
	);

	if (!captchaValid) {
		await logLoginFailed({ email: ctx.email, ip: ctx.clientIp, userAgent: ctx.userAgent, reason: 'CAPTCHA_FAILED' });
		return fail(400, { email: ctx.email, nombre, requiresRegistration: true, captchaError: true, message: 'Verificación de seguridad fallida. Por favor, completa el CAPTCHA.' });
	}

	// Crear usuario y enviar magic link
	const result = await createMagicLink(ctx.email, nombre, ctx.origin, ctx.userAgent, ctx.clientIp);

	if (!result.success) {
		await logLoginFailed({ email: ctx.email, ip: ctx.clientIp, userAgent: ctx.userAgent, reason: 'RATE_LIMITED_DEFENSIVE' });
		return fail(result.status, { email: ctx.email, nombre, requiresRegistration: true, rateLimited: true, message: result.error });
	}

	await logMagicLinkSent({ email: ctx.email, ip: ctx.clientIp });
	return { success: true };
}

// --- Action principal (orquestador) ---

export const actions = {
	default: async (event: RequestEvent) => {
		const { request, url, getClientAddress } = event;
		const data = await request.formData();
		const email = data.get('email');

		const clientIp = getClientAddress();
		const userAgent = request.headers.get('user-agent') ?? undefined;

		// Validar formato de email
		if (!email || typeof email !== 'string' || !email.includes('@')) {
			return fail(400, { email, missing: true, message: 'Correo electrónico inválido' });
		}

		// Verificar todos los rate limits
		const rateLimitError = await checkAllRateLimits(email, clientIp);
		if (rateLimitError) return rateLimitError;

		const ctx: LoginContext = { email, clientIp, userAgent, origin: url.origin };

		try {
			const [user] = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);

			if (user) {
				return handleExistingUserLogin(user, ctx);
			}

			return handleNewUserRegistration(
				data.get('nombre'),
				data.get('terms'),
				data.get('cf-turnstile-response'),
				ctx
			);
		} catch (error) {
			console.error('Login action error:', error);
			await logLoginFailed({ email, ip: clientIp, userAgent, reason: 'INTERNAL_ERROR' });
			return fail(500, { email, error: true, message: 'No se pudo procesar la solicitud. Inténtalo de nuevo.' });
		}
	}
} satisfies Actions;

