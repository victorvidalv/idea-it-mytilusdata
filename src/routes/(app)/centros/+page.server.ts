import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { lugares, ciclos } from '$lib/server/db/schema';
import { eq, count, inArray } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';
import { centroSchema, parseFormData } from '$lib/validations';

/**
 * Transforma un lugar de la DB al formato esperado por el cliente.
 * Extrae latitud/longitud de la columna geom (PostGIS).
 * geom: { x: longitud, y: latitud }
 */
function transformarLugarParaCliente(lugar: typeof lugares.$inferSelect) {
	return {
		id: lugar.id,
		nombre: lugar.nombre,
		latitud: lugar.geom?.y ?? lugar.latitud ?? null,
		longitud: lugar.geom?.x ?? lugar.longitud ?? null,
		userId: lugar.userId,
		createdAt: lugar.createdAt ? new Date(lugar.createdAt).toISOString() : null
	};
}

/** Cargar centros de cultivo según rol del usuario */
export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.userId;
	const userRol = locals.user?.rol as Rol;
	const canViewAll = hasMinRole(userRol, ROLES.INVESTIGADOR);

	const centrosList = canViewAll
		? await db.select().from(lugares)
		: await db.select().from(lugares).where(eq(lugares.userId, userId!));

	// Resolver N+1: una sola query con GROUP BY para contar ciclos por lugar
	const lugarIds = centrosList.map((c) => c.id);
	const ciclosPorLugar =
		lugarIds.length > 0
			? await db
					.select({ lugarId: ciclos.lugarId, total: count() })
					.from(ciclos)
					.where(inArray(ciclos.lugarId, lugarIds))
					.groupBy(ciclos.lugarId)
			: [];

	// Crear mapa de conteo para acceso O(1)
	const conteoMap = new Map(ciclosPorLugar.map((c) => [c.lugarId, c.total]));

	const centrosConCiclos = centrosList.map((centro) => ({
		...transformarLugarParaCliente(centro),
		totalCiclos: conteoMap.get(centro.id) ?? 0,
		isOwner: centro.userId === userId
	}));

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

		const formData = await request.formData();
		const validated = await parseFormData(centroSchema, formData);
		
		if (!validated.success) {
			return validated.response;
		}

		const { nombre, latitud, longitud } = validated.data;

		// Crear punto PostGIS si hay coordenadas válidas
		// geom espera { x: longitud, y: latitud }
		const geom = (latitud != null && longitud != null)
			? { x: longitud, y: latitud }
			: null;

		await db.insert(lugares).values({
			nombre,
			geom,
			userId
		});

		return { success: true, message: 'Centro creado exitosamente' };
	},

	/** Editar un centro existente */
	update: async ({ request, locals }) => {
		const userId = locals.user?.userId;
		if (!userId) return fail(401, { error: true, message: 'No autenticado' });

		const formData = await request.formData();
		const centroId = Number(formData.get('centroId'));

		const validated = await parseFormData(centroSchema, formData);
		if (!validated.success) return validated.response;

		const { nombre, latitud, longitud } = validated.data;

		const [centro] = await db.select().from(lugares).where(eq(lugares.id, centroId)).limit(1);
		if (!centro) return fail(404, { error: true, message: 'Centro no encontrado' });

		const isAdmin = hasMinRole(locals.user?.rol as Rol, ROLES.ADMIN);
		if (centro.userId !== userId && !isAdmin) {
			return fail(403, { error: true, message: 'No tiene permisos para editar este centro' });
		}

		// Crear punto PostGIS si hay coordenadas válidas
		const geom = (latitud != null && longitud != null)
			? { x: longitud, y: latitud }
			: null;

		await db
			.update(lugares)
			.set({ nombre, geom })
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
