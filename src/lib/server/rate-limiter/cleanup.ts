import { db } from '../db';
import { rateLimitLogs, emailCooldowns } from '../db/schema';
import { lt } from 'drizzle-orm';
import { CLEANUP_THRESHOLD_MS, EMAIL_COOLDOWN_MS } from './types';

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
		await db.delete(emailCooldowns).where(lt(emailCooldowns.lastSentAt, cooldownThreshold));

		console.log('Rate limit cleanup completed');
	} catch (error) {
		console.error('Error during rate limit cleanup:', error);
	}
}