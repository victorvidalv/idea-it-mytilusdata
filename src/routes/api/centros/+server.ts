import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { lugares } from '$lib/server/db/schema';
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
		// Fetch centros (lugares) for this user ID
		const userCentros = await db.select().from(lugares).where(eq(lugares.userId, userId));

		// Incluir headers de rate limit en la respuesta
		return json(
			{ data: userCentros },
			{
				headers: {
					'X-RateLimit-Limit': String(rateLimitResult.limit),
					'X-RateLimit-Remaining': String(rateLimitResult.remaining - 1),
					'X-RateLimit-Reset': String(Date.now() + rateLimitResult.resetIn)
				}
			}
		);
	} catch (error) {
		console.error('Error obteniendo centros:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
