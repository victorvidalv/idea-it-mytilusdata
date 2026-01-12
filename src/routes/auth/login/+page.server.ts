import { fail } from '@sveltejs/kit';
import { createMagicLink } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions = {
    default: async ({ request, url }) => {
        const data = await request.formData();
        const email = data.get('email');
        const nombre = data.get('nombre');

        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return fail(400, { email, missing: true, message: 'Correo electrónico inválido' });
        }

        if (!nombre || typeof nombre !== 'string' || nombre.length < 2) {
            return fail(400, { nombre, missing: true, message: 'Nombre es requerido' });
        }

        try {
            await createMagicLink(email, nombre, url.origin);
            return { success: true };
        } catch (error) {
            console.error('Login action error:', error);
            return fail(500, { error: true, message: 'No se pudo procesar la solicitud. Inténtalo de nuevo.' });
        }
    }
} satisfies Actions;
