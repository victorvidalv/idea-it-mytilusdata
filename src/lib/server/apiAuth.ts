import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { apiKeys } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import {
	checkApiRateLimit,
	logApiRateLimit,
	getApiRateLimitIdentifier,
	type ApiRateLimitType
} from '$lib/server/apiRateLimiter';
import { logApiAccess } from '$lib/server/audit';

export async function validateApiKeyAndRateLimit(
	request: Request,
	getClientAddress: () => string,
	endpoint: string,
	method: string = 'GET',
	rateLimitType: ApiRateLimitType = 'DEFAULT'
) {
	const authHeader = request.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return {
			errorResponse: json({ error: 'Falta la API Key en el header Authorization' }, { status: 401 })
		};
	}

	const key = authHeader.split(' ')[1];
	const clientIp = getClientAddress();
	const userAgent = request.headers.get('user-agent') ?? undefined;

	// Validar la API key
	const [apiKeyRecord] = await db.select().from(apiKeys).where(eq(apiKeys.key, key)).limit(1);

	if (!apiKeyRecord) {
		return {
			errorResponse: json({ error: 'API Key inválida' }, { status: 401 })
		};
	}

	// Rate limiting
	const identifier = getApiRateLimitIdentifier(key, clientIp);
	const rateLimitResult = await checkApiRateLimit(identifier, rateLimitType);

	if (!rateLimitResult.allowed) {
		return {
			errorResponse: json(
				{
					error: 'Límite de solicitudes excedido',
					retryAfter: rateLimitResult.resetIn
				},
				{
					status: 429,
					headers: {
						'Retry-After': String(Math.ceil(rateLimitResult.resetIn / 1000)),
						'X-RateLimit-Limit': String(rateLimitResult.limit),
						'X-RateLimit-Remaining': '0',
						'X-RateLimit-Reset': String(Date.now() + rateLimitResult.resetIn)
					}
				}
			)
		};
	}

	// Registrar solicitud para rate limiting
	await logApiRateLimit(identifier);

	// Registrar acceso en auditoría (sin bloquear)
	logApiAccess({
		userId: apiKeyRecord.userId,
		endpoint,
		method,
		ip: clientIp,
		userAgent
	}).catch(() => {});

	return {
		userId: apiKeyRecord.userId,
		rateLimitResult
	};
}
