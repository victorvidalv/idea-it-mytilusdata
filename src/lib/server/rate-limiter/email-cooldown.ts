import { db } from '../db';
import { emailCooldowns } from '../db/schema';
import { eq } from 'drizzle-orm';
import { EMAIL_COOLDOWN_MS, type CooldownResult } from './types';

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

		// Early return: no hay cooldown registrado
		if (!cooldown) {
			return { allowed: true, remainingSeconds: 0 };
		}

		const elapsed = Date.now() - cooldown.lastSentAt.getTime();
		const remainingMs = EMAIL_COOLDOWN_MS - elapsed;

		// Early return: cooldown expirado
		if (remainingMs <= 0) {
			return { allowed: true, remainingSeconds: 0 };
		}

		// Cooldown activo
		const remainingSeconds = Math.ceil(remainingMs / 1000);
		return {
			allowed: false,
			remainingSeconds,
			message: `Por favor espera ${remainingSeconds} segundo${remainingSeconds !== 1 ? 's' : ''} antes de solicitar otro enlace.`
		};
	} catch (error) {
		console.error('Error checking email cooldown:', error);
		// En caso de error, permitir el intento
		return { allowed: true, remainingSeconds: 0 };
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