/**
 * Configuración de rate limiting para API.
 */
import type { RateLimitConfig } from './types';

/**
 * Límites para endpoints de API.
 * DEFAULT: Límite estándar para endpoints de lectura.
 * EXPORT: Límite más restrictivo para exportación de datos.
 */
export const API_RATE_LIMITS = {
	DEFAULT: {
		maxAttempts: 100,
		windowMs: 60 * 1000 // 1 minuto
	},
	EXPORT: {
		maxAttempts: 10,
		windowMs: 60 * 1000 // 1 minuto
	}
} as const satisfies Record<string, RateLimitConfig>;

export type ApiRateLimitType = keyof typeof API_RATE_LIMITS;