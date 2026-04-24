/**
 * Servicio de extracción de datos para el ETL de biblioteca.
 * Extrae mediciones de talla por ciclo desde la base de datos.
 */

import { db } from '$lib/server/db';
import { ciclos, mediciones, tiposRegistro } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { DatosCiclo } from './modelado';

/**
 * Resultado de la extracción de datos.
 */
export interface ResultadoExtraccion {
	adminId: number;
	datosPorCiclo: Map<number, DatosCiclo>;
	totalMediciones: number;
	totalCiclos: number;
}

/**
 * Registro crudo de la consulta JOIN.
 */
interface RegistroMedicion {
	cicloId: number;
	fechaMedicion: Date;
	talla: number;
}

/**
 * Código del tipo de registro para talla/longitud.
 */
const CODIGO_TALLA_LONGITUD = 'TALLA_LONGITUD';

/**
 * Obtiene el ID del usuario administrador.
 * Busca el primer usuario con rol 'ADMIN'.
 */
export async function obtenerAdminId(): Promise<number | null> {
	const [admin] = await db
		.select({ id: ciclos.userId })
		.from(ciclos)
		.limit(1);

	return admin?.id ?? null;
}

/**
 * Extrae todas las mediciones de talla_longitud para los ciclos del admin.
 * Replica la query del ETL.py:
 * - JOIN entre ciclos, mediciones y tipos_registro
 * - Filtra por tipo = 'TALLA_LONGITUD'
 * - Ordena por ciclo_id y fecha_medicion
 */
export async function extraerMedicionesTalla(
	adminId: number
): Promise<RegistroMedicion[]> {
	// Primero obtener el ID del tipo TALLA_LONGITUD
	const [tipoTalla] = await db
		.select({ id: tiposRegistro.id })
		.from(tiposRegistro)
		.where(eq(tiposRegistro.codigo, CODIGO_TALLA_LONGITUD))
		.limit(1);

	if (!tipoTalla) {
		throw new Error(`Tipo de registro '${CODIGO_TALLA_LONGITUD}' no encontrado`);
	}

	// Consulta JOIN entre ciclos y mediciones
	const registros = await db
		.select({
			cicloId: ciclos.id,
			fechaMedicion: mediciones.fechaMedicion,
			talla: mediciones.valor
		})
		.from(ciclos)
		.innerJoin(mediciones, eq(ciclos.id, mediciones.cicloId))
		.where(
			and(
				eq(ciclos.userId, adminId),
				eq(mediciones.tipoId, tipoTalla.id)
			)
		)
		.orderBy(ciclos.id, mediciones.fechaMedicion);

	return registros.map((r) => ({
		cicloId: r.cicloId,
		fechaMedicion: r.fechaMedicion,
		talla: r.talla
	}));
}

/**
 * Agrupa las mediciones por ciclo y calcula los días transcurridos.
 * El día 0 es la primera medición de cada ciclo.
 * 
 * Esta es la transformación del ETL.py:
 * df['dias'] = df.groupby('ciclo_id')['fecha_medicion'].transform(
 *   lambda x: (x - x.min()).dt.days
 * )
 */
export function agruparPorCiclo(
	registros: RegistroMedicion[]
): Map<number, DatosCiclo> {
	const porCiclo = new Map<number, { fechas: Date[]; tallas: number[] }>();

	// Agrupar por ciclo
	for (const registro of registros) {
		const existente = porCiclo.get(registro.cicloId);
		if (existente) {
			existente.fechas.push(registro.fechaMedicion);
			existente.tallas.push(registro.talla);
		} else {
			porCiclo.set(registro.cicloId, {
				fechas: [registro.fechaMedicion],
				tallas: [registro.talla]
			});
		}
	}

	// Calcular días transcurridos desde la primera medición
	const datosPorCiclo = new Map<number, DatosCiclo>();

	for (const [cicloId, datos] of porCiclo) {
		const fechaMinima = datos.fechas.reduce((min, fecha) => 
			fecha < min ? fecha : min, datos.fechas[0]
		);

		const dias = datos.fechas.map((fecha) => {
			const diffMs = fecha.getTime() - fechaMinima.getTime();
			return Math.floor(diffMs / (1000 * 60 * 60 * 24));
		});

		datosPorCiclo.set(cicloId, {
			cicloId,
			dias,
			tallas: datos.tallas
		});
	}

	return datosPorCiclo;
}

/**
 * Ejecuta el proceso completo de extracción y transformación.
 */
export async function extraerYTransformar(): Promise<ResultadoExtraccion> {
	// Obtener admin
	const adminId = await obtenerAdminId();
	if (!adminId) {
		throw new Error('No se encontró un usuario administrador');
	}

	// Extraer mediciones
	const registros = await extraerMedicionesTalla(adminId);

	// Agrupar por ciclo
	const datosPorCiclo = agruparPorCiclo(registros);

	// Calcular totales
	const totalMediciones = registros.length;
	const totalCiclos = datosPorCiclo.size;

	return {
		adminId,
		datosPorCiclo,
		totalMediciones,
		totalCiclos
	};
}