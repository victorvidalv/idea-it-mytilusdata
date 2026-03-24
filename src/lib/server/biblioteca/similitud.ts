/**
 * Servicio de similitud y proyección para usuarios públicos.
 * Implementa el motor SSE (Sum of Squared Errors) para encontrar
 * la curva más similar en la biblioteca y proyectar el crecimiento.
 */

import { MIN_PUNTOS } from './modelado-utils';
import { validarDatosUsuario, crearResultadoError } from './similitud-utils';
import { intentarAjusteLocal, buscarEnBiblioteca } from './similitud-core';
import type {
	DatosUsuario,
	ProyeccionConfig,
	PuntoProyectado,
	ResultadoProyeccion
} from './similitud-tipos';
import { exportarProyeccionCSV } from './similitud-export';

// Re-exportar tipos para conveniencia
export type { DatosUsuario, ProyeccionConfig, PuntoProyectado, ResultadoProyeccion };
export { exportarProyeccionCSV };

/**
 * Ejecutar la proyección usando la arquitectura híbrida:
 * 1. Intentar ajuste local con Levenberg-Marquardt
 * 2. Si falla, usar fallback SSE con biblioteca
 */
export async function ejecutarProyeccion(
	datos: DatosUsuario,
	config: ProyeccionConfig = {}
): Promise<ResultadoProyeccion> {
	// Validar datos de entrada
	const errorValidacion = validarDatosUsuario(datos);
	if (errorValidacion) {
		return crearResultadoError(errorValidacion, datos);
	}

	const { dias, tallas } = datos;
	const rangoDias: [number, number] = [Math.min(...dias), Math.max(...dias)];
	const rangoTallas: [number, number] = [Math.min(...tallas), Math.max(...tallas)];

	// Paso 1: Intentar ajuste local si hay suficientes puntos
	if (dias.length >= MIN_PUNTOS) {
		const resultadoLocal = await intentarAjusteLocal(datos, config, rangoDias, rangoTallas);
		if (resultadoLocal) {
			return resultadoLocal;
		}
	}

	// Paso 2: Fallback - buscar en biblioteca
	return await buscarEnBiblioteca(datos, config, rangoDias, rangoTallas);
}
