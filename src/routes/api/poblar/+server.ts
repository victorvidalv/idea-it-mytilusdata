/**
 * Endpoint GET /api/poblar
 * 
 * Ejecuta el ETL de biblioteca de curvas sigmoidales.
 * Replica la lógica del ETL.py:
 * 1. Extrae mediciones de talla por ciclo
 * 2. Calcula días transcurridos desde primera medición
 * 3. Ajusta modelo sigmoidal con Levenberg-Marquardt
 * 4. Filtra por R² >= 0.85
 * 5. Vacia tabla biblioteca e inserta nuevos registros
 * 
 * Solo accesible para usuarios con rol ADMIN.
 */

import { json } from '@sveltejs/kit';
import {
	extraerYTransformar,
	procesarCiclos,
	filtrarExitosos,
	cargarBiblioteca
} from '$lib/server/biblioteca';
import { validarAdmin } from './auth';

import type { RequestEvent } from './$types';

/**
 * GET /api/poblar
 * Ejecuta el ETL completo de biblioteca.
 */
export async function GET({ request }: RequestEvent) {
	const authResult = await validarAdmin(request.headers.get('Authorization'));
	if ('error' in authResult) {
		return authResult.error;
	}

	try {
		console.log('[POBLAR] Iniciando extracción de datos...');
		const { adminId, datosPorCiclo, totalMediciones, totalCiclos } = await extraerYTransformar();

		if (totalMediciones === 0) {
			return json({
				success: true,
				message: 'No hay mediciones de TALLA_LONGITUD para procesar',
				estadisticas: {
					medicionesEncontradas: 0,
					ciclosProcesados: 0,
					ciclosExitosos: 0,
					registrosInsertados: 0
				}
			});
		}

		console.log(`[POBLAR] Encontradas ${totalMediciones} mediciones en ${totalCiclos} ciclos`);

		console.log('[POBLAR] Iniciando ajuste de curvas...');
		const resultados = procesarCiclos(datosPorCiclo);
		const exitosos = filtrarExitosos(resultados);

		console.log(`[POBLAR] Ajustes exitosos: ${exitosos.length}/${resultados.length}`);

		console.log('[POBLAR] Iniciando carga en base de datos...');
		const resultadoCarga = await cargarBiblioteca(exitosos, adminId);

		if (!resultadoCarga.exitoso) {
			return json(
				{
					success: false,
					error: resultadoCarga.error || 'Error en la carga de datos'
				},
				{ status: 500 }
			);
		}

		console.log(`[POBLAR] Proceso completado. ${resultadoCarga.registrosInsertados} registros insertados`);

		return json({
			success: true,
			message: 'Biblioteca poblada exitosamente',
			estadisticas: {
				medicionesEncontradas: totalMediciones,
				ciclosProcesados: totalCiclos,
				ciclosExitosos: exitosos.length,
				ciclosDescartados: resultados.length - exitosos.length,
				registrosInsertados: resultadoCarga.registrosInsertados
			}
		});
	} catch (error) {
		console.error('[POBLAR] Error:', error);
		const mensaje = error instanceof Error ? error.message : 'Error desconocido';
		return json(
			{
				success: false,
				error: mensaje
			},
			{ status: 500 }
		);
	}
}