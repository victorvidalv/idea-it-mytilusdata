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
	parseDeleteForm,
	type MutationResult
} from '$lib/server/origenes';

// --- Helpers de autorización ---

/** Extrae el rol del usuario */
function getUserRol(locals: App.Locals): Rol {
	return locals.user?.rol as Rol;
}

/** Verifica permisos de gestión, retorna error 403 si no tiene */
function requireManagePermission(userRol: Rol): { error: ReturnType<typeof fail> } | null {
	if (!canManageOrigenes(userRol)) {
		return { error: fail(403, { error: true, message: 'No tiene permisos' }) };
	}
	return null;
}

// --- Helpers para respuestas ---

/** Maneja el resultado de una operación de mutación */
function handleMutationResult(result: MutationResult) {
	if (!result.success) {
		return fail(result.status, { error: true, message: result.error });
	}
	return { success: true, message: result.message };
}

/** Maneja errores de validación de form */
function handleParseError(parsed: { success: boolean; error?: string }) {
	return fail(400, { error: true, message: parsed.error ?? 'Error de validación' });
}

// --- Page Load ---

/** Cargar orígenes, asegurando que existen los básicos si la tabla está vacía */
export const load: PageServerLoad = async ({ locals }) => {
	const userRol = getUserRol(locals);

	if (!canManageOrigenes(userRol)) {
		return { authorized: false, origenes: [] };
	}

	const origenes = await getOrigenesWithSeed();

	return { authorized: true, origenes };
};

// --- Actions ---

export const actions = {
	/** Crear un nuevo origen de datos */
	create: async ({ request, locals }) => {
		const userRol = getUserRol(locals);
		const authError = requireManagePermission(userRol);
		if (authError) return authError.error;

		const formData = await request.formData();
		const parsed = parseCreateForm(formData);

		if (!parsed.success) {
			return handleParseError(parsed);
		}

		const result = await createOrigen(parsed.data);
		return handleMutationResult(result);
	},

	/** Editar un origen de datos existente */
	update: async ({ request, locals }) => {
		const userRol = getUserRol(locals);
		const authError = requireManagePermission(userRol);
		if (authError) return authError.error;

		const formData = await request.formData();
		const parsed = parseUpdateForm(formData);

		if (!parsed.success) {
			return handleParseError(parsed);
		}

		const result = await updateOrigen(parsed.id, parsed.data);
		return handleMutationResult(result);
	},

	/** Eliminar un origen de datos */
	delete: async ({ request, locals }) => {
		const userRol = getUserRol(locals);
		const authError = requireManagePermission(userRol);
		if (authError) return authError.error;

		const formData = await request.formData();
		const parsed = parseDeleteForm(formData);

		if (!parsed.success) {
			return handleParseError(parsed);
		}

		const result = await deleteOrigen(parsed.id);
		return handleMutationResult(result);
	}
} satisfies Actions;