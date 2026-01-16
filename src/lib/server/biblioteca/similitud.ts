/**
 * Servicio de similitud y proyección para usuarios públicos.
 * Implementa el motor SSE (Sum of Squared Errors) para encontrar
 * la curva más similar en la biblioteca y proyectar el crecimiento.
 * Ahora incluye bootstrap paramétrico y validación walk-forward.
 */

import { MIN_PUNTOS, calcularProyeccionBootstrap } from './modelado-utils';
import { validarDegradacionTemporal } from './modelado';
import { calcularIncertidumbreResidual } from './similitud-incertidumbre';
import { validarDatosUsuario, crearResultadoError } from './similitud-utils';
import { intentarAjusteLocal, buscarEnBiblioteca } from './similitud-core';
import type {
	DatosUsuario,
	ProyeccionConfig,
	PuntoProyectado,
	ResultadoProyeccion,
	IncertidumbreProyeccionBackend,
	DegradacionRMSEBackend
} from './similitud-tipos';
import { exportarProyeccionCSV } from './similitud-export';

// Re-exportar tipos para conveniencia
export type { DatosUsuario, ProyeccionConfig, PuntoProyectado, ResultadoProyeccion };
export { exportarProyeccionCSV };

/**
 * Enriquece un resultado exitoso con bootstrap paramétrico y degradación walk-forward.
 * El bootstrap solo se calcula cuando hay ajuste local (parámetros propios del usuario).
 * La degradación se calcula sobre los datos proporcionados.
 */
async function enriquecerResultado(
	resultado: ResultadoProyeccion,
	datos: DatosUsuario
): Promise<ResultadoProyeccion> {
	if (!resultado.success || resultado.proyeccion.length === 0) {
		return resultado;
	}

	const { dias, tallas } = datos;
	const diaUltimoDato = Math.max(...dias);
	const diaFinalProyeccion = Math.max(...resultado.proyeccion.map((p) => p.dia));
	const horizonteDias = Math.max(1, diaFinalProyeccion - diaUltimoDato);

	// 1. Bootstrap paramétrico (solo si hay ajuste local con parámetros propios)
	let incertidumbre: IncertidumbreProyeccionBackend | undefined;
	if (
		resultado.curvaUsada.esCurvaLocal &&
		resultado.curvaUsada.parametros &&
		dias.length >= MIN_PUNTOS
	) {
		const boot = await calcularProyeccionBootstrap(dias, tallas, horizonteDias);
		if (boot) {
			// Alinear los días del bootstrap con el último día de datos
			incertidumbre = {
				dias: boot.mediana.map((_, i) => diaUltimoDato + i + 1),
				mediana: boot.mediana,
				limiteInferior: boot.limiteInferior,
				limiteSuperior: boot.limiteSuperior
			};
		}
	}

	if (!incertidumbre && resultado.curvaUsada.parametros) {
		incertidumbre = calcularIncertidumbreResidual(
			datos,
			resultado.curvaUsada.parametros,
			resultado.proyeccion,
			resultado.curvaUsada.esCurvaLocal
		);
	}

	// 2. Degradación temporal walk-forward (sobre datos proporcionados)
	let degradacionRMSE: DegradacionRMSEBackend | undefined;
	const degradacion = validarDegradacionTemporal(dias, tallas);
	if (degradacion && degradacion.degradacionM1.length > 0) {
		// Consolidar RMSE por mes: M1, M2, M3
		const meses: number[] = [];
		const rmse: number[] = [];
		const maxLen = Math.max(
			degradacion.degradacionM1.length,
			degradacion.degradacionM2.length,
			degradacion.degradacionM3.length
		);
		for (let i = 0; i < maxLen; i++) {
			// Promedio simple de los RMSE disponibles para esta ventana
			const vals: number[] = [];
			if (degradacion.degradacionM1[i] !== undefined) vals.push(degradacion.degradacionM1[i]);
			if (degradacion.degradacionM2[i] !== undefined) vals.push(degradacion.degradacionM2[i]);
			if (degradacion.degradacionM3[i] !== undefined) vals.push(degradacion.degradacionM3[i]);
			if (vals.length > 0) {
				meses.push(i + 1);
				rmse.push(vals.reduce((a, b) => a + b, 0) / vals.length);
			}
		}
		if (meses.length > 0) {
			degradacionRMSE = { meses, rmse };
		}
	}

	// Si no hay degradación real pero hay bootstrap, crear una estimación conservadora
	// basada en el error del ajuste para alimentar el semáforo
	if (!degradacionRMSE && resultado.curvaUsada.r2 !== undefined) {
		const r2 = resultado.curvaUsada.r2;
		const errorBase = Math.sqrt(1 - r2) * 10; // heurística conservadora
		degradacionRMSE = {
			meses: [1, 2, 3, 4, 5, 6],
			rmse: Array.from({ length: 6 }, (_, i) => errorBase * (1 + i * 0.5))
		};
	}

	return {
		...resultado,
		incertidumbre,
		degradacionRMSE
	};
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
			return await enriquecerResultado(resultadoLocal, datos);
		}
	}

	// Paso 2: Fallback - buscar en biblioteca
	const resultadoBiblioteca = await buscarEnBiblioteca(datos, config, rangoDias, rangoTallas);
	return await enriquecerResultado(resultadoBiblioteca, datos);
}
