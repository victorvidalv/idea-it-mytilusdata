import { fail } from '@sveltejs/kit';
import { createMagicLink } from '$lib/server/auth';
import { verifyTurnstile } from '$lib/server/captcha';
import { logMagicLinkSent, logLoginFailed } from '$lib/server/audit';
import { validateRegistrationData } from './validation';
import type { LoginContext, ExistingUser } from './types';

/**
 * Manejar el login de un usuario existente.
 * Envía un magic link al correo del usuario y registra el evento en auditoría.
 */
export async function handleExistingUserLogin(user: ExistingUser, ctx: LoginContext) {
	const result = await createMagicLink(
		ctx.email,
		user.nombre,
		ctx.origin,
		ctx.userAgent,
		ctx.clientIp
	);

	if (!result.success) {
		await logLoginFailed({
			email: ctx.email,
			ip: ctx.clientIp,
			userAgent: ctx.userAgent,
			reason: 'RATE_LIMITED_DEFENSIVE'
		});
		return fail(result.status, {
			email: ctx.email,
			rateLimited: true,
			message: result.error
		});
	}

	await logMagicLinkSent({
		userId: user.id,
		email: ctx.email,
		ip: ctx.clientIp
	});
	return { success: true };
}

/**
 * Manejar el registro de un nuevo usuario.
 * Valida los datos, verifica CAPTCHA, y envía magic link.
 */
export async function handleNewUserRegistration(
	nombre: FormDataEntryValue | null,
	terms: FormDataEntryValue | null,
	turnstileToken: FormDataEntryValue | null,
	ctx: LoginContext
) {
	const validation = validateRegistrationData(nombre, terms, ctx.email);

	// Caso: requiere mostrar formulario de registro
	if (!validation.valid && 'requiresRegistration' in validation && !('error' in validation)) {
		return { requiresRegistration: true, email: ctx.email };
	}

	// Caso: error de validación
	if (!validation.valid && 'error' in validation) {
		return validation.error;
	}

	const nombreStr = nombre as string;

	// Verificar CAPTCHA
	const captchaValid = await verifyTurnstile(
		typeof turnstileToken === 'string' ? turnstileToken : '',
		ctx.clientIp
	);

	if (!captchaValid) {
		await logLoginFailed({
			email: ctx.email,
			ip: ctx.clientIp,
			userAgent: ctx.userAgent,
			reason: 'CAPTCHA_FAILED'
		});
		return fail(400, {
			email: ctx.email,
			nombre: nombreStr,
			requiresRegistration: true,
			captchaError: true,
			message: 'Verificación de seguridad fallida. Por favor, completa el CAPTCHA.'
		});
	}

	// Crear usuario y enviar magic link
	const result = await createMagicLink(
		ctx.email,
		nombreStr,
		ctx.origin,
		ctx.userAgent,
		ctx.clientIp
	);

	if (!result.success) {
		await logLoginFailed({
			email: ctx.email,
			ip: ctx.clientIp,
			userAgent: ctx.userAgent,
			reason: 'RATE_LIMITED_DEFENSIVE'
		});
		return fail(result.status, {
			email: ctx.email,
			nombre: nombreStr,
			requiresRegistration: true,
			rateLimited: true,
			message: result.error
		});
	}

	await logMagicLinkSent({ email: ctx.email, ip: ctx.clientIp });
	return { success: true };
}