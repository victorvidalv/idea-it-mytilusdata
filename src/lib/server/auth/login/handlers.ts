import { fail } from '@sveltejs/kit';
import { createMagicLink } from '$lib/server/auth';
import { verifyTurnstile } from '$lib/server/captcha';
import { logMagicLinkSent, logLoginFailed } from '$lib/server/audit';
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
 * Validar los datos de registro de un nuevo usuario.
 * Retorna un mensaje de error si la validación falla, o null si es válida.
 */
function validateRegistrationData(
	nombre: FormDataEntryValue | null,
	terms: FormDataEntryValue | null,
	email: string
) {
	// Sin nombre: mostrar formulario de registro
	if (!nombre) {
		return { valid: false, error: { requiresRegistration: true, email } };
	}

	// Validar nombre
	if (typeof nombre !== 'string' || nombre.length < 2) {
		return {
			valid: false,
			error: fail(400, {
				email,
				nombre,
				requiresRegistration: true,
				missing: true,
				message: 'Nombre es requerido'
			})
		};
	}

	// Validar aceptación de términos
	if (terms !== 'on' && terms !== 'true') {
		return {
			valid: false,
			error: fail(400, {
				email,
				nombre,
				requiresRegistration: true,
				missing: true,
				message: 'Debes aceptar las condiciones del servicio'
			})
		};
	}

	return { valid: true };
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
	// Validar datos de registro
	const validation = validateRegistrationData(nombre, terms, ctx.email);
	if (!validation.valid && validation.error) {
		// Si el error indica que requiere registro sin datos de email, agregar el email
		if ('requiresRegistration' in validation.error && !('status' in validation.error)) {
			return { requiresRegistration: true, email: ctx.email };
		}
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