import { authGuard } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const user = authGuard(event.cookies);

    // Inyectar información del usuario en locals
    if (user) {
        event.locals.user = user;
    } else {
        event.locals.user = null;
    }

    // Redirigir si no está logeado y trata de acceder a rutas protegidas
    if (event.url.pathname.startsWith('/dashboard') || event.url.pathname.startsWith('/centros') || event.url.pathname.startsWith('/ciclos') || event.url.pathname.startsWith('/admin')) {
        if (!event.locals.user) {
            throw redirect(303, '/auth/login');
        }
    }

    // Proteger rutas de administración: solo rol ADMIN
    if (event.url.pathname.startsWith('/admin')) {
        if (event.locals.user && event.locals.user.rol !== 'ADMIN') {
            throw redirect(303, '/dashboard');
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
