import { fail } from '@sveltejs/kit';
import { createMagicLink } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';

export const actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const email = data.get('email');
		const nombre = data.get('nombre');
		const terms = data.get('terms');

		if (!email || typeof email !== 'string' || !email.includes('@')) {
			return fail(400, { email, missing: true, message: 'Correo electrónico inválido' });
		}

		try {
			// Validar si el usuario existe
			const [user] = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);

			if (user) {
				// Si existe, enviar el enlace mágico con su nombre registrado
				await createMagicLink(email, user.nombre, url.origin);
				return { success: true };
			} else {
				// Si no existe, revisar si se ha provisto el nombre (paso 2 de registro)
				if (!nombre) {
					return { requiresRegistration: true, email };
				}

				if (typeof nombre !== 'string' || nombre.length < 2) {
					return fail(400, {
						email,
						nombre,
						requiresRegistration: true,
						missing: true,
						message: 'Nombre es requerido'
					});
				}

				if (terms !== 'on' && terms !== 'true') {
					return fail(400, {
						email,
						nombre,
						requiresRegistration: true,
						missing: true,
						message: 'Debes aceptar las condiciones del servicio'
					});
				}

				// Crear usuario y enviar enlace mágico
				await createMagicLink(email, nombre, url.origin);
				return { success: true };
			}
		} catch (error) {
			console.error('Login action error:', error);
			return fail(500, {
				email,
				nombre,
				error: true,
				message: 'No se pudo procesar la solicitud. Inténtalo de nuevo.'
			});
		}
	}
} satisfies Actions;
