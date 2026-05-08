/**
 * Módulo de manejo de errores para el servicio de similitud.
 * Funciones para crear respuestas de error.
 */

import type { DatosUsuario, ResultadoProyeccion } from './similitud';

/**
 * Crear resultado de error con datos vacíos.
 */
export function crearResultadoError(
	error: string,
	datos: DatosUsuario
): ResultadoProyeccion {
	const rangoDias: [number, number] = [Math.min(...datos.dias), Math.max(...datos.dias)];
	const rangoTallas: [number, number] = [Math.min(...datos.tallas), Math.max(...datos.tallas)];

	return {
		success: false,
		proyeccion: [],
		curvaUsada: { id: -1, codigoReferencia: '', sse: 0, esCurvaLocal: false },
		curvaReferencia: null,
		metadatos: {
			rangoDias,
			rangoTallas,
			totalPuntos: datos.dias.length
		},
		error
	};
}
