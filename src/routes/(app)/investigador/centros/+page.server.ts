import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { lugares, ciclos, usuarios } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const userRol = locals.user?.rol as Rol;
	if (!hasMinRole(userRol, ROLES.INVESTIGADOR)) {
		throw redirect(303, '/dashboard');
	}

	const centrosList = await db
		.select({
			id: lugares.id,
			nombre: lugares.nombre,
			geom: lugares.geom,
			latitud: lugares.latitud,
			longitud: lugares.longitud,
			createdAt: lugares.createdAt,
			userId: lugares.userId,
			usuarioNombre: usuarios.nombre
		})
		.from(lugares)
		.innerJoin(usuarios, eq(lugares.userId, usuarios.id));

	const centrosConCiclos = await Promise.all(
		centrosList.map(async (centro) => {
			const [result] = await db
				.select({ total: count() })
				.from(ciclos)
				.where(eq(ciclos.lugarId, centro.id))
				.limit(1);
			
			// Extraer coordenadas de geom (PostGIS) con fallback a columnas legacy
			// geom: { x: longitud, y: latitud }
			const latitud = centro.geom?.y ?? centro.latitud ?? null;
			const longitud = centro.geom?.x ?? centro.longitud ?? null;
			
			return {
				id: centro.id,
				nombre: centro.nombre,
				latitud,
				longitud,
				createdAt: centro.createdAt ? new Date(centro.createdAt).toISOString() : null,
				userId: centro.userId,
				usuarioNombre: centro.usuarioNombre,
				totalCiclos: result?.total ?? 0
			};
		})
	);

	// Get unique users for the filter
	const usuariosUnicosMap = new Map();
	for (const c of centrosConCiclos) {
		if (!usuariosUnicosMap.has(c.userId)) {
			usuariosUnicosMap.set(c.userId, { id: c.userId, nombre: c.usuarioNombre });
		}
	}
	const usuariosUnicos = Array.from(usuariosUnicosMap.values());

	return {
		centros: centrosConCiclos,
		usuarios: usuariosUnicos
	};
};
