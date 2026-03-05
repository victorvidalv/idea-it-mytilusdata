import { fail } from '@sveltejs/kit';
import { checkRateLimit, checkEmailCooldown } from '$lib/server/rateLimiter';

/**
 * Verificar todos los rate limits antes de procesar un login.
 * Verifica: rate limit por IP, rate limit por email, y cooldown de email.
 * Retorna respuesta de error o null si todo está dentro de los límites.
 */
export async function checkAllRateLimits(email: string, clientIp: string) {
	// Verificar rate limit por IP
	const ipCheck = await checkRateLimit(clientIp, 'IP');
	if (!ipCheck.allowed) {
		return fail(429, {
			email,
			rateLimited: true,
			message: ipCheck.message || 'Demasiados intentos. Intenta más tarde.',
			resetIn: ipCheck.resetIn
		});
	}

	// Verificar rate limit por email
	const emailCheck = await checkRateLimit(email, 'EMAIL');
	if (!emailCheck.allowed) {
		return fail(429, {
			email,
			rateLimited: true,
			message: emailCheck.message || 'Demasiados intentos para este correo.',
			resetIn: emailCheck.resetIn
		});
	}

	// Verificar cooldown de email
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