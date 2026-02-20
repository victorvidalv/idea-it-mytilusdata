import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { apiKeys, ciclos } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import {
	checkApiRateLimit,
	logApiRateLimit,
	getApiRateLimitIdentifier
} from '$lib/server/apiRateLimiter';
import { logApiAccess } from '$lib/server/audit';

import type { RequestEvent } from './$types';

export async function GET({ request, getClientAddress }: RequestEvent) {
	const authHeader = request.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return json({ error: 'Falta la API Key en el header Authorization' }, { status: 401 });
	}

	const key = authHeader.split(' ')[1];
	const clientIp = getClientAddress();
	const userAgent = request.headers.get('user-agent') ?? undefined;

	// Validar la API key
	const [apiKeyRecord] = await db.select().from(apiKeys).where(eq(apiKeys.key, key)).limit(1);

	if (!apiKeyRecord) {
		return json({ error: 'API Key inválida' }, { status: 401 });
	}

	// Rate limiting
	const identifier = getApiRateLimitIdentifier(key, clientIp);
	const rateLimitResult = await checkApiRateLimit(identifier, 'DEFAULT');

	if (!rateLimitResult.allowed) {
		return json(
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
		);
	}

	// Registrar solicitud para rate limiting
	await logApiRateLimit(identifier);

	// Registrar acceso en auditoría (sin bloquear)
	logApiAccess({
		userId: apiKeyRecord.userId,
		endpoint: '/api/ciclos',
		method: 'GET',
		ip: clientIp,
		userAgent
	}).catch(() => {});

	try {
		// Fetch ciclos for this user ID
		const userCiclos = await db.select().from(ciclos).where(eq(ciclos.userId, apiKeyRecord.userId));

		// Incluir headers de rate limit en la respuesta
		return json(
			{ data: userCiclos },
			{
				headers: {
					'X-RateLimit-Limit': String(rateLimitResult.limit),
					'X-RateLimit-Remaining': String(rateLimitResult.remaining - 1),
					'X-RateLimit-Reset': String(Date.now() + rateLimitResult.resetIn)
				}
			}
		);
	} catch (error) {
		console.error('Error obteniendo ciclos:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
