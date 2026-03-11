import { fail, type RequestEvent } from '@sveltejs/kit';
import {
	createOrigen,
	parseCreateForm,
	type MutationResult
} from '$lib/server/origenes';
import { getUserRol, requireManagePermission } from '../auth-helpers';

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

export async function createAction(event: RequestEvent) {
	const userRol = getUserRol(event.locals);
	const authError = requireManagePermission(userRol);
	if (authError) return authError.error;

	const formData = await event.request.formData();
	const parsed = parseCreateForm(formData);

	if (!parsed.success) {
		return handleParseError(parsed);
	}

	const result = await createOrigen(parsed.data);
	return handleMutationResult(result);
}