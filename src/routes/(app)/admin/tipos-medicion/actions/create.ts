import { fail, type RequestEvent } from '@sveltejs/kit';
import {
	createTipoMedicion,
	parseCreateFormData,
	type MutationResult
} from '$lib/server/tipos-medicion';
import { getUserRol, requireManagePermission } from '../auth-helpers';

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

export async function createAction(event: RequestEvent) {
	const userRol = getUserRol(event.locals);
	const authError = requireManagePermission(userRol);
	if (authError) return authError.error;

	const formData = await event.request.formData();
	const parsed = parseCreateFormData(formData);

	if (!parsed.success) {
		return handleParseError(parsed);
	}

	const result = await createTipoMedicion(parsed.data);
	return handleMutationResult(result);
}