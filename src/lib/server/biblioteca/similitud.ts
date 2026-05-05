/**
 * Servicio de similitud y proyección para usuarios públicos.
 * Implementa el motor SSE (Sum of Squared Errors) para encontrar
 * la curva más similar en la biblioteca y proyectar el crecimiento.
 */

import type { ParametrosSigmoidal } from '$lib/server/db/schema';
import { getBibliotecaRecords } from './queries';
import { crearModeloLogistico, MIN_PUNTOS } from './modelado-utils';
import { ajustarCiclo } from './modelado';
import {
	validarDatosUsuario,
	encontrarCurvaMasSimilar,
	calcularR2,
	calcularDiaObjetivo,
	generarProyeccion,
	crearResultadoError
} from './similitud-utils';

/**
 * Datos de entrada del usuario.
 */
export interface DatosUsuario {
	dias: number[];
	tallas: number[];
}

/**
 * Configuración para la proyección.
 */
export interface ProyeccionConfig {
	tallaObjetivo?: number;
	diasMax?: number;
}

/**
 * Punto proyectado con día y talla.
 */
export interface PuntoProyectado {
	dia: number;
	talla: number;
	tipo: 'interpolado' | 'proyectado';
}

/**
 * Resultado completo de la proyección.
 */
export interface ResultadoProyeccion {
	success: boolean;
	proyeccion: PuntoProyectado[];
	curvaUsada: {
		id: number;
		codigoReferencia: string;
		sse: number;
		esCurvaLocal: boolean;
		r2?: number;
		parametros?: ParametrosSigmoidal;
	};
	/** Curva de referencia de la biblioteca (null si no hay biblioteca) */
	curvaReferencia: {
		id: number;
		codigoReferencia: string;
		sse: number;
		parametros: ParametrosSigmoidal;
	} | null;
	metadatos: {
		rangoDias: [number, number];
		rangoTallas: [number, number];
		tallaObjetivo?: number;
		diaObjetivo?: number;
		totalPuntos: number;
	};
	error?: string;
}

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

/**
 * Intentar ajuste local con Levenberg-Marquardt.
 */
async function intentarAjusteLocal(
	datos: DatosUsuario,
	config: ProyeccionConfig,
	rangoDias: [number, number],
	rangoTallas: [number, number]
): Promise<ResultadoProyeccion | null> {
	const { dias, tallas } = datos;

	try {
		const parametrosLocales = ajustarCiclo({ cicloId: -1, dias, tallas });

		if (parametrosLocales) {
			// Buscar curva de biblioteca para tener referencia
			const curvaBiblioteca = await obtenerCurvaBiblioteca(datos);

			const proyeccion = generarProyeccion(parametrosLocales, datos, config);
			const r2 = calcularR2(datos, parametrosLocales);
			const diaObjetivo = config.tallaObjetivo
				? calcularDiaObjetivo(parametrosLocales, config.tallaObjetivo)
				: undefined;

			return {
				success: true,
				proyeccion,
				curvaUsada: {
					id: -1,
					codigoReferencia: 'ajuste-local',
					sse: 0,
					esCurvaLocal: true,
					r2,
					parametros: parametrosLocales
				},
				curvaReferencia: curvaBiblioteca,
				metadatos: {
					rangoDias,
					rangoTallas,
					tallaObjetivo: config.tallaObjetivo,
					diaObjetivo,
					totalPuntos: dias.length
				}
			};
		}
	} catch {
		// Fallo en ajuste local, continuar al fallback
	}

	return null;
}

/**
 * Obtener la curva más similar de la biblioteca (para referencia).
 * Retorna null si no hay biblioteca o no se encuentra curva.
 */
async function obtenerCurvaBiblioteca(
	datos: DatosUsuario
): Promise<ResultadoProyeccion['curvaReferencia']> {
	try {
		const biblioteca = await getBibliotecaRecords();
		if (biblioteca.length === 0) {
			return null;
		}

		const mejorCurva = await encontrarCurvaMasSimilar(datos, biblioteca);
		if (!mejorCurva) {
			return null;
		}

		return {
			id: mejorCurva.bibliotecaId,
			codigoReferencia: mejorCurva.codigoReferencia,
			sse: Math.round(mejorCurva.sse * 100) / 100,
			parametros: mejorCurva.parametros
		};
	} catch {
		return null;
	}
}

/**
 * Buscar curva similar en biblioteca.
 */
async function buscarEnBiblioteca(
	datos: DatosUsuario,
	config: ProyeccionConfig,
	rangoDias: [number, number],
	rangoTallas: [number, number]
): Promise<ResultadoProyeccion> {
	const { dias } = datos;

	const biblioteca = await getBibliotecaRecords();

	if (biblioteca.length === 0) {
		return {
			success: false,
			proyeccion: [],
			curvaUsada: { id: -1, codigoReferencia: '', sse: 0, esCurvaLocal: false },
			curvaReferencia: null,
			metadatos: { rangoDias, rangoTallas, totalPuntos: dias.length },
			error:
				'No se pudo ajustar una curva local y la biblioteca está vacía. Se requieren más datos.'
		};
	}

	const mejorCurva = await encontrarCurvaMasSimilar(datos, biblioteca);

	if (!mejorCurva) {
		return {
			success: false,
			proyeccion: [],
			curvaUsada: { id: -1, codigoReferencia: '', sse: 0, esCurvaLocal: false },
			curvaReferencia: null,
			metadatos: { rangoDias, rangoTallas, totalPuntos: dias.length },
			error: 'Error al buscar curva similar en la biblioteca'
		};
	}

	const proyeccion = generarProyeccion(mejorCurva.parametros, datos, config);
	const diaObjetivo = config.tallaObjetivo
		? calcularDiaObjetivo(mejorCurva.parametros, config.tallaObjetivo)
		: undefined;

	return {
		success: true,
		proyeccion,
		curvaUsada: {
			id: mejorCurva.bibliotecaId,
			codigoReferencia: mejorCurva.codigoReferencia,
			sse: Math.round(mejorCurva.sse * 100) / 100,
			esCurvaLocal: false,
			parametros: mejorCurva.parametros
		},
		curvaReferencia: {
			id: mejorCurva.bibliotecaId,
			codigoReferencia: mejorCurva.codigoReferencia,
			sse: Math.round(mejorCurva.sse * 100) / 100,
			parametros: mejorCurva.parametros
		},
		metadatos: {
			rangoDias,
			rangoTallas,
			tallaObjetivo: config.tallaObjetivo,
			diaObjetivo,
			totalPuntos: dias.length
		}
	};
}

/**
 * Convertir resultado de proyección a formato CSV exportable.
 */
export function exportarProyeccionCSV(resultado: ResultadoProyeccion): string {
	if (!resultado.success || resultado.proyeccion.length === 0) {
		return 'dia,talla,tipo\n';
	}

	const lineas = ['dia,talla,tipo'];
	for (const punto of resultado.proyeccion) {
		lineas.push(`${punto.dia},${punto.talla},${punto.tipo}`);
	}

	return lineas.join('\n');
}
