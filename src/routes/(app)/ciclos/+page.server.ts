import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { ciclos, lugares } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';

/** Cargar ciclos productivos según rol del usuario */
export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.userId;
	const userRol = locals.user?.rol as Rol;
	const canViewAll = hasMinRole(userRol, ROLES.INVESTIGADOR);

	// Obtener ciclos con datos del lugar asociado
	const allCiclos = canViewAll
		? await db.select().from(ciclos).all()
		: await db.select().from(ciclos).where(eq(ciclos.userId, userId!)).all();

	// Enriquecer ciclos con nombre del centro
	const ciclosConLugar = await Promise.all(
		allCiclos.map(async (ciclo) => {
			const lugar = await db.select().from(lugares).where(eq(lugares.id, ciclo.lugarId)).get();
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
		? await db.select().from(lugares).all()
		: await db.select().from(lugares).where(eq(lugares.userId, userId!)).all();

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

		const data = await request.formData();
		const nombre = data.get('nombre') as string;
		const lugarId = Number(data.get('lugarId'));
		const fechaSiembraStr = data.get('fechaSiembra') as string;

		// Validar campos
		if (!nombre || nombre.length < 2) {
			return fail(400, { error: true, message: 'El nombre debe tener al menos 2 caracteres' });
		}
		if (!lugarId || isNaN(lugarId)) {
			return fail(400, { error: true, message: 'Seleccione un centro de cultivo' });
		}
		if (!fechaSiembraStr) {
			return fail(400, { error: true, message: 'La fecha de siembra es obligatoria' });
		}

		// Verificar que el centro existe y pertenece al usuario
		const lugar = await db.select().from(lugares).where(eq(lugares.id, lugarId)).get();
		if (!lugar) return fail(404, { error: true, message: 'Centro de cultivo no encontrado' });

		const isAdmin = hasMinRole(locals.user?.rol as Rol, ROLES.ADMIN);
		if (lugar.userId !== userId && !isAdmin) {
			return fail(403, { error: true, message: 'No tiene permisos sobre este centro' });
		}

		const fechaSiembra = new Date(fechaSiembraStr);

		await db.insert(ciclos).values({
			nombre,
			fechaSiembra,
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

		const ciclo = await db.select().from(ciclos).where(eq(ciclos.id, cicloId)).get();
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

		const ciclo = await db.select().from(ciclos).where(eq(ciclos.id, cicloId)).get();
		if (!ciclo) return fail(404, { error: true, message: 'Ciclo no encontrado' });

		const isAdmin = hasMinRole(locals.user?.rol as Rol, ROLES.ADMIN);
		if (ciclo.userId !== userId && !isAdmin) {
			return fail(403, { error: true, message: 'No tiene permisos para eliminar este ciclo' });
		}

		await db.delete(ciclos).where(eq(ciclos.id, cicloId));
		return { success: true, message: 'Ciclo eliminado exitosamente' };
	}
} satisfies Actions;
