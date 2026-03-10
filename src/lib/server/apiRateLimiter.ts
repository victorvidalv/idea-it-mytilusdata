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

// --- Helpers internos ---

/** Calcula el inicio de la ventana de tiempo */
function getWindowStart(windowMs: number): Date {
	return new Date(Date.now() - windowMs);
}

/** Cuenta los intentos en la ventana de tiempo */
async function countAttemptsInWindow(
	identifier: string,
	windowStart: Date
): Promise<typeof rateLimitLogs.$inferSelect[]> {
	return db
		.select()
		.from(rateLimitLogs)
		.where(
			and(
				eq(rateLimitLogs.identifier, identifier),
				eq(rateLimitLogs.tipo, 'IP'),
				gt(rateLimitLogs.createdAt, windowStart)
			)
		);
}

/** Construye el resultado cuando la solicitud está permitida */
function buildAllowedResult(remaining: number, config: (typeof API_RATE_LIMITS)[ApiRateLimitType]): ApiRateLimitResult {
	return {
		allowed: true,
		remaining,
		resetIn: config.windowMs,
		limit: config.maxAttempts
	};
}

/** Construye el resultado cuando la solicitud está bloqueada */
function buildBlockedResult(
	attempts: typeof rateLimitLogs.$inferSelect[],
	config: (typeof API_RATE_LIMITS)[ApiRateLimitType]
): ApiRateLimitResult {
	const sortedAttempts = [...attempts].sort(
		(a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
	);
	const oldestAttempt = sortedAttempts[0];
	const resetAt = (oldestAttempt?.createdAt?.getTime() ?? Date.now()) + config.windowMs;
	const resetIn = Math.max(0, resetAt - Date.now());

	return {
		allowed: false,
		remaining: 0,
		resetIn,
		limit: config.maxAttempts
	};
}

/** Construye el resultado por defecto (usado en caso de error) */
function buildDefaultResult(config: (typeof API_RATE_LIMITS)[ApiRateLimitType]): ApiRateLimitResult {
	return {
		allowed: true,
		remaining: config.maxAttempts,
		resetIn: config.windowMs,
		limit: config.maxAttempts
	};
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
	const windowStart = getWindowStart(config.windowMs);

	try {
		const attempts = await countAttemptsInWindow(identifier, windowStart);
		const attemptCount = attempts.length;
		const remaining = Math.max(0, config.maxAttempts - attemptCount);

		if (attemptCount < config.maxAttempts) {
			return buildAllowedResult(remaining, config);
		}

		return buildBlockedResult(attempts, config);
	} catch (error) {
		console.error('Error checking API rate limit:', error);
		return buildDefaultResult(config);
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
			tipo: 'IP'
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
	if (apiKey) {
		return `apikey:${apiKey.substring(0, 16)}...`;
	}
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