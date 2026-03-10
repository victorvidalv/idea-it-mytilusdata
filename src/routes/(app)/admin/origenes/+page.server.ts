import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import type { Rol } from '$lib/server/auth';
import {
	canManageOrigenes,
	getOrigenesWithSeed,
	createOrigen,
	updateOrigen,
	deleteOrigen,
	parseCreateForm,
	parseUpdateForm,
	parseDeleteForm
} from '$lib/server/origenes';

/** Cargar orígenes, asegurando que existen los básicos si la tabla está vacía */
export const load: PageServerLoad = async ({ locals }) => {
	const userRol = locals.user?.rol as Rol;

	if (!canManageOrigenes(userRol)) {
		return { authorized: false, origenes: [] };
	}

	const origenes = await getOrigenesWithSeed();

	return { authorized: true, origenes };
};

export const actions = {
	/** Crear un nuevo origen de datos */
	create: async ({ request, locals }) => {
		const userRol = locals.user?.rol as Rol;
		if (!canManageOrigenes(userRol)) {
			return fail(403, { error: true, message: 'No tiene permisos' });
		}

		const formData = await request.formData();
		const parsed = parseCreateForm(formData);

		if (!parsed.success) {
			return fail(400, { error: true, message: parsed.error });
		}

		const result = await createOrigen(parsed.data);

		if (!result.success) {
			return fail(result.status, { error: true, message: result.error });
		}

		return { success: true, message: result.message };
	},

	/** Editar un origen de datos existente */
	update: async ({ request, locals }) => {
		const userRol = locals.user?.rol as Rol;
		if (!canManageOrigenes(userRol)) {
			return fail(403, { error: true, message: 'No tiene permisos' });
		}

		const formData = await request.formData();
		const parsed = parseUpdateForm(formData);

		if (!parsed.success) {
			return fail(400, { error: true, message: parsed.error });
		}

		const result = await updateOrigen(parsed.id, parsed.data);

		if (!result.success) {
			return fail(result.status, { error: true, message: result.error });
		}

		return { success: true, message: result.message };
	},

	/** Eliminar un origen de datos */
	delete: async ({ request, locals }) => {
		const userRol = locals.user?.rol as Rol;
		if (!canManageOrigenes(userRol)) {
			return fail(403, { error: true, message: 'No tiene permisos' });
		}

		const formData = await request.formData();
		const parsed = parseDeleteForm(formData);

		if (!parsed.success) {
			return fail(400, { error: true, message: parsed.error });
		}

		const result = await deleteOrigen(parsed.id);

		if (!result.success) {
			return fail(result.status, { error: true, message: result.error });
		}

		return { success: true, message: result.message };
	}
} satisfies Actions;