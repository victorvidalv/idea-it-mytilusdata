import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { lugares } from '$lib/server/db/schema';
import { eq, sql, desc } from 'drizzle-orm';
import { validateApiKeyAndRateLimit } from '$lib/server/apiAuth';
import { parsePaginationParams, buildPaginationMeta } from '$lib/server/pagination';

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
	const pagination = parsePaginationParams(url.searchParams);

	try {
		// Contar total de registros para metadatos de paginación
		const [countResult] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(lugares)
			.where(eq(lugares.userId, userId));

		const total = countResult?.count ?? 0;

		// Consultar con paginación y orden determinístico
		const userCentros = await db
			.select()
			.from(lugares)
			.where(eq(lugares.userId, userId))
			.orderBy(desc(lugares.createdAt))
			.limit(pagination.limit)
			.offset(pagination.offset);

		return json(
			{
				data: userCentros,
				pagination: buildPaginationMeta(pagination, total)
			},
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
