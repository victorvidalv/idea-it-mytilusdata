import { authGuard } from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// AuthGuard ahora es async y valida sesión en BD
	const user = await authGuard(event.cookies);

	// Inyectar información del usuario en locals
	if (user) {
		event.locals.user = user;
	} else {
		event.locals.user = null;
	}

	// Redirigir si no está logeado y trata de acceder a rutas protegidas
	if (
		event.url.pathname.startsWith('/dashboard') ||
		event.url.pathname.startsWith('/centros') ||
		event.url.pathname.startsWith('/ciclos') ||
		event.url.pathname.startsWith('/registros') ||
		event.url.pathname.startsWith('/graficos') ||
		event.url.pathname.startsWith('/admin') ||
		event.url.pathname.startsWith('/investigador') ||
		event.url.pathname.startsWith('/perfil')
	) {
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

	// Proteger rutas de investigador: solo rol INVESTIGADOR (o ADMIN)
	if (event.url.pathname.startsWith('/investigador')) {
		if (
			event.locals.user &&
			event.locals.user.rol !== 'INVESTIGADOR' &&
			event.locals.user.rol !== 'ADMIN'
		) {
			throw redirect(303, '/dashboard');
		}
	}

	// Redirigir si ya está logeado y trata de ir al login
	if (event.url.pathname.startsWith('/auth/login')) {
		if (event.locals.user) {
			throw redirect(303, '/dashboard');
		}
	}

	// Agregar headers de seguridad para respuestas de API
	const response = await resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace(
				'<head>',
				`<head>
				<meta http-equiv="X-Content-Type-Options" content="nosniff">
				<meta http-equiv="X-Frame-Options" content="DENY">
				<meta http-equiv="X-XSS-Protection" content="1; mode=block">
				<meta name="referrer" content="strict-origin-when-cross-origin">
			`
			)
	});

	// Agregar headers de seguridad adicionales para rutas de API
	if (event.url.pathname.startsWith('/api/')) {
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('X-Frame-Options', 'DENY');
		response.headers.set('X-XSS-Protection', '1; mode=block');
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		// Cache-Control para evitar caching de datos sensibles
		response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
		response.headers.set('Pragma', 'no-cache');
		response.headers.set('Expires', '0');
	}

	return response;
};
