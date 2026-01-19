import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { apiKeys, lugares } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

import type { RequestEvent } from './$types';

export async function GET({ request }: RequestEvent) {
	const authHeader = request.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return json({ error: 'Falta la API Key en el header Authorization' }, { status: 401 });
	}

	const key = authHeader.split(' ')[1];

	// Validar la API key
	const apiKeyRecord = await db.select().from(apiKeys).where(eq(apiKeys.key, key)).get();

	if (!apiKeyRecord) {
		return json({ error: 'API Key inválida' }, { status: 401 });
	}

	try {
		// Fetch centros (lugares) for this user ID
		const userCentros = await db
			.select()
			.from(lugares)
			.where(eq(lugares.userId, apiKeyRecord.userId));

		return json({ data: userCentros });
	} catch (error) {
		console.error('Error obteniendo centros:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
