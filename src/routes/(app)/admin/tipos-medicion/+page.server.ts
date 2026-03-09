import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import type { Rol } from '$lib/server/auth';
import {
	canViewTiposMedicion,
	canManageTiposMedicion,
	ensureTiposRegistroSeeded,
	createTipoMedicion,
	updateTipoMedicion,
	deleteTipoMedicion,
	parseCreateFormData,
	parseUpdateFormData,
	parseDeleteFormData
} from '$lib/server/tipos-medicion';

/** Cargar tipos de medición, asegurando que existen los básicos si la tabla está vacía */
export const load: PageServerLoad = async ({ locals }) => {
	const userRol = locals.user?.rol as Rol;

	if (!canViewTiposMedicion(userRol)) {
		return { authorized: false, tipos: [] };
	}

	const tipos = await ensureTiposRegistroSeeded();

	return {
		authorized: true,
		tipos
	};
};

export const actions = {
	/** Crear un nuevo tipo de medición */
	create: async ({ request, locals }) => {
		const userRol = locals.user?.rol as Rol;
		if (!canManageTiposMedicion(userRol)) {
			return fail(403, { error: true, message: 'No tiene permisos' });
		}

		const formData = await request.formData();
		const parsed = parseCreateFormData(formData);

		if (!parsed.success) {
			return fail(400, { error: true, message: parsed.error });
		}

		const result = await createTipoMedicion(parsed.data);

		if (!result.success) {
			return fail(result.status, { error: true, message: result.message });
		}

		return { success: true, message: result.message };
	},

	/** Editar un tipo de medición existente */
	update: async ({ request, locals }) => {
		const userRol = locals.user?.rol as Rol;
		if (!canManageTiposMedicion(userRol)) {
			return fail(403, { error: true, message: 'No tiene permisos' });
		}

		const formData = await request.formData();
		const parsed = parseUpdateFormData(formData);

		if (!parsed.success) {
			return fail(400, { error: true, message: parsed.error });
		}

		const result = await updateTipoMedicion(parsed.id, parsed.data);

		if (!result.success) {
			return fail(result.status, { error: true, message: result.message });
		}

		return { success: true, message: result.message };
	},

	/** Eliminar un tipo de medición */
	delete: async ({ request, locals }) => {
		const userRol = locals.user?.rol as Rol;
		if (!canManageTiposMedicion(userRol)) {
			return fail(403, { error: true, message: 'No tiene permisos' });
		}

		const formData = await request.formData();
		const parsed = parseDeleteFormData(formData);

		if (!parsed.success) {
			return fail(400, { error: true, message: parsed.error });
		}

		const result = await deleteTipoMedicion(parsed.id);

		if (!result.success) {
			return fail(result.status, { error: true, message: result.message });
		}

		return { success: true, message: result.message };
	}
} satisfies Actions;