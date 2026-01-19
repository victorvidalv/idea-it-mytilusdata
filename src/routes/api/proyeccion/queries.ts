/**
 * Consultas a la base de datos para el endpoint de proyección.
 */

import { db } from '$lib/server/db';
import { ciclos, mediciones, tiposRegistro } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { CicloInfo, MedicionConFecha } from './types';

/**
 * Obtener información básica de un ciclo.
 */
export async function obtenerCiclo(
	cicloId: number,
	userId: number
): Promise<CicloInfo | null> {
	const resultado = await db
		.select({
			id: ciclos.id,
			nombre: ciclos.nombre,
			fechaSiembra: ciclos.fechaSiembra
		})
		.from(ciclos)
		.where(and(eq(ciclos.id, cicloId), eq(ciclos.userId, userId)))
		.limit(1);

	if (resultado.length === 0) {
		return null;
	}

	return {
		id: resultado[0].id,
		nombre: resultado[0].nombre,
		fechaSiembra: resultado[0].fechaSiembra
	};
}

/**
 * Obtener mediciones de talla para un ciclo.
 */
export async function obtenerMedicionesTalla(
	cicloId: number,
	userId: number
): Promise<Array<{ valor: number; fechaMedicion: Date }>> {
	const resultado = await db
		.select({
			valor: mediciones.valor,
			fechaMedicion: mediciones.fechaMedicion
		})
		.from(mediciones)
		.innerJoin(tiposRegistro, eq(mediciones.tipoId, tiposRegistro.id))
		.where(
			and(
				eq(mediciones.cicloId, cicloId),
				eq(tiposRegistro.codigo, 'TALLA_LONGITUD'),
				eq(mediciones.userId, userId)
			)
		)
		.orderBy(mediciones.fechaMedicion);

	return resultado.map((r) => ({
		valor: r.valor,
		fechaMedicion: r.fechaMedicion
	}));
}

/**
 * Convertir mediciones a formato con fecha real (ISO).
 * Ya no calcula días desde siembra; la API se encarga de eso.
 */
export function convertirMedicionesAFormato(
	mediciones: Array<{ valor: number; fechaMedicion: Date }>
): MedicionConFecha[] {
	return mediciones.map((m) => ({
		fecha: new Date(m.fechaMedicion).toISOString().split('T')[0],
		talla: m.valor
	}));
}
