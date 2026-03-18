import { fail, redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { type Rol } from '$lib/server/auth';
import { canManageBiblioteca } from '$lib/server/biblioteca';

/** Extrae el rol del usuario autenticado */
export function getUserRol(locals: App.Locals): Rol {
	return locals.user?.rol as Rol;
}

/**
 * Verifica que el usuario tenga permisos de administrador.
 * Lanza redirect si no está autenticado, o retorna fail si no es admin.
 */
export function requireAdmin(event: RequestEvent) {
	const { locals, url } = event;
	const userRol = getUserRol(locals);

	// Si no hay usuario, redirigir a login
	if (!userRol) {
		throw redirect(302, `/auth/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	}

	// Si no es admin, denegar acceso
	if (!canManageBiblioteca(userRol)) {
		return fail(403, { error: 'No tienes permisos para acceder a esta página' });
	}

	return null;
}