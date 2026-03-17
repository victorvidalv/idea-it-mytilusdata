import { authGuard } from '$lib/server/auth';
import { redirect, json, type Handle } from '@sveltejs/kit';
import {
	isProtectedRoute,
	isLoginRoute,
	isApiRoute,
	authenticateApiRequest,
	checkRoleAuthorization,
	applyApiSecurityHeaders,
	transformPageWithSecurityMeta
} from '$lib/server/hooks';

export const handle: Handle = async ({ event, resolve }) => {
	// AuthGuard ahora es async y valida sesión en BD
	const user = await authGuard(event.cookies);

	// Inyectar información del usuario en locals
	event.locals.user = user;

	// Protección de rutas /api/ - requiere autenticación (sesión O API Key)
	if (isApiRoute(event.url.pathname)) {
		const isAuthenticated = await authenticateApiRequest(event);
		if (!isAuthenticated) {
			return json({ error: 'Se requiere autenticación' }, { status: 401 });
		}
	}

	// Redirigir si no está logeado y trata de acceder a rutas protegidas
	if (isProtectedRoute(event.url.pathname) && !event.locals.user) {
		throw redirect(303, '/auth/login');
	}

	// Verificar autorización por rol
	checkRoleAuthorization(event.url.pathname, event.locals.user);

	// Redirigir si ya está logeado y trata de ir al login
	if (isLoginRoute(event.url.pathname) && event.locals.user) {
		throw redirect(303, '/dashboard');
	}

	// Resolver la petición con headers de seguridad en el HTML
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => transformPageWithSecurityMeta(html)
	});

	// Agregar headers de seguridad adicionales para rutas de API
	if (isApiRoute(event.url.pathname)) {
		applyApiSecurityHeaders(response);
	}

	return response;
};