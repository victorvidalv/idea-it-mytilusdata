import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { apiKeys, ciclos } from '$lib/server/db/schema';
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
		// Fetch ciclos for this user ID
		const userCiclos = await db.select().from(ciclos).where(eq(ciclos.userId, apiKeyRecord.userId));

		return json({ data: userCiclos });
	} catch (error) {
		console.error('Error obteniendo ciclos:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
