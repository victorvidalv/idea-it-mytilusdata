import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { mediciones } from '$lib/server/db/schema';
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
		// Fetch data for this user ID
		const userRegistros = await db
			.select({
				id: mediciones.id,
				valor: mediciones.valor,
				fecha: mediciones.fechaMedicion,
				notas: mediciones.notas,
				cicloId: mediciones.cicloId,
				lugarId: mediciones.lugarId,
				tipoId: mediciones.tipoId,
				origenId: mediciones.origenId
			})
			.from(mediciones)
			.where(eq(mediciones.userId, userId));

		// Incluir headers de rate limit en la respuesta
		return json(
			{ data: userRegistros },
			{
				headers: {
					'X-RateLimit-Limit': String(rateLimitResult.limit),
					'X-RateLimit-Remaining': String(rateLimitResult.remaining - 1),
					'X-RateLimit-Reset': String(Date.now() + rateLimitResult.resetIn)
				}
			}
		);
	} catch (error) {
		console.error('Error obteniendo registros:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
