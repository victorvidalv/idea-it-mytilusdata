/**
 * Tipos e interfaces para el módulo de rate limiting de API.
 */

/**
 * Límites para endpoints de API.
 * DEFAULT: Límite estándar para endpoints de lectura.
 * EXPORT: Límite más restrictivo para exportación de datos.
 */
export interface RateLimitConfig {
	maxAttempts: number;
	windowMs: number;
}

/**
 * Resultado de la verificación de rate limit.
 */
export interface ApiRateLimitResult {
	allowed: boolean;
	remaining: number;
	resetIn: number;
	limit: number;
}