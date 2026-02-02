import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
	mediciones,
	lugares,
	ciclos,
	tiposRegistro,
	origenDatos,
	usuarios
} from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const userRol = locals.user?.rol as Rol;
	if (!hasMinRole(userRol, ROLES.INVESTIGADOR)) {
		throw redirect(303, '/dashboard');
	}

	const registros = await db
		.select({
			id: mediciones.id,
			valor: mediciones.valor,
			fechaMedicion: mediciones.fechaMedicion,
			notas: mediciones.notas,
			centroId: lugares.id,
			centroNombre: lugares.nombre,
			cicloId: ciclos.id,
			cicloNombre: ciclos.nombre,
			tipoId: tiposRegistro.id,
			tipoNombre: tiposRegistro.codigo,
			unidad: tiposRegistro.unidadBase,
			origenNombre: origenDatos.nombre,
			userId: mediciones.userId,
			usuarioNombre: usuarios.nombre
		})
		.from(mediciones)
		.innerJoin(lugares, eq(mediciones.lugarId, lugares.id))
		.innerJoin(tiposRegistro, eq(mediciones.tipoId, tiposRegistro.id))
		.innerJoin(origenDatos, eq(mediciones.origenId, origenDatos.id))
		.innerJoin(usuarios, eq(mediciones.userId, usuarios.id))
		.leftJoin(ciclos, eq(mediciones.cicloId, ciclos.id))
		.orderBy(desc(mediciones.fechaMedicion))
		.limit(5000);

	// Get unique users for the filter
	const usuariosUnicosMap = new Map();
	for (const r of registros) {
		if (!usuariosUnicosMap.has(r.userId)) {
			usuariosUnicosMap.set(r.userId, { id: r.userId, nombre: r.usuarioNombre });
		}
	}
	const usuariosUnicos = Array.from(usuariosUnicosMap.values());

	return {
		registros,
		usuarios: usuariosUnicos
	};
};
