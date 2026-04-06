import { fail, type RequestEvent } from '@sveltejs/kit';
import { type Rol } from '$lib/server/auth';
import { registroSchema, parseFormData, type RegistroInput } from '$lib/validations';
import { updateRegistro, type MedicionUpdateData } from '$lib/server/registros';
import { requireAuth, getUserRol } from '../auth-helpers';

/** Extrae el ID del formulario */
function extractId(formData: FormData): number | null {
	const id = formData.get('id');
	return id ? Number(id) : null;
}

/** Construye el objeto de datos para actualización */
function buildUpdateData(validated: RegistroInput, formData: FormData): MedicionUpdateData {
	const { valor, fechaMedicion, tipoId, origenId, cicloId } = validated;
	const lugarId = Number(formData.get('lugarId'));

	return {
		valor,
		fechaMedicion: new Date(fechaMedicion),
		lugarId,
		cicloId: cicloId ?? null,
		tipoId,
		origenId,
		notas: formData.get('notas') as string
	};
}

/** Ejecuta la actualización de un registro y maneja errores */
async function executeUpdate(
	id: number,
	updateData: MedicionUpdateData,
	userId: number,
	userRol: Rol
) {
	try {
		await updateRegistro(id, updateData, userId, userRol);
		return { success: true, message: 'Registro actualizado exitosamente' };
	} catch {
		return fail(500, { error: true, message: 'Error interno al actualizar' });
	}
}

export async function updateAction(event: RequestEvent) {
	const auth = requireAuth(event.locals);
	if ('error' in auth) return auth.error;

	const userRol = getUserRol(event.locals);
	const formData = await event.request.formData();
	const id = extractId(formData);

	if (!id) return fail(400, { error: true, message: 'ID no proporcionado' });

	const validated = await parseFormData(registroSchema, formData);
	if (!validated.success) return validated.response;

	const updateData = buildUpdateData(validated.data, formData);
	return executeUpdate(id, updateData, auth.userId, userRol);
}