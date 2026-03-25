import { db } from '../db';
import { rateLimitLogs } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import {
	IP_RATE_LIMIT,
	EMAIL_RATE_LIMIT,
	type RateLimitType,
	type RateLimitResult
} from './types';
import { formatTime } from './utils';

/**
 * Obtiene la configuración de rate limit según el tipo.
 */
function getRateLimitConfig(tipo: RateLimitType) {
	return tipo === 'IP' ? IP_RATE_LIMIT : EMAIL_RATE_LIMIT;
}

/**
 * Construye el resultado cuando el límite ha sido excedido.
 */
function buildLimitExceededResult(
	attempts: Array<{ createdAt: Date | null }>,
	config: typeof IP_RATE_LIMIT | typeof EMAIL_RATE_LIMIT,
	tipo: RateLimitType
): RateLimitResult {
	const sortedAttempts = [...attempts].sort(
		(a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
	);
	const oldestAttempt = sortedAttempts[0];
	const resetAt = (oldestAttempt?.createdAt?.getTime() ?? Date.now()) + config.windowMs;
	const resetIn = Math.max(0, resetAt - Date.now());

	const message =
		tipo === 'IP'
			? `Demasiados intentos desde esta dirección. Intenta nuevamente en ${formatTime(resetIn)}.`
			: `Demasiados intentos para este correo. Intenta nuevamente en ${formatTime(resetIn)}.`;

	return {
		allowed: false,
		remainingAttempts: 0,
		resetIn,
		message
	};
}

/**
 * Verifica si un identificador (IP o email) ha excedido su límite de intentos.
 * @param identifier - La dirección IP o email a verificar
 * @param tipo - 'IP' o 'EMAIL'
 * @returns Resultado con información sobre el estado del límite
 */
export async function checkRateLimit(
	identifier: string,
	tipo: RateLimitType
): Promise<RateLimitResult> {
	const config = getRateLimitConfig(tipo);
	const windowStart = new Date(Date.now() - config.windowMs);

	try {
		const attempts = await db
			.select()
			.from(rateLimitLogs)
			.where(
				and(
					eq(rateLimitLogs.identifier, identifier),
					eq(rateLimitLogs.tipo, tipo),
					gt(rateLimitLogs.createdAt, windowStart)
				)
			);

		const attemptCount = attempts.length;

		// Early return: aún hay intentos disponibles
		if (attemptCount < config.maxAttempts) {
			return {
				allowed: true,
				remainingAttempts: Math.max(0, config.maxAttempts - attemptCount)
			};
		}

		// Límite excedido
		return buildLimitExceededResult(attempts, config, tipo);
	} catch (error) {
		console.error('Error checking rate limit:', error);
		// En caso de error, permitir el intento para no bloquear usuarios legítimos
		return {
			allowed: true,
			remainingAttempts: config.maxAttempts
		};
	}
}

/**
 * Registra un intento de login para rate limiting.
 * @param identifier - La dirección IP o email
 * @param tipo - 'IP' o 'EMAIL'
 */
export async function logRateLimitAttempt(identifier: string, tipo: RateLimitType): Promise<void> {
	try {
		await db.insert(rateLimitLogs).values({
			identifier,
			tipo
		});
	} catch (error) {
		console.error('Error logging rate limit attempt:', error);
	}
}