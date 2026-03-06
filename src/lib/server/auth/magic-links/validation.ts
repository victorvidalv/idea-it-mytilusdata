import { checkRateLimit, checkEmailCooldown } from '../../rate-limiter';
import type { MagicLinkResult } from './types';

/**
 * Validar rate limits defensivos antes de enviar un Magic Link.
 * Protege contra abuso económico (envío masivo de emails vía Resend).
 * Retorna objeto de error o null si todo está dentro de los límites.
 */
export async function validateMagicLinkRateLimits(
	email: string,
	clientIp?: string
): Promise<MagicLinkResult | null> {
	const emailCheck = await checkRateLimit(email.toLowerCase(), 'EMAIL');
	if (!emailCheck.allowed) {
		return { 
			success: false, 
			error: emailCheck.message || 'Demasiados intentos para este correo', 
			status: 429 
		};
	}

	if (clientIp) {
		const ipCheck = await checkRateLimit(clientIp, 'IP');
		if (!ipCheck.allowed) {
			return { 
				success: false, 
				error: ipCheck.message || 'Demasiados intentos desde esta dirección', 
				status: 429 
			};
		}
	}

	const cooldown = await checkEmailCooldown(email);
	if (!cooldown.allowed) {
		return { 
			success: false, 
			error: cooldown.message || 'Por favor espera antes de solicitar otro enlace', 
			status: 429 
		};
	}

	return null;
}