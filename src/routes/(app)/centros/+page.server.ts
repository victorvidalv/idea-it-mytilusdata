import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { lugares, ciclos } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';

/** Cargar centros de cultivo según rol del usuario */
export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.userId;
	const userRol = locals.user?.rol as Rol;
	const canViewAll = hasMinRole(userRol, ROLES.INVESTIGADOR);

	const centrosList = canViewAll
		? await db.select().from(lugares)
		: await db.select().from(lugares).where(eq(lugares.userId, userId!));

	const centrosConCiclos = await Promise.all(
		centrosList.map(async (centro) => {
			const [result] = await db
				.select({ total: count() })
				.from(ciclos)
				.where(eq(ciclos.lugarId, centro.id))
				.limit(1);
			return {
				...centro,
				totalCiclos: result?.total ?? 0,
				isOwner: centro.userId === userId,
				createdAt: centro.createdAt ? new Date(centro.createdAt).toISOString() : null
			};
		})
	);

	return {
		centros: centrosConCiclos,
		canViewAll
	};
};

export const actions = {
	/** Crear un nuevo centro de cultivo */
	create: async ({ request, locals }) => {
		const userId = locals.user?.userId;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const data = await request.formData();
		const nombre = data.get('nombre') as string;
		const latitud = parseFloat(data.get('latitud') as string);
		const longitud = parseFloat(data.get('longitud') as string);

		if (!nombre || nombre.length < 2) {
			return fail(400, { error: true, message: 'El nombre debe tener al menos 2 caracteres' });
		}
		// Permitir coordenadas NaN — se guardan como null
		const latVal = isNaN(latitud) ? null : latitud;
		const lngVal = isNaN(longitud) ? null : longitud;

		await db.insert(lugares).values({
			nombre,
			latitud: latVal,
			longitud: lngVal,
			userId
		});

		return { success: true, message: 'Centro creado exitosamente' };
	},

	/** Editar un centro existente */
	update: async ({ request, locals }) => {
		const userId = locals.user?.userId;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const data = await request.formData();
		const centroId = Number(data.get('centroId'));
		const nombre = data.get('nombre') as string;
		const latitud = parseFloat(data.get('latitud') as string);
		const longitud = parseFloat(data.get('longitud') as string);

		const [centro] = await db.select().from(lugares).where(eq(lugares.id, centroId)).limit(1);
		if (!centro) return fail(404, { error: true, message: 'Centro no encontrado' });

		const isAdmin = hasMinRole(locals.user?.rol as Rol, ROLES.ADMIN);
		if (centro.userId !== userId && !isAdmin) {
			return fail(403, { error: true, message: 'No tiene permisos para editar este centro' });
		}

		if (!nombre || nombre.length < 2) {
			return fail(400, { error: true, message: 'El nombre debe tener al menos 2 caracteres' });
		}

		const latVal = isNaN(latitud) ? null : latitud;
		const lngVal = isNaN(longitud) ? null : longitud;

		await db
			.update(lugares)
			.set({ nombre, latitud: latVal, longitud: lngVal })
			.where(eq(lugares.id, centroId));
		return { success: true, message: 'Centro actualizado exitosamente' };
	},

	/** Eliminar un centro de cultivo propio */
	delete: async ({ request, locals }) => {
		const userId = locals.user?.userId;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const data = await request.formData();
		const centroId = Number(data.get('centroId'));

		const [centro] = await db.select().from(lugares).where(eq(lugares.id, centroId)).limit(1);
		if (!centro) return fail(404, { error: true, message: 'Centro no encontrado' });

		const isAdmin = hasMinRole(locals.user?.rol as Rol, ROLES.ADMIN);
		if (centro.userId !== userId && !isAdmin) {
			return fail(403, { error: true, message: 'No tiene permisos para eliminar este centro' });
		}

		const [ciclosCount] = await db
			.select({ total: count() })
			.from(ciclos)
			.where(eq(ciclos.lugarId, centroId))
			.limit(1);

		if (ciclosCount && ciclosCount.total > 0) {
			return fail(400, {
				error: true,
				message: 'No se puede eliminar un centro con ciclos asociados'
			});
		}

		await db.delete(lugares).where(eq(lugares.id, centroId));
		return { success: true, message: 'Centro eliminado exitosamente' };
	}
} satisfies Actions;
