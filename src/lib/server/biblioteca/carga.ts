/**
 * Servicio de carga para el ETL de biblioteca.
 * Maneja el TRUNCATE e INSERT de la tabla biblioteca.
 */

import { db } from '$lib/server/db';
import { biblioteca } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import type { ResultadoAjuste } from './modelado';
import type { MetadatosBiblioteca } from '$lib/server/db/schema';

/**
 * Resultado de la operación de carga.
 */
export interface ResultadoCarga {
	exitoso: boolean;
	registrosInsertados: number;
	error?: string;
}

/**
 * Vacia la tabla biblioteca y reinicia los IDs.
 * Replica: TRUNCATE TABLE biblioteca RESTART IDENTITY CASCADE
 */
export async function vaciarBiblioteca(): Promise<void> {
	await db.execute(sql`TRUNCATE TABLE ${biblioteca} RESTART IDENTITY CASCADE`);
}

/**
 * Prepara los registros para inserción.
 */
function prepararRegistros(
	resultados: ResultadoAjuste[],
	adminId: number
): Array<{
	codigoReferencia: string;
	cicloId: number;
	puntosJson: Record<string, number>;
	parametrosCalculados: { L: number; k: number; x0: number; r2: number };
	formulaTipo: string;
	metadatos: MetadatosBiblioteca;
	userId: number;
}> {
	return resultados.map((r) => ({
		codigoReferencia: `Ciclo_${r.cicloId}`,
		cicloId: r.cicloId,
		puntosJson: r.puntos,
		parametrosCalculados: r.parametros!,
		formulaTipo: 'LOGISTICO',
		metadatos: { origen: 'calculo_endpoint' },
		userId: adminId
	}));
}

/**
 * Inserta los registros en la tabla biblioteca.
 */
async function insertarRegistros(
	registros: Array<{
		codigoReferencia: string;
		cicloId: number;
		puntosJson: Record<string, number>;
		parametrosCalculados: { L: number; k: number; x0: number; r2: number };
		formulaTipo: string;
		metadatos: MetadatosBiblioteca;
		userId: number;
	}>
): Promise<number> {
	if (registros.length === 0) {
		return 0;
	}

	await db.insert(biblioteca).values(registros);
	return registros.length;
}

/**
 * Ejecuta el proceso completo de carga.
 * 1. Vacia la tabla biblioteca
 * 2. Inserta los nuevos registros
 * 
 * @param resultados - Resultados del modelado sigmoidal
 * @param adminId - ID del usuario administrador
 * @returns Resultado de la operación
 */
export async function cargarBiblioteca(
	resultados: ResultadoAjuste[],
	adminId: number
): Promise<ResultadoCarga> {
	try {
		// Vaciar tabla existente
		await vaciarBiblioteca();

		// Preparar registros
		const registros = prepararRegistros(resultados, adminId);

		// Insertar nuevos registros
		const cantidadInsertada = await insertarRegistros(registros);

		return {
			exitoso: true,
			registrosInsertados: cantidadInsertada
		};
	} catch (error) {
		const mensaje = error instanceof Error ? error.message : 'Error desconocido';
		return {
			exitoso: false,
			registrosInsertados: 0,
			error: mensaje
		};
	}
}