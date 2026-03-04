import { validateApiKey } from '$lib/server/apiAuth';
import type { RequestEvent } from '@sveltejs/kit';

/** Autentica una petición API usando sesión o API Key */
export async function authenticateApiRequest(event: RequestEvent): Promise<boolean> {
	// Si ya hay sesión de usuario válida, está autenticado
	if (event.locals.user) {
		return true;
	}

	// Intentar autenticación por API Key
	const authHeader = event.request.headers.get('Authorization');
	const apiKeyResult = await validateApiKey(authHeader);

	if (apiKeyResult.valid && apiKeyResult.userId) {
		event.locals.apiUserId = apiKeyResult.userId;
		return true;
	}

	return false;
}