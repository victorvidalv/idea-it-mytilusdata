import { db } from './db';
import { rateLimitLogs } from './db/schema';
import { eq, and, gt } from 'drizzle-orm';

// --- Configuración de Rate Limiting para API ---

/**
 * Límites para endpoints de API.
 * DEFAULT: Límite estándar para endpoints de lectura.
 * EXPORT: Límite más restrictivo para exportación de datos.
 */
const API_RATE_LIMITS = {
	DEFAULT: {
		maxAttempts: 100,
		windowMs: 60 * 1000 // 1 minuto
	},
	EXPORT: {
		maxAttempts: 10,
		windowMs: 60 * 1000 // 1 minuto
	}
} as const;

export type ApiRateLimitType = keyof typeof API_RATE_LIMITS;

// --- Interfaz de Resultado ---

export interface ApiRateLimitResult {
	allowed: boolean;
	remaining: number;
	resetIn: number;
	limit: number;
}

// --- Funciones de Rate Limiting para API ---

/**
 * Verifica si un identificador (API key o IP) ha excedido su límite de solicitudes API.
 * @param identifier - La API key o dirección IP a verificar
 * @param endpoint - Tipo de endpoint ('DEFAULT' o 'EXPORT')
 * @returns Resultado con información sobre el estado del límite
 */
export async function checkApiRateLimit(
	identifier: string,
	endpoint: ApiRateLimitType = 'DEFAULT'
): Promise<ApiRateLimitResult> {
	const config = API_RATE_LIMITS[endpoint];
	const windowStart = new Date(Date.now() - config.windowMs);
	const rateLimitType = `API_${endpoint}` as 'IP' | 'EMAIL' | `API_${typeof endpoint}`;

	try {
		// Contar solicitudes en la ventana de tiempo
		// Usamos el mismo esquema de rateLimitLogs pero con un tipo específico para API
		const attempts = await db
			.select()
			.from(rateLimitLogs)
			.where(
				and(
					eq(rateLimitLogs.identifier, identifier),
					eq(rateLimitLogs.tipo, 'IP'), // Reutilizamos el tipo IP para API rate limiting
					gt(rateLimitLogs.createdAt, windowStart)
				)
			);

		const attemptCount = attempts.length;
		const remaining = Math.max(0, config.maxAttempts - attemptCount);

		// Si no ha excedido el límite
		if (attemptCount < config.maxAttempts) {
			return {
				allowed: true,
				remaining,
				resetIn: config.windowMs,
				limit: config.maxAttempts
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
			remaining: 0,
			resetIn,
			limit: config.maxAttempts
		};
	} catch (error) {
		console.error('Error checking API rate limit:', error);
		// En caso de error, permitir la solicitud para no bloquear usuarios legítimos
		return {
			allowed: true,
			remaining: config.maxAttempts,
			resetIn: config.windowMs,
			limit: config.maxAttempts
		};
	}
}

/**
 * Registra una solicitud API para rate limiting.
 * @param identifier - La API key o dirección IP
 */
export async function logApiRateLimit(identifier: string): Promise<void> {
	try {
		await db.insert(rateLimitLogs).values({
			identifier,
			tipo: 'IP' // Reutilizamos el tipo IP para API rate limiting
		});
	} catch (error) {
		console.error('Error logging API rate limit:', error);
	}
}

/**
 * Obtiene el identificador para rate limiting de una solicitud API.
 * Prioriza la API key sobre la IP para un control más granular.
 * @param apiKey - La API key de la solicitud
 * @param ip - La dirección IP del cliente
 * @returns El identificador a usar para rate limiting
 */
export function getApiRateLimitIdentifier(apiKey: string | null, ip: string): string {
	// Si hay API key, usarla como identificador (más específico)
	if (apiKey) {
		return `apikey:${apiKey.substring(0, 16)}...`;
	}
	// Si no, usar la IP
	return `ip:${ip}`;
}

/**
 * Formatea milisegundos a una cadena legible.
 */
export function formatResetTime(ms: number): string {
	const seconds = Math.ceil(ms / 1000);
	if (seconds < 60) {
		return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
	}
	const minutes = Math.ceil(seconds / 60);
	return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
}
