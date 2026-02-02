import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { lugares, ciclos, mediciones, usuarios } from '$lib/server/db/schema';
import { count, eq, gte } from 'drizzle-orm';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const userRol = locals.user?.rol as Rol;

	if (!hasMinRole(userRol, ROLES.INVESTIGADOR)) {
		throw redirect(303, '/dashboard');
	}

	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	const [centrosResult, ciclosResult, medicionesResult, usuariosResult] = await Promise.all([
		db
			.select({ total: count() })
			.from(lugares)
			.limit(1)
			.then((res) => res[0]),
		db
			.select({ total: count() })
			.from(ciclos)
			.where(eq(ciclos.activo, true))
			.limit(1)
			.then((res) => res[0]),
		db
			.select({ total: count() })
			.from(mediciones)
			.where(gte(mediciones.fechaMedicion, startOfMonth))
			.limit(1)
			.then((res) => res[0]),
		db
			.select({ total: count() })
			.from(usuarios)
			.limit(1)
			.then((res) => res[0])
	]);

	return {
		stats: {
			centros: centrosResult?.total ?? 0,
			ciclosActivos: ciclosResult?.total ?? 0,
			medicionesMes: medicionesResult?.total ?? 0,
			usuariosTotales: usuariosResult?.total ?? 0
		}
	};
};
