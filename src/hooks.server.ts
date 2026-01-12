import { authGuard } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const user = authGuard(event.cookies);

    // Inject user info into locals framework
    if (user) {
        event.locals.user = user;
    } else {
        event.locals.user = null;
    }

    // Redirigir si no está logeado y trata de acceder a rutas de la app (protegidas)
    if (event.url.pathname.startsWith('/dashboard') || event.url.pathname.startsWith('/centros') || event.url.pathname.startsWith('/ciclos')) {
        if (!event.locals.user) {
            throw redirect(303, '/auth/login');
        }
    }

    // Redirigir si ya está logeado y trata de ir al login
    if (event.url.pathname.startsWith('/auth/login')) {
        if (event.locals.user) {
            throw redirect(303, '/dashboard');
        }
    }

    return await resolve(event);
};
