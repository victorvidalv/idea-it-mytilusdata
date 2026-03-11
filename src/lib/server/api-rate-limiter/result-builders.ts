/**
 * Constructores de resultado para el módulo de rate limiting de API.
 */
import type { ApiRateLimitResult, RateLimitConfig } from './types';
import { rateLimitLogs } from '../db/schema';

/**
 * Construye el resultado cuando la solicitud está permitida.
 * @param remaining - Número de intentos restantes
 * @param config - Configuración de rate limit
 * @returns Resultado de rate limit permitido
 */
export function buildAllowedResult(remaining: number, config: RateLimitConfig): ApiRateLimitResult {
	return {
		allowed: true,
		remaining,
		resetIn: config.windowMs,
		limit: config.maxAttempts
	};
}

/**
 * Construye el resultado cuando la solicitud está bloqueada.
 * @param attempts - Lista de intentos previos
 * @param config - Configuración de rate limit
 * @returns Resultado de rate limit bloqueado
 */
export function buildBlockedResult(
	attempts: typeof rateLimitLogs.$inferSelect[],
	config: RateLimitConfig
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

/**
 * Construye el resultado por defecto (usado en caso de error).
 * @param config - Configuración de rate limit
 * @returns Resultado de rate limit por defecto
 */
export function buildDefaultResult(config: RateLimitConfig): ApiRateLimitResult {
	return {
		allowed: true,
		remaining: config.maxAttempts,
		resetIn: config.windowMs,
		limit: config.maxAttempts
	};
}