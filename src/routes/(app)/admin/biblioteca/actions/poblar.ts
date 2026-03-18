import type { Action } from '@sveltejs/kit';
import { requireAdmin } from '../auth-helpers';
import { extraerYTransformar, procesarCiclos, cargarBiblioteca } from '$lib/server/biblioteca';

export const poblarAction: Action = async (event) => {
	const authError = requireAdmin(event);
	if (authError) return authError;

	try {
		// Fase 1: Extracción
		const resultadoExtraccion = await extraerYTransformar();
		
		if (resultadoExtraccion.totalMediciones === 0) {
			return { success: false, error: 'No se encontraron mediciones de talla/longitud para procesar' };
		}

		// Fase 2: Modelado
		const resultadosAjuste = procesarCiclos(resultadoExtraccion.datosPorCiclo);
		const exitosos = resultadosAjuste.filter((r) => r.exitoso);

		if (exitosos.length === 0) {
			return { success: false, error: 'Ningún ciclo pudo ser procesado exitosamente' };
		}

		// Fase 3: Carga
		const resultadoCarga = await cargarBiblioteca(exitosos, resultadoExtraccion.adminId);

		return {
			success: true,
			message: `Biblioteca poblada exitosamente: ${resultadoCarga.registrosInsertados} registros insertados`,
			estadisticas: {
				medicionesEncontradas: resultadoExtraccion.totalMediciones,
				ciclosProcesados: resultadosAjuste.length,
				ciclosExitosos: exitosos.length,
				registrosInsertados: resultadoCarga.registrosInsertados
			}
		};
	} catch (error) {
		console.error('Error al poblar biblioteca:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Error desconocido al poblar biblioteca' 
		};
	}
};