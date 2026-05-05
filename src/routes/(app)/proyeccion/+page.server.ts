import type { PageServerLoad } from './$types';
import { getLugaresByUser, getCiclosByUser } from '$lib/server/ciclos';
import { type Rol } from '$lib/server/auth';

/** Cargar lugares y ciclos para el formulario de proyección */
export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.userId;
	const userRol = locals.user?.rol as Rol;

	if (!userId) {
		return {
			lugares: [],
			ciclos: []
		};
	}

	// Obtener lugares y ciclos en paralelo
	const [lugares, ciclos] = await Promise.all([
		getLugaresByUser(userId, userRol),
		getCiclosByUser(userId, userRol)
	]);

	return {
		lugares,
		ciclos
	};
};
