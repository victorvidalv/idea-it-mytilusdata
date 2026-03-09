import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ciclos } from '$lib/server/db/schema';
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
			.from(ciclos)
			.where(eq(ciclos.userId, userId));

		const total = countResult?.count ?? 0;

		// Consultar con paginación y orden determinístico
		const userCiclos = await db
			.select()
			.from(ciclos)
			.where(eq(ciclos.userId, userId))
			.orderBy(desc(ciclos.fechaSiembra))
			.limit(pagination.limit)
			.offset(pagination.offset);

		return json(
			{
				data: userCiclos,
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
		console.error('Error obteniendo ciclos:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
