import { db } from './db';
import { rateLimitLogs, emailCooldowns } from './db/schema';
import { eq, and, gt, lt } from 'drizzle-orm';

// --- Configuración de Rate Limiting ---

/** Límite de intentos por IP en ventana de tiempo */
const IP_RATE_LIMIT = {
	maxAttempts: 5,
	windowMs: 15 * 60 * 1000 // 15 minutos
};

/** Límite de intentos por email en ventana de tiempo */
const EMAIL_RATE_LIMIT = {
	maxAttempts: 3,
	windowMs: 60 * 60 * 1000 // 1 hora
};

/** Cooldown entre envíos de email al mismo correo */
const EMAIL_COOLDOWN_MS = 60 * 1000; // 60 segundos

/** Tiempo de retención de logs antiguos antes de limpieza */
const CLEANUP_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 horas

// --- Tipos ---

export type RateLimitType = 'IP' | 'EMAIL';

export interface RateLimitResult {
	allowed: boolean;
	remainingAttempts: number;
	resetIn?: number; // milisegundos hasta que se reinicie el límite
	message?: string;
}

export interface CooldownResult {
	allowed: boolean;
	remainingSeconds: number;
	message?: string;
}

// --- Funciones de Rate Limiting ---

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
	const config = tipo === 'IP' ? IP_RATE_LIMIT : EMAIL_RATE_LIMIT;
	const windowStart = new Date(Date.now() - config.windowMs);

	try {
		// Contar intentos en la ventana de tiempo
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
		const remainingAttempts = Math.max(0, config.maxAttempts - attemptCount);

		// Si no ha excedido el límite
		if (attemptCount < config.maxAttempts) {
			return {
				allowed: true,
				remainingAttempts
			};
		}

		// Si excedió el límite, calcular cuándo se reinicia
		const oldestAttempt = attempts.sort(
			(a, b) => a.createdAt.getTime() - b.createdAt.getTime()
		)[0];
		const resetAt = oldestAttempt.createdAt.getTime() + config.windowMs;
		const resetIn = Math.max(0, resetAt - Date.now());

		return {
			allowed: false,
			remainingAttempts: 0,
			resetIn,
			message:
				tipo === 'IP'
					? `Demasiados intentos desde esta dirección. Intenta nuevamente en ${formatTime(resetIn)}.`
					: `Demasiados intentos para este correo. Intenta nuevamente en ${formatTime(resetIn)}.`
		};
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
export async function logRateLimitAttempt(
	identifier: string,
	tipo: RateLimitType
): Promise<void> {
	try {
		await db.insert(rateLimitLogs).values({
			identifier,
			tipo
		});
	} catch (error) {
		console.error('Error logging rate limit attempt:', error);
	}
}

/**
 * Verifica si un email está en período de cooldown.
 * @param email - El correo a verificar
 * @returns Resultado con información sobre el cooldown
 */
export async function checkEmailCooldown(email: string): Promise<CooldownResult> {
	try {
		const [cooldown] = await db
			.select()
			.from(emailCooldowns)
			.where(eq(emailCooldowns.email, email))
			.limit(1);

		if (!cooldown) {
			return {
				allowed: true,
				remainingSeconds: 0
			};
		}

		const elapsed = Date.now() - cooldown.lastSentAt.getTime();
		const remainingMs = EMAIL_COOLDOWN_MS - elapsed;

		if (remainingMs <= 0) {
			return {
				allowed: true,
				remainingSeconds: 0
			};
		}

		const remainingSeconds = Math.ceil(remainingMs / 1000);

		return {
			allowed: false,
			remainingSeconds,
			message: `Por favor espera ${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''} antes de solicitar otro enlace.`
		};
	} catch (error) {
		console.error('Error checking email cooldown:', error);
		// En caso de error, permitir el intento
		return {
			allowed: true,
			remainingSeconds: 0
		};
	}
}

/**
 * Actualiza el timestamp de último envío para un email.
 * @param email - El correo a actualizar
 */
export async function updateEmailCooldown(email: string): Promise<void> {
	try {
		const [existing] = await db
			.select()
			.from(emailCooldowns)
			.where(eq(emailCooldowns.email, email))
			.limit(1);

		if (existing) {
			await db
				.update(emailCooldowns)
				.set({ lastSentAt: new Date() })
				.where(eq(emailCooldowns.email, email));
		} else {
			await db.insert(emailCooldowns).values({
				email,
				lastSentAt: new Date()
			});
		}
	} catch (error) {
		console.error('Error updating email cooldown:', error);
	}
}

/**
 * Limpia registros antiguos de rate limiting y cooldowns expirados.
 * Debe llamarse periódicamente para mantener la base de datos limpia.
 */
export async function cleanupOldRateLimits(): Promise<void> {
	const threshold = new Date(Date.now() - CLEANUP_THRESHOLD_MS);

	try {
		// Limpiar logs de rate limiting antiguos
		await db.delete(rateLimitLogs).where(lt(rateLimitLogs.createdAt, threshold));

		// Limpiar cooldowns expirados
		const cooldownThreshold = new Date(Date.now() - EMAIL_COOLDOWN_MS);
		await db
			.delete(emailCooldowns)
			.where(lt(emailCooldowns.lastSentAt, cooldownThreshold));

		console.log('Rate limit cleanup completed');
	} catch (error) {
		console.error('Error during rate limit cleanup:', error);
	}
}

// --- Utilidades ---

/**
 * Formatea milisegundos a una cadena legible.
 */
function formatTime(ms: number): string {
	const minutes = Math.ceil(ms / (60 * 1000));
	if (minutes < 60) {
		return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
	}
	const hours = Math.ceil(minutes / 60);
	return `${hours} hora${hours !== 1 ? 's' : ''}`;
}
