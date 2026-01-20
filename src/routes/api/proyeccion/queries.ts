/**
 * Consultas a la base de datos para el endpoint de proyección.
 */

import { db } from '$lib/server/db';
import { ciclos, mediciones, tiposRegistro } from '$lib/server/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
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
 * Mantiene compatibilidad hacia atrás.
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
 * Obtener mediciones multivariables agrupadas por fecha para un ciclo.
 * Mapea códigos de tipo de registro a campos del modelo:
 * - TALLA_LONGITUD -> talla
 * - PESO_VIVO -> biomasa
 * - DENSIDAD_STD -> densidad
 * - TEMPERATURA_AGUA / TEMPERTURA_AGUA -> temperatura
 *
 * Si solo hay talla, devuelve el formato actual compatible.
 */
export async function obtenerMedicionesPorCiclo(
	cicloId: number,
	userId: number
): Promise<MedicionConFecha[]> {
	// Códigos de interés para modelos multivariables
	const codigosInteres = [
		'TALLA_LONGITUD',
		'PESO_VIVO',
		'DENSIDAD_STD',
		'TEMPERATURA_AGUA',
		'TEMPERTURA_AGUA' // typo conocido en algunos datos
	];

	const resultado = await db
		.select({
			valor: mediciones.valor,
			fechaMedicion: mediciones.fechaMedicion,
			codigo: tiposRegistro.codigo
		})
		.from(mediciones)
		.innerJoin(tiposRegistro, eq(mediciones.tipoId, tiposRegistro.id))
		.where(
			and(
				eq(mediciones.cicloId, cicloId),
				eq(mediciones.userId, userId),
				inArray(tiposRegistro.codigo, codigosInteres)
			)
		)
		.orderBy(mediciones.fechaMedicion);

	// Agrupar por fecha
	const agrupadas = new Map<string, MedicionConFecha>();

	for (const row of resultado) {
		const fechaIso = new Date(row.fechaMedicion).toISOString().split('T')[0];

		if (!agrupadas.has(fechaIso)) {
			agrupadas.set(fechaIso, { fecha: fechaIso, talla: 0 });
		}

		const entry = agrupadas.get(fechaIso)!;
		const codigo = row.codigo;

		if (codigo === 'TALLA_LONGITUD') {
			entry.talla = row.valor;
		} else if (codigo === 'PESO_VIVO') {
			entry.biomasa = row.valor;
		} else if (codigo === 'DENSIDAD_STD') {
			entry.densidad = row.valor;
		} else if (codigo === 'TEMPERATURA_AGUA' || codigo === 'TEMPERTURA_AGUA') {
			entry.temperatura = row.valor;
		}
	}

	// Filtrar solo entradas que tengan talla (requerido mínimo)
	const conTalla = Array.from(agrupadas.values()).filter((m) => m.talla > 0);

	// Si solo hay talla (sin biomasa, densidad ni temperatura),
	// devolver formato simple compatible con el frontend actual
	const tieneMultivariable = conTalla.some(
		(m) => m.biomasa !== undefined || m.densidad !== undefined || m.temperatura !== undefined
	);

	if (!tieneMultivariable) {
		return conTalla.map((m) => ({ fecha: m.fecha, talla: m.talla }));
	}

	return conTalla;
}

/**
 * Convertir mediciones a formato con fecha real (ISO).
 * Ya no calcula días desde siembra; la API se encarga de eso.
 * Mantiene compatibilidad hacia atrás.
 */
export function convertirMedicionesAFormato(
	mediciones: Array<{ valor: number; fechaMedicion: Date }>
): MedicionConFecha[] {
	return mediciones.map((m) => ({
		fecha: new Date(m.fechaMedicion).toISOString().split('T')[0],
		talla: m.valor
	}));
}
