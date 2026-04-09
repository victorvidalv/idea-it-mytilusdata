import { fail } from '@sveltejs/kit';
import { type Rol } from '$lib/server/auth';
import { canManageOrigenes } from '$lib/server/origenes';

/** Extrae el rol del usuario autenticado */
export function getUserRol(locals: App.Locals): Rol {
	return locals.user?.rol as Rol;
}

/** Verifica permisos de gestión, retorna error 403 si no tiene */
export function requireManagePermission(userRol: Rol): { error: ReturnType<typeof fail> } | null {
	if (!canManageOrigenes(userRol)) {
		return { error: fail(403, { error: true, message: 'No tiene permisos' }) };
	}
	return null;
}