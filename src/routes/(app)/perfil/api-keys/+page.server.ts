import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { apiKeys } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async ({ locals }) => {
	// Require authentication (assuming locals.user exists from hooks)
	const sessionUser = locals.user;
	if (!sessionUser) {
		throw error(401, 'No autorizado');
	}

	const existingKey = await db
		.select()
		.from(apiKeys)
		.where(eq(apiKeys.userId, sessionUser.userId))
		.get();

	return {
		apiKey: existingKey ? existingKey.key : null,
		createdAt: existingKey ? existingKey.createdAt : null
	};
};

export const actions: Actions = {
	generar: async ({ locals }) => {
		const sessionUser = locals.user;
		if (!sessionUser) {
			return fail(401, { message: 'No autorizado' });
		}

		const newKey = `pi_${randomUUID().replace(/-/g, '')}`;

		try {
			// First, check if one exists and delete it to only have one key per user max
			await db.delete(apiKeys).where(eq(apiKeys.userId, sessionUser.userId));

			await db.insert(apiKeys).values({
				userId: sessionUser.userId,
				key: newKey
			});

			return { success: true, key: newKey };
		} catch (e) {
			console.error('Error generando API Key:', e);
			return fail(500, { message: 'Error interno generardo la clave' });
		}
	},
	revocar: async ({ locals }) => {
		const sessionUser = locals.user;
		if (!sessionUser) {
			return fail(401, { message: 'No autorizado' });
		}

		try {
			await db.delete(apiKeys).where(eq(apiKeys.userId, sessionUser.userId));
			return { success: true };
		} catch (e) {
			console.error('Error revocando API Key:', e);
			return fail(500, { message: 'Error interno revocando la clave' });
		}
	}
};
