import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { db } from '$lib/server/db';
import {
	usuarios,
	lugares,
	ciclos,
	mediciones,
	consentimientos,
	magicLinkTokens,
	apiKeys
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/auth/login');
	}

	return {
		user: locals.user
	};
};

export const actions = {
	updateProfile: async ({ request, locals, cookies }) => {
		if (!locals.user) throw redirect(303, '/auth/login');

		const data = await request.formData();
		const nombre = data.get('nombre');

		if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) {
			return fail(400, {
				updateError: true,
				message: 'El nombre debe tener al menos 2 caracteres.'
			});
		}

		try {
			await db
				.update(usuarios)
				.set({ nombre: nombre.trim() })
				.where(eq(usuarios.id, locals.user.userId));

			// Generar nuevo JWT con el nombre actualizado
			const sessionToken = sign(
				{
					userId: locals.user.userId,
					email: locals.user.email,
					rol: locals.user.rol,
					nombre: nombre.trim()
				},
				env.JWT_SECRET,
				{ expiresIn: '7d' }
			);

			// Re-escribir la cookie con el nuevo token
			cookies.set('session', sessionToken, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: env.NODE_ENV === 'production',
				maxAge: 60 * 60 * 24 * 7 // 7 days
			});

			return { updateSuccess: true };
		} catch (error) {
			console.error('Error actualizando perfil:', error);
			return fail(500, { updateError: true, message: 'Fallo al actualizar el servidor.' });
		}
	},

	deleteAccount: async ({ request, locals, cookies }) => {
		if (!locals.user) throw redirect(303, '/auth/login');

		const data = await request.formData();
		const confirmEmail = data.get('confirmEmail');
		const userId = locals.user.userId;

		// Validation 1: Check matches confirmation email securely on backend
		if (confirmEmail !== locals.user.email) {
			return fail(400, { deleteError: true, message: 'El correo de confirmación no coincide.' });
		}

		try {
			// Borrado en cascada manual respetando orden de dependencias FK
			await db.delete(mediciones).where(eq(mediciones.userId, userId));
			await db.delete(ciclos).where(eq(ciclos.userId, userId));
			await db.delete(lugares).where(eq(lugares.userId, userId));
			await db.delete(consentimientos).where(eq(consentimientos.userId, userId));
			await db.delete(magicLinkTokens).where(eq(magicLinkTokens.userId, userId));
			await db.delete(apiKeys).where(eq(apiKeys.userId, userId));
			await db.delete(usuarios).where(eq(usuarios.id, userId));

			// Destroy the session cookie effectively logging them out
			cookies.set('session', '', {
				path: '/',
				expires: new Date(0)
			});
		} catch (error) {
			console.error('CRITICAL: Error during account deletion cascade:', error);
			return fail(500, {
				deleteError: true,
				message: 'Fallo crítico borrando datos del servidor. Intente más tarde.'
			});
		}

		// Throw redirect outside try/catch as per SvelteKit's spec
		throw redirect(303, '/auth/login');
	}
} satisfies Actions;
