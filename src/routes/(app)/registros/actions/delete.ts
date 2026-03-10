import { fail, type RequestEvent } from '@sveltejs/kit';
import { type Rol } from '$lib/server/auth';
import { deleteRegistro } from '$lib/server/registros';
import { requireAuth, getUserRol } from '../auth-helpers';

/** Extrae el ID del formulario */
function extractId(formData: FormData): number | null {
	const id = formData.get('id');
	return id ? Number(id) : null;
}

/** Ejecuta la eliminación de un registro y maneja errores */
async function executeDelete(id: number, userId: number, userRol: Rol) {
	try {
		await deleteRegistro(id, userId, userRol);
		return { success: true, message: 'Registro eliminado' };
	} catch {
		return fail(500, { error: true, message: 'Error interno al eliminar' });
	}
}

export async function deleteAction(event: RequestEvent) {
	const auth = requireAuth(event.locals);
	if ('error' in auth) return auth.error;

	const userRol = getUserRol(event.locals);
	const data = await event.request.formData();
	const id = extractId(data);

	if (!id) return fail(400, { error: true, message: 'ID no proporcionado' });

	return executeDelete(id, auth.userId, userRol);
}