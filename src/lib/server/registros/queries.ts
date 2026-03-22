/**
 * Consultas de lectura para el módulo de registros.
 */

import { db } from '$lib/server/db';
import { mediciones, lugares, ciclos, tiposRegistro, origenDatos } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';
import { calculateIsOwner, canViewAll } from './authorization';
import type { RegistroConPermisos, Centro, Ciclo, TipoRegistro, OrigenDatos } from './types';

/**
 * Obtiene los centros (lugares) accesibles para el usuario.
 * ADMIN e INVESTIGADOR ven todos, USUARIO solo los propios.
 */
export async function getCentrosByUser(userId: number, userRol: Rol): Promise<Centro[]> {
	return canViewAll(userRol)
		? await db.select().from(lugares)
		: await db.select().from(lugares).where(eq(lugares.userId, userId));
}

/**
 * Obtiene los ciclos accesibles para el usuario.
 * ADMIN e INVESTIGADOR ven todos, USUARIO solo los propios.
 */
export async function getCiclosByUser(userId: number, userRol: Rol): Promise<Ciclo[]> {
	return canViewAll(userRol)
		? await db.select().from(ciclos)
		: await db.select().from(ciclos).where(eq(ciclos.userId, userId));
}

/**
 * Obtiene todos los tipos de registro.
 */
export async function getTiposRegistro(): Promise<TipoRegistro[]> {
	return db.select().from(tiposRegistro);
}

/**
 * Obtiene un registro de medición por su ID.
 */
export async function getRegistroById(id: number): Promise<{ id: number; userId: number } | null> {
	return db
		.select({ id: mediciones.id, userId: mediciones.userId })
		.from(mediciones)
		.where(eq(mediciones.id, id))
		.limit(1)
		.then((rows) => rows[0] ?? null);
}

/**
 * Obtiene los registros con información relacionada y permisos calculados.
 * ADMIN e INVESTIGADOR ven todos, USUARIO solo los propios.
 */
export async function getRegistrosWithPermisos(
	userId: number,
	userRol: Rol
): Promise<RegistroConPermisos[]> {
	// Construir query base con joins
	const query = db
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
			userId: mediciones.userId
		})
		.from(mediciones)
		.innerJoin(lugares, eq(mediciones.lugarId, lugares.id))
		.innerJoin(tiposRegistro, eq(mediciones.tipoId, tiposRegistro.id))
		.innerJoin(origenDatos, eq(mediciones.origenId, origenDatos.id))
		.leftJoin(ciclos, eq(mediciones.cicloId, ciclos.id));

	// Aplicar filtro según permisos
	const registros = canViewAll(userRol)
		? await query.orderBy(desc(mediciones.fechaMedicion)).limit(5000)
		: await query
				.where(eq(mediciones.userId, userId))
				.orderBy(desc(mediciones.fechaMedicion))
				.limit(5000);

	// Agregar campo isOwner para cada registro
	return registros.map((r) => ({
		...r,
		isOwner: calculateIsOwner(r.userId, userId, userRol)
	}));
}