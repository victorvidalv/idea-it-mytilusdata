import { fail } from '@sveltejs/kit';
import { type Rol } from '$lib/server/auth';

/** Extrae y valida el userId del usuario autenticado */
export function getUserId(locals: App.Locals): number | null {
	return locals.user?.userId ?? null;
}

/** Extrae el rol del usuario autenticado */
export function getUserRol(locals: App.Locals): Rol {
	return locals.user?.rol as Rol;
}

/** Verifica si el usuario está autenticado */
export function requireAuth(
	locals: App.Locals
): { userId: number } | { error: ReturnType<typeof fail> } {
	const userId = getUserId(locals);
	if (!userId) {
		return { error: fail(401, { error: true, message: 'No autenticado' }) };
	}
	return { userId };
}