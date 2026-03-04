import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { centroSchema, parseFormData } from '$lib/validations';
import type { Rol } from '$lib/server/auth';
import {
	canViewAll,
	getCentrosByUser,
	getCiclosCountByLugares,
	transformarCentrosConPermisos,
	createCentro,
	updateCentro,
	deleteCentro
} from '$lib/server/centros';

/** Cargar centros de cultivo según rol del usuario */
export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.userId;
	const userRol = locals.user?.rol as Rol;

	const centrosList = await getCentrosByUser(userId!, userRol);
	const lugarIds = centrosList.map((c) => c.id);
	const conteoCiclos = await getCiclosCountByLugares(lugarIds);

	const centros = transformarCentrosConPermisos(
		centrosList,
		conteoCiclos,
		userId!,
		userRol
	);

	return {
		centros,
		canViewAll: canViewAll(userRol)
	};
};

export const actions = {
	/** Crear un nuevo centro de cultivo */
	create: async ({ request, locals }) => {
		const userId = locals.user?.userId;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const formData = await request.formData();
		const validated = await parseFormData(centroSchema, formData);

		if (!validated.success) {
			return validated.response;
		}

		await createCentro(validated.data, userId);
		return { success: true, message: 'Centro creado exitosamente' };
	},

	/** Editar un centro existente */
	update: async ({ request, locals }) => {
		const userId = locals.user?.userId;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const formData = await request.formData();
		const centroId = Number(formData.get('centroId'));

		const validated = await parseFormData(centroSchema, formData);
		if (!validated.success) return validated.response;

		const result = await updateCentro(
			centroId,
			validated.data,
			userId,
			locals.user?.rol as Rol
		);

		if (!result.success) {
			return fail(result.status, { error: true, message: result.error });
		}

		return { success: true, message: 'Centro actualizado exitosamente' };
	},

	/** Eliminar un centro de cultivo propio */
	delete: async ({ request, locals }) => {
		const userId = locals.user?.userId;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const data = await request.formData();
		const centroId = Number(data.get('centroId'));

		const result = await deleteCentro(
			centroId,
			userId,
			locals.user?.rol as Rol
		);

		if (!result.success) {
			return fail(result.status, { error: true, message: result.error });
		}

		return { success: true, message: 'Centro eliminado exitosamente' };
	}
} satisfies Actions;