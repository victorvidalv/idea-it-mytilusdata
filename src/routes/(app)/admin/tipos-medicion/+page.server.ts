import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import type { Rol } from '$lib/server/auth';
import {
	canViewTiposMedicion,
	canManageTiposMedicion,
	ensureTiposRegistroSeeded,
	createTipoMedicion,
	updateTipoMedicion,
	deleteTipoMedicion
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

		const data = await request.formData();
		const codigo = data.get('codigo') as string;
		const unidadBase = data.get('unidadBase') as string;

		if (!codigo || !unidadBase) {
			return fail(400, { error: true, message: 'Código y unidad son requeridos' });
		}

		const result = await createTipoMedicion({ codigo, unidadBase });

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

		const data = await request.formData();
		const id = Number(data.get('id'));
		const codigo = data.get('codigo') as string;
		const unidadBase = data.get('unidadBase') as string;

		if (!id || !codigo || !unidadBase) {
			return fail(400, { error: true, message: 'Todos los campos son requeridos' });
		}

		const result = await updateTipoMedicion(id, { codigo, unidadBase });

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

		const data = await request.formData();
		const id = Number(data.get('id'));

		if (!id) {
			return fail(400, { error: true, message: 'ID no proporcionado' });
		}

		const result = await deleteTipoMedicion(id);

		if (!result.success) {
			return fail(result.status, { error: true, message: result.message });
		}

		return { success: true, message: result.message };
	}
} satisfies Actions;