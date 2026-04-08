/**
 * Utilidades públicas para el módulo de rate limiting de API.
 */
import { db } from '../db';
import { rateLimitLogs } from '../db/schema';

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
 * @param ms - Milisegundos a formatear
 * @returns Cadena legible con el tiempo
 */
export function formatResetTime(ms: number): string {
	const seconds = Math.ceil(ms / 1000);
	if (seconds < 60) {
		return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
	}
	const minutes = Math.ceil(seconds / 60);
	return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
}