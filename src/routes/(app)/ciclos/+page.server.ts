import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { ciclos, lugares } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';
import { cicloSchema, parseFormData } from '$lib/validations';

/** Cargar ciclos productivos según rol del usuario */
export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.userId;
	const userRol = locals.user?.rol as Rol;
	const canViewAll = hasMinRole(userRol, ROLES.INVESTIGADOR);

	// Obtener ciclos con datos del lugar asociado
	const allCiclos = canViewAll
		? await db.select().from(ciclos)
		: await db.select().from(ciclos).where(eq(ciclos.userId, userId!));

	// Enriquecer ciclos con nombre del centro
	const ciclosConLugar = await Promise.all(
		allCiclos.map(async (ciclo) => {
			const [lugar] = await db.select().from(lugares).where(eq(lugares.id, ciclo.lugarId)).limit(1);
			return {
				...ciclo,
				lugarNombre: lugar?.nombre ?? 'Desconocido',
				isOwner: ciclo.userId === userId,
				// Serializar fechas para el cliente
				fechaSiembra: ciclo.fechaSiembra ? new Date(ciclo.fechaSiembra).toISOString() : null,
				fechaFinalizacion: ciclo.fechaFinalizacion
					? new Date(ciclo.fechaFinalizacion).toISOString()
					: null
			};
		})
	);

	// Obtener centros del usuario (para el selector al crear ciclo)
	const centrosUsuario = canViewAll
		? await db.select().from(lugares)
		: await db.select().from(lugares).where(eq(lugares.userId, userId!));

	return {
		ciclos: ciclosConLugar,
		centros: centrosUsuario,
		canViewAll
	};
};

export const actions = {
	/** Crear un nuevo ciclo productivo */
	create: async ({ request, locals }) => {
		const userId = locals.user?.userId;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const formData = await request.formData();
		const validated = await parseFormData(cicloSchema, formData);

		if (!validated.success) return validated.response;

		const { nombre, lugarId, fechaSiembra } = validated.data;

		// Verificar que el centro existe y pertenece al usuario
		const [lugar] = await db.select().from(lugares).where(eq(lugares.id, lugarId)).limit(1);
		if (!lugar) return fail(404, { error: true, message: 'Centro de cultivo no encontrado' });

		const isAdmin = hasMinRole(locals.user?.rol as Rol, ROLES.ADMIN);
		if (lugar.userId !== userId && !isAdmin) {
			return fail(403, { error: true, message: 'No tiene permisos sobre este centro' });
		}

		await db.insert(ciclos).values({
			nombre,
			fechaSiembra: new Date(fechaSiembra),
			lugarId,
			userId,
			activo: true
		});

		return { success: true, message: 'Ciclo productivo creado exitosamente' };
	},

	/** Finalizar (desactivar) o reactivar un ciclo */
	toggleActive: async ({ request, locals }) => {
		const userId = locals.user?.userId;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const data = await request.formData();
		const cicloId = Number(data.get('cicloId'));
		const newActive = data.get('activo') === 'true';

		const [ciclo] = await db.select().from(ciclos).where(eq(ciclos.id, cicloId)).limit(1);
		if (!ciclo) return fail(404, { error: true, message: 'Ciclo no encontrado' });

		const isAdmin = hasMinRole(locals.user?.rol as Rol, ROLES.ADMIN);
		if (ciclo.userId !== userId && !isAdmin) {
			return fail(403, { error: true, message: 'No tiene permisos sobre este ciclo' });
		}

		const updateData: { activo: boolean; fechaFinalizacion?: Date | null } = { activo: newActive };
		// Registrar fecha de finalización al desactivar
		if (!newActive) {
			updateData.fechaFinalizacion = new Date();
		} else {
			updateData.fechaFinalizacion = null;
		}

		await db.update(ciclos).set(updateData).where(eq(ciclos.id, cicloId));
		return { success: true, message: newActive ? 'Ciclo reactivado' : 'Ciclo finalizado' };
	},

	/** Eliminar un ciclo propio */
	delete: async ({ request, locals }) => {
		const userId = locals.user?.userId;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const data = await request.formData();
		const cicloId = Number(data.get('cicloId'));

		const [ciclo] = await db.select().from(ciclos).where(eq(ciclos.id, cicloId)).limit(1);
		if (!ciclo) return fail(404, { error: true, message: 'Ciclo no encontrado' });

		const isAdmin = hasMinRole(locals.user?.rol as Rol, ROLES.ADMIN);
		if (ciclo.userId !== userId && !isAdmin) {
			return fail(403, { error: true, message: 'No tiene permisos para eliminar este ciclo' });
		}

		await db.delete(ciclos).where(eq(ciclos.id, cicloId));
		return { success: true, message: 'Ciclo eliminado exitosamente' };
	}
} satisfies Actions;
