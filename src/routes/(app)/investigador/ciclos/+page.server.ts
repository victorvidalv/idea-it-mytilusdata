import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { ciclos, lugares, usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const userRol = locals.user?.rol as Rol;
	if (!hasMinRole(userRol, ROLES.INVESTIGADOR)) {
		throw redirect(303, '/dashboard');
	}

	const allCiclos = await db
		.select({
			id: ciclos.id,
			nombre: ciclos.nombre,
			fechaSiembra: ciclos.fechaSiembra,
			fechaFinalizacion: ciclos.fechaFinalizacion,
			activo: ciclos.activo,
			lugarId: ciclos.lugarId,
			userId: ciclos.userId,
			usuarioNombre: usuarios.nombre
		})
		.from(ciclos)
		.innerJoin(usuarios, eq(ciclos.userId, usuarios.id));

	const ciclosConLugar = await Promise.all(
		allCiclos.map(async (ciclo) => {
			const [lugar] = await db.select().from(lugares).where(eq(lugares.id, ciclo.lugarId)).limit(1);
			return {
				...ciclo,
				lugarNombre: lugar?.nombre ?? 'Desconocido',
				fechaSiembra: ciclo.fechaSiembra ? new Date(ciclo.fechaSiembra).toISOString() : null,
				fechaFinalizacion: ciclo.fechaFinalizacion
					? new Date(ciclo.fechaFinalizacion).toISOString()
					: null
			};
		})
	);

	// Get unique users for the filter
	const usuariosUnicosMap = new Map();
	for (const c of ciclosConLugar) {
		if (!usuariosUnicosMap.has(c.userId)) {
			usuariosUnicosMap.set(c.userId, { id: c.userId, nombre: c.usuarioNombre });
		}
	}
	const usuariosUnicos = Array.from(usuariosUnicosMap.values());

	return {
		ciclos: ciclosConLugar,
		usuarios: usuariosUnicos
	};
};
