import { getBibliotecaRecords } from './queries';
import { MIN_PUNTOS } from './modelado-utils';
import { ajustarCiclo } from './modelado';
import {
	encontrarCurvaMasSimilar,
	calcularR2,
	calcularDiaObjetivo,
	generarProyeccion,
	escalarParametros
} from './similitud-utils';
import type { DatosUsuario, ProyeccionConfig, ResultadoProyeccion } from './similitud-tipos';

/**
 * Intentar ajuste local con Levenberg-Marquardt.
 */
export async function intentarAjusteLocal(
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
export async function obtenerCurvaBiblioteca(
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
export async function buscarEnBiblioteca(
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

	// Escalar L de la curva de biblioteca para ajustarse a los datos del usuario
	const parametrosEscalados = escalarParametros(mejorCurva.parametros, datos);
	const proyeccion = generarProyeccion(parametrosEscalados, datos, config);
	const diaObjetivo = config.tallaObjetivo
		? calcularDiaObjetivo(parametrosEscalados, config.tallaObjetivo)
		: undefined;

	return {
		success: true,
		proyeccion,
		curvaUsada: {
			id: mejorCurva.bibliotecaId,
			codigoReferencia: mejorCurva.codigoReferencia,
			sse: Math.round(mejorCurva.sse * 100) / 100,
			esCurvaLocal: false,
			parametros: parametrosEscalados
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
