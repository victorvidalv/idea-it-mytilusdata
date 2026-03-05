import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { type Rol } from '$lib/server/auth';
import { cicloSchema, parseFormData } from '$lib/validations';
import {
	canViewAllCiclos,
	getCiclosByUser,
	getLugaresByUser,
	transformCiclosConLugar,
	createCiclo,
	toggleCicloActive,
	deleteCiclo
} from '$lib/server/ciclos';

/** Cargar ciclos productivos según rol del usuario */
export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.userId;
	const userRol = locals.user?.rol as Rol;
	const canViewAll = canViewAllCiclos(userRol);

	// Obtener ciclos y centros en paralelo
	const [allCiclos, centrosUsuario] = await Promise.all([
		getCiclosByUser(userId!, userRol),
		getLugaresByUser(userId!, userRol)
	]);

	// Enriquecer ciclos con nombre del centro y permisos
	const ciclosConLugar = await transformCiclosConLugar(allCiclos, userId!, userRol);

	return {
		ciclos: ciclosConLugar,
		centros: centrosUsuario,
		canViewAll
	};
};

export const actions = {
	/** Crear un nuevo ciclo productivo */
	create: async ({ request, locals }) => {
		const userId = locals.user?.userId;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const formData = await request.formData();
		const validated = await parseFormData(cicloSchema, formData);

		if (!validated.success) return validated.response;

		const result = await createCiclo(
			validated.data,
			userId,
			locals.user?.rol as Rol
		);

		if (!result.success) return fail(result.status, result);

		return { success: true, message: result.message };
	},

	/** Finalizar (desactivar) o reactivar un ciclo */
	toggleActive: async ({ request, locals }) => {
		const userId = locals.user?.userId;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const data = await request.formData();
		const cicloId = Number(data.get('cicloId'));
		const newActive = data.get('activo') === 'true';

		const result = await toggleCicloActive(
			cicloId,
			newActive,
			userId,
			locals.user?.rol as Rol
		);

		if (!result.success) return fail(result.status, result);

		return { success: true, message: result.message };
	},

	/** Eliminar un ciclo propio */
	delete: async ({ request, locals }) => {
		const userId = locals.user?.userId;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const data = await request.formData();
		const cicloId = Number(data.get('cicloId'));

		const result = await deleteCiclo(cicloId, userId, locals.user?.rol as Rol);

		if (!result.success) return fail(result.status, result);

		return { success: true, message: result.message };
	}
} satisfies Actions;