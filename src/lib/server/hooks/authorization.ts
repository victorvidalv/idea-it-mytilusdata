import { redirect } from '@sveltejs/kit';
import { requiresAdminAccess, requiresInvestigadorAccess } from './routes';

/** Verifica autorización por rol y lanza redirect si no tiene acceso */
export function checkRoleAuthorization(pathname: string, user: { rol: string } | null): void {
	if (requiresAdminAccess(pathname) && user && user.rol !== 'ADMIN') {
		throw redirect(303, '/dashboard');
	}

	if (requiresInvestigadorAccess(pathname)) {
		if (user && user.rol !== 'INVESTIGADOR' && user.rol !== 'ADMIN') {
			throw redirect(303, '/dashboard');
		}
	}
}