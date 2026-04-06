import { fail, type RequestEvent } from '@sveltejs/kit';
import { registroCreateSchema, parseFormData, type RegistroCreateInput } from '$lib/validations';
import { createRegistro } from '$lib/server/registros';
import { requireAuth } from '../auth-helpers';

/** Ejecuta la creación de un registro y maneja errores */
async function executeCreate(data: RegistroCreateInput, userId: number) {
	try {
		await createRegistro(data, userId);
		return { success: true, message: 'Registro guardado exitosamente' };
	} catch {
		return fail(500, { error: true, message: 'Error interno guardando la medición' });
	}
}

export async function createAction(event: RequestEvent) {
	const auth = requireAuth(event.locals);
	if ('error' in auth) return auth.error;

	const formData = await event.request.formData();
	const validated = await parseFormData(registroCreateSchema, formData);

	if (!validated.success) return validated.response;

	return executeCreate(validated.data, auth.userId);
}