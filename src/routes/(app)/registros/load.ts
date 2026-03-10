import type { PageServerLoad } from './$types';
import { ROLES, type Rol } from '$lib/server/auth';
import {
	getCentrosByUser,
	getCiclosByUser,
	getTiposRegistro,
	getRegistrosWithPermisos,
	ensureOrigenesSeed
} from '$lib/server/registros';

/** Extrae y valida el userId del usuario autenticado */
function getUserId(locals: App.Locals): number | null {
	return locals.user?.userId ?? null;
}

/** Extrae el rol del usuario autenticado */
function getUserRol(locals: App.Locals): Rol {
	return locals.user?.rol as Rol;
}

export const load: PageServerLoad = async ({ locals }) => {
	const userRol = getUserRol(locals);
	const userId = getUserId(locals) as number;

	const [centros, ciclos, tipos, origenes, registros] = await Promise.all([
		getCentrosByUser(userId, userRol),
		getCiclosByUser(userId, userRol),
		getTiposRegistro(),
		ensureOrigenesSeed(),
		getRegistrosWithPermisos(userId, userRol)
	]);

	return { centros, ciclos, tipos, origenes, registros };
};