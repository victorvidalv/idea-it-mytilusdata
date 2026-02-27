import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ciclos } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { validateApiKeyAndRateLimit } from '$lib/server/apiAuth';

import type { RequestEvent } from './$types';

export async function GET({ request, getClientAddress, url }: RequestEvent) {
	const authResult = await validateApiKeyAndRateLimit(
		request,
		getClientAddress,
		url.pathname,
		'GET'
	);

	if (authResult.errorResponse) {
		return authResult.errorResponse;
	}

	const { userId, rateLimitResult } = authResult;

	try {
		// Fetch ciclos for this user ID
		const userCiclos = await db.select().from(ciclos).where(eq(ciclos.userId, userId));

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
