import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { mediciones, apiKeys } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

import type { RequestEvent } from './$types';

export async function GET({ request }: RequestEvent) {
	const authHeader = request.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return json({ error: 'Falta la API Key en el header Authorization' }, { status: 401 });
	}

	const key = authHeader.split(' ')[1];

	// Validar la API key
	const [apiKeyRecord] = await db.select().from(apiKeys).where(eq(apiKeys.key, key)).limit(1);

	if (!apiKeyRecord) {
		return json({ error: 'API Key inválida' }, { status: 401 });
	}

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
			.where(eq(mediciones.userId, apiKeyRecord.userId));

		return json({ data: userRegistros });
	} catch (error) {
		console.error('Error obteniendo registros:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
