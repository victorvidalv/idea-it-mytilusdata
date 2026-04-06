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
import type { MutationResult } from '$lib/server/tipos-medicion';

// --- Helpers de autorización ---

/** Extrae el rol del usuario */
function getUserRol(locals: App.Locals): Rol {
	return locals.user?.rol as Rol;
}

/** Verifica permisos de gestión, retorna error 403 si no tiene */
function requireManagePermission(userRol: Rol): { error: ReturnType<typeof fail> } | null {
	if (!canManageTiposMedicion(userRol)) {
		return { error: fail(403, { error: true, message: 'No tiene permisos' }) };
	}
	return null;
}

// --- Helpers para respuestas ---

/** Maneja el resultado de una operación de mutación */
function handleMutationResult(result: MutationResult) {
	if (!result.success) {
		return fail(result.status ?? 500, { error: true, message: result.message });
	}
	return { success: true, message: result.message };
}

/** Maneja errores de validación de form */
function handleParseError(parsed: { success: boolean; error?: string }) {
	return fail(400, { error: true, message: parsed.error ?? 'Error de validación' });
}

// --- Page Load ---

/** Cargar tipos de medición, asegurando que existen los básicos si la tabla está vacía */
export const load: PageServerLoad = async ({ locals }) => {
	const userRol = getUserRol(locals);

	if (!canViewTiposMedicion(userRol)) {
		return { authorized: false, tipos: [] };
	}

	const tipos = await ensureTiposRegistroSeeded();

	return {
		authorized: true,
		tipos
	};
};

// --- Actions ---

export const actions = {
	/** Crear un nuevo tipo de medición */
	create: async ({ request, locals }) => {
		const userRol = getUserRol(locals);
		const authError = requireManagePermission(userRol);
		if (authError) return authError.error;

		const formData = await request.formData();
		const parsed = parseCreateFormData(formData);

		if (!parsed.success) {
			return handleParseError(parsed);
		}

		const result = await createTipoMedicion(parsed.data);
		return handleMutationResult(result);
	},

	/** Editar un tipo de medición existente */
	update: async ({ request, locals }) => {
		const userRol = getUserRol(locals);
		const authError = requireManagePermission(userRol);
		if (authError) return authError.error;

		const formData = await request.formData();
		const parsed = parseUpdateFormData(formData);

		if (!parsed.success) {
			return handleParseError(parsed);
		}

		const result = await updateTipoMedicion(parsed.id, parsed.data);
		return handleMutationResult(result);
	},

	/** Eliminar un tipo de medición */
	delete: async ({ request, locals }) => {
		const userRol = getUserRol(locals);
		const authError = requireManagePermission(userRol);
		if (authError) return authError.error;

		const formData = await request.formData();
		const parsed = parseDeleteFormData(formData);

		if (!parsed.success) {
			return handleParseError(parsed);
		}

		const result = await deleteTipoMedicion(parsed.id);
		return handleMutationResult(result);
	}
} satisfies Actions;