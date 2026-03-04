import { env } from '$env/dynamic/private';
import pkg from 'jsonwebtoken';
import { validateSession, invalidateSession } from './sessions';
import type { Rol } from './roles';

// Acceder correctamente a verify desde el paquete CJS
const { verify } = pkg;

/**
 * AuthGuard mejorado: Valida el JWT Y la sesión en base de datos.
 * Verifica:
 * 1. JWT válido
 * 2. Sesión existe en BD
 * 3. Sesión no está invalidada
 * 4. Usuario sigue activo
 * 5. Rol coincide con el actual en BD
 */
export async function authGuard(cookies: import('@sveltejs/kit').Cookies): Promise<{
	userId: number;
	email: string;
	rol: Rol;
	nombre: string;
	sessionId: number;
} | null> {
	const token = cookies.get('session');
	if (!token) return null;

	try {
		const decoded = verify(token, env.JWT_SECRET) as {
			sessionId: number;
			sessionTokenHash: string;
			userId: number;
			email: string;
			rol: Rol;
			nombre: string;
		};

		// Validar sesión en base de datos
		const sessionResult = await validateSession(decoded.sessionId, decoded.sessionTokenHash);

		if (!sessionResult) {
			// Sesión inválida: eliminar cookie
			cookies.delete('session', { path: '/' });
			return null;
		}

		const { user } = sessionResult;

		// Verificar que el rol en JWT coincide con rol actual en BD
		if (decoded.rol !== user.rol) {
			// Rol cambió: invalidar sesión y eliminar cookie
			await invalidateSession(decoded.sessionId);
			cookies.delete('session', { path: '/' });
			return null;
		}

		return {
			userId: user.id,
			email: user.email,
			rol: user.rol as Rol,
			nombre: user.nombre,
			sessionId: decoded.sessionId
		};
	} catch {
		cookies.delete('session', { path: '/' });
		return null;
	}
}