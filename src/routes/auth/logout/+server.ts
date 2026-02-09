import { redirect } from '@sveltejs/kit';
import { logLogout } from '$lib/server/audit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, locals, request, getClientAddress }) => {
	// Obtener información del usuario antes de cerrar sesión
	const user = locals.user;
	const clientIp = getClientAddress();
	const userAgent = request.headers.get('user-agent') ?? undefined;

	// Registrar logout en auditoría antes de borrar la sesión
	if (user) {
		await logLogout({
			userId: user.userId,
			ip: clientIp,
			userAgent
		});
	}

	// Borrar la cookie de sesión
	cookies.delete('session', { path: '/' });
	throw redirect(303, '/auth/login');
};
