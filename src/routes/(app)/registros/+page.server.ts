import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { ROLES, type Rol } from '$lib/server/auth';
import { registroSchema, parseFormData } from '$lib/validations';
import {
	getCentrosByUser,
	getCiclosByUser,
	getTiposRegistro,
	getRegistrosWithPermisos,
	ensureOrigenesSeed,
	createRegistro,
	updateRegistro,
	deleteRegistro,
	type MedicionUpdateData
} from '$lib/server/registros';

export const load: PageServerLoad = async ({ locals }) => {
	const userRol = locals.user?.rol as Rol;
	const userId = locals.user?.userId as number;

	const [centros, ciclos, tipos, origenes, registros] = await Promise.all([
		getCentrosByUser(userId, userRol),
		getCiclosByUser(userId, userRol),
		getTiposRegistro(),
		ensureOrigenesSeed(),
		getRegistrosWithPermisos(userId, userRol)
	]);

	return { centros, ciclos, tipos, origenes, registros };
};

export const actions = {
	create: async ({ request, locals }) => {
		const userId = locals.user?.userId as number;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const data = await request.formData();
		const lugarId = Number(data.get('lugarId'));
		const cicloId = data.get('cicloId') ? Number(data.get('cicloId')) : null;
		const tipoId = Number(data.get('tipoId'));
		const origenId = Number(data.get('origenId'));
		const valor = Number(data.get('valor'));
		const fechaString = data.get('fechaMedicion') as string;
		const notas = data.get('notas') as string;

		if (!lugarId || !tipoId || !origenId || isNaN(valor) || !fechaString) {
			return fail(400, { error: true, message: 'Faltan campos requeridos o valor no válido' });
		}

		try {
			await createRegistro(
				{
					lugarId,
					cicloId,
					tipoId,
					origenId,
					valor,
					fechaMedicion: fechaString,
					notas
				},
				userId
			);
			return { success: true, message: 'Registro guardado exitosamente' };
		} catch {
			return fail(500, { error: true, message: 'Error interno guardando la medición' });
		}
	},

	update: async ({ request, locals }) => {
		const userId = locals.user?.userId as number;
		const userRol = locals.user?.rol as Rol;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const formData = await request.formData();
		const id = Number(formData.get('id'));
		const notas = formData.get('notas') as string;

		if (!id) return fail(400, { error: true, message: 'ID no proporcionado' });

		const validated = await parseFormData(registroSchema, formData);
		if (!validated.success) return validated.response;

		const { valor, fechaMedicion, tipoId, origenId, cicloId } = validated.data;
		const lugarId = Number(formData.get('lugarId'));

		try {
			const updateData: MedicionUpdateData = {
				valor,
				fechaMedicion: new Date(fechaMedicion),
				lugarId,
				cicloId: cicloId ?? null,
				tipoId,
				origenId,
				notas
			};

			await updateRegistro(id, updateData, userId, userRol);
			return { success: true, message: 'Registro actualizado exitosamente' };
		} catch {
			return fail(500, { error: true, message: 'Error interno al actualizar' });
		}
	},

	delete: async ({ request, locals }) => {
		const userId = locals.user?.userId as number;
		const userRol = locals.user?.rol as Rol;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const data = await request.formData();
		const id = Number(data.get('id'));

		if (!id) return fail(400, { error: true, message: 'ID no proporcionado' });

		try {
			await deleteRegistro(id, userId, userRol);
			return { success: true, message: 'Registro eliminado' };
		} catch {
			return fail(500, { error: true, message: 'Error interno al eliminar' });
		}
	}
} satisfies Actions;