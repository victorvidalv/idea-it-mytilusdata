import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { mediciones, lugares, ciclos, tiposRegistro, usuarios } from '$lib/server/db/schema';
import { eq, asc } from 'drizzle-orm';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const userRol = locals.user?.rol as Rol;
	if (!hasMinRole(userRol, ROLES.INVESTIGADOR)) {
		throw redirect(303, '/dashboard');
	}

	// Cargar todos los centros globales
	const misCentros = await db.select().from(lugares);

	// Cargar todos los ciclos globales
	const misCiclos = await db.select().from(ciclos);

	// Cargar tipos de registro
	const tipos = await db.select().from(tiposRegistro);

	// Cargar todas las mediciones con joins
	const registrosBase = await db
		.select({
			id: mediciones.id,
			valor: mediciones.valor,
			fechaMedicion: mediciones.fechaMedicion,
			cicloId: mediciones.cicloId,
			lugarId: mediciones.lugarId,
			tipoId: mediciones.tipoId,
			tipoCodigo: tiposRegistro.codigo,
			tipoUnidad: tiposRegistro.unidadBase,
			centroNombre: lugares.nombre,
			cicloNombre: ciclos.nombre,
			userId: mediciones.userId,
			usuarioNombre: usuarios.nombre
		})
		.from(mediciones)
		.innerJoin(lugares, eq(mediciones.lugarId, lugares.id))
		.innerJoin(tiposRegistro, eq(mediciones.tipoId, tiposRegistro.id))
		.innerJoin(usuarios, eq(mediciones.userId, usuarios.id))
		.leftJoin(ciclos, eq(mediciones.cicloId, ciclos.id))
		.orderBy(asc(mediciones.fechaMedicion));

	// Get unique users for the filter
	const usuariosUnicosMap = new Map();
	for (const r of registrosBase) {
		if (!usuariosUnicosMap.has(r.userId)) {
			usuariosUnicosMap.set(r.userId, { id: r.userId, nombre: r.usuarioNombre });
		}
	}
	const usuariosUnicos = Array.from(usuariosUnicosMap.values());

	// Serializar fechas para el cliente
	const registrosSerializados = registrosBase.map((r) => ({
		...r,
		fechaMedicion: r.fechaMedicion.toISOString()
	}));

	return {
		centros: misCentros,
		ciclos: misCiclos,
		tipos,
		registros: registrosSerializados,
		usuarios: usuariosUnicos
	};
};
