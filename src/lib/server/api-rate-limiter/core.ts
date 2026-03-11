/**
 * Función principal de rate limiting para API.
 */
import { API_RATE_LIMITS, type ApiRateLimitType } from './config';
import type { ApiRateLimitResult } from './types';
import { getWindowStart, countAttemptsInWindow } from './helpers';
import { buildAllowedResult, buildBlockedResult, buildDefaultResult } from './result-builders';

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