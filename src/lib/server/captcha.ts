import { env } from '$env/dynamic/private';

// --- Tipos ---

interface TurnstileVerifyResponse {
	success: boolean;
	challenge_ts?: string;
	hostname?: string;
	error_codes?: string[];
	action?: string;
	cdata?: string;
}

// --- Configuración ---

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

// --- Funciones ---

/**
 * Verifica un token de Cloudflare Turnstile.
 * @param token - El token recibido del widget de Turnstile
 * @param ip - La dirección IP del cliente (opcional, para mayor seguridad)
 * @returns true si la verificación es exitosa, false en caso contrario
 */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
	const secretKey = env.TURNSTILE_SECRET_KEY;

	// Si no hay clave secreta configurada, permitir (modo desarrollo)
	if (!secretKey) {
		console.warn('TURNSTILE_SECRET_KEY no configurada. Omitiendo verificación CAPTCHA.');
		return true;
	}

	// Si no hay token, rechazar
	if (!token) {
		console.warn('Token de Turnstile no proporcionado.');
		return false;
	}

	try {
		const formData = new URLSearchParams();
		formData.append('secret', secretKey);
		formData.append('response', token);
		if (ip) {
			formData.append('remoteip', ip);
		}

		const response = await fetch(TURNSTILE_VERIFY_URL, {
			method: 'POST',
			body: formData,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		});

		if (!response.ok) {
			console.error('Error en la respuesta de Turnstile:', response.status);
			return false;
		}

		const result: TurnstileVerifyResponse = await response.json();

		if (result.success) {
			return true;
		}

		console.warn('Verificación de Turnstile fallida:', result.error_codes);
		return false;
	} catch (error) {
		console.error('Error al verificar Turnstile:', error);
		// En caso de error de red, permitir el intento para no bloquear usuarios legítimos
		return true;
	}
}

/**
 * Verifica si la clave secreta de Turnstile está configurada.
 * Útil para determinar si se debe mostrar el widget en el frontend.
 */
export function isTurnstileConfigured(): boolean {
	return !!env.TURNSTILE_SECRET_KEY;
}
