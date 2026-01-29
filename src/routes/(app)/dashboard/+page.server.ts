import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { lugares, ciclos, mediciones } from '$lib/server/db/schema';
import { eq, count, and, gte } from 'drizzle-orm';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';

/** Cargar estadísticas del dashboard según el rol del usuario */
export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.userId;
	const userRol = locals.user?.rol as Rol;

	// Determinar si el usuario puede ver datos globales
	const canViewAll = hasMinRole(userRol, ROLES.INVESTIGADOR);

	// Inicio del mes actual para filtrar mediciones recientes
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

	// Consultar estadísticas según permisos
	const [centrosResult, ciclosResult, medicionesResult] = await Promise.all([
		// Contar centros
		canViewAll
			? db
					.select({ total: count() })
					.from(lugares)
					.limit(1)
					.then((res) => res[0])
			: db
					.select({ total: count() })
					.from(lugares)
					.where(eq(lugares.userId, userId!))
					.limit(1)
					.then((res) => res[0]),

		// Contar ciclos activos
		canViewAll
			? db
					.select({ total: count() })
					.from(ciclos)
					.where(eq(ciclos.activo, true))
					.limit(1)
					.then((res) => res[0])
			: db
					.select({ total: count() })
					.from(ciclos)
					.where(and(eq(ciclos.userId, userId!), eq(ciclos.activo, true)))
					.limit(1)
					.then((res) => res[0]),

		// Contar mediciones del mes
		canViewAll
			? db
					.select({ total: count() })
					.from(mediciones)
					.where(gte(mediciones.fechaMedicion, startOfMonth))
					.limit(1)
					.then((res) => res[0])
			: db
					.select({ total: count() })
					.from(mediciones)
					.where(and(eq(mediciones.userId, userId!), gte(mediciones.fechaMedicion, startOfMonth)))
					.limit(1)
					.then((res) => res[0])
	]);

	return {
		stats: {
			centros: centrosResult?.total ?? 0,
			ciclosActivos: ciclosResult?.total ?? 0,
			medicionesMes: medicionesResult?.total ?? 0
		},
		canViewAll
	};
};
