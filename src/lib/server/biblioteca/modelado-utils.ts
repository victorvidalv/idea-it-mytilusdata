/**
 * Utilidades para el servicio de modelado sigmoidal.
 * Constantes y funciones auxiliares para el ajuste de curvas de crecimiento.
 */

import { levenbergMarquardt, type ParameterizedFunction } from 'ml-levenberg-marquardt';
import type { ParametrosSigmoidal } from '$lib/server/db/schema';

/**
 * Restricciones biológicas para los parámetros (bounds).
 * Igual que en el ETL.py:
 * - L: [40, 110] mm (talla máxima de mitilidos)
 * - k: [0.005, 0.06] 1/día (tasa de crecimiento)
 * - x0: [0, 500] días (punto de inflexión)
 */
export const MIN_VALUES = [40, 0.005, 0];
export const MAX_VALUES = [110, 0.06, 500];

/**
 * Bounds para modelo estacional (L, k0, k1, k2, x0).
 * k1 y k2 son pequeños para evitar oscilaciones espurias.
 */
export const MIN_VALUES_ESTACIONAL = [40, 0.005, -0.02, -0.02, 0];
export const MAX_VALUES_ESTACIONAL = [110, 0.06, 0.02, 0.02, 500];

/**
 * Umbral mínimo de R² para aceptar el ajuste.
 */
export const UMBRAL_R2 = 0.85;

/**
 * Mínimo de puntos requeridos para un ajuste estable.
 */
export const MIN_PUNTOS = 5;

/**
 * Modelo logístico sigmoidal: f(t) = L / (1 + exp(-k * (t - x0)))
 *
 * Parámetros:
 * - L: asíntota superior (talla máxima)
 * - k: tasa de crecimiento
 * - x0: punto de inflexión (día de crecimiento medio)
 */
export function crearModeloLogistico(parametros: number[]): (x: number) => number {
	const [L, k, x0] = parametros;
	return (x: number) => {
		// Clip para evitar overflow en exp (igual que en Python)
		const exponente = Math.max(-20, Math.min(20, -k * (x - x0)));
		return L / (1 + Math.exp(exponente));
	};
}

/**
 * Modelo logístico con estacionalidad armónica:
 * k(t) = k0 + k1·sin(2πt/365) + k2·cos(2πt/365)
 * f(t) = L / (1 + exp(-k(t) * (t - x0)))
 *
 * Parámetros: [L, k0, k1, k2, x0]
 */
export function crearModeloLogisticoEstacional(parametros: number[]): (x: number) => number {
	const [L, k0, k1, k2, x0] = parametros;
	return (x: number) => {
		const kt = k0 + k1 * Math.sin((2 * Math.PI * x) / 365) + k2 * Math.cos((2 * Math.PI * x) / 365);
		const exponente = Math.max(-20, Math.min(20, -kt * (x - x0)));
		return L / (1 + Math.exp(exponente));
	};
}

/**
 * Calcula el coeficiente de determinación R² para un modelo arbitrario.
 */
export function calcularR2Generico(
	dias: number[],
	tallas: number[],
	modelo: (x: number) => number
): number {
	const yPred = dias.map((t) => modelo(t));
	const yMean = tallas.reduce((a, b) => a + b, 0) / tallas.length;

	const ssRes = tallas.reduce((sum, y, i) => sum + (y - yPred[i]) ** 2, 0);
	const ssTot = tallas.reduce((sum, y) => sum + (y - yMean) ** 2, 0);

	return ssTot !== 0 ? 1 - ssRes / ssTot : 0;
}

/**
 * Calcula el coeficiente de determinación R² (modelo base de 3 parámetros).
 */
export function calcularR2(
	dias: number[],
	tallas: number[],
	parametros: number[]
): number {
	const modelo = crearModeloLogistico(parametros);
	return calcularR2Generico(dias, tallas, modelo);
}

/**
 * Validar que los datos de entrada sean aptos para el ajuste.
 */
export function validarDatosEntrada(dias: number[], tallas: number[]): boolean {
	const longitudValida = dias.length === tallas.length;
	const suficientesPuntos = dias.length >= MIN_PUNTOS;
	return longitudValida && suficientesPuntos;
}

/**
 * Calcular valores iniciales (semillas) para el algoritmo Levenberg-Marquardt.
 */
export function calcularValoresIniciales(dias: number[], tallas: number[]): number[] {
	return [
		Math.min(MAX_VALUES[0], Math.max(MIN_VALUES[0], Math.max(...tallas))), // L dentro de bounds
		0.02, // k: valor medio de tasa de crecimiento
		dias[Math.floor(dias.length / 2)] // x0: mediana de los días
	];
}

/**
 * Calcular valores iniciales para el modelo estacional.
 * Parte del ajuste base con k1=0, k2=0.
 */
export function calcularValoresInicialesEstacionales(
	parametrosBase: number[]
): number[] {
	const [L, k, x0] = parametrosBase;
	return [L, k, 0, 0, x0];
}

/**
 * Ejecutar el algoritmo Levenberg-Marquardt con los parámetros dados.
 */
export function ejecutarAjuste(
	dias: number[],
	tallas: number[],
	initialValues: number[]
): number[] | null {
	const resultado = levenbergMarquardt(
		{ x: dias, y: tallas },
		crearModeloLogistico as ParameterizedFunction,
		{
			initialValues,
			minValues: MIN_VALUES,
			maxValues: MAX_VALUES,
			maxIterations: 100,
			gradientDifference: 1e-4,
			damping: 1.5,
			errorTolerance: 1e-8
		}
	);

	if (!resultado.parameterValues || resultado.parameterValues.length !== 3) {
		return null;
	}

	return resultado.parameterValues;
}

/**
 * Ejecutar ajuste LM acelerado para bootstrap (menos iteraciones, mayor tolerancia).
 */
export function ejecutarAjusteRapido(
	dias: number[],
	tallas: number[],
	initialValues: number[]
): number[] | null {
	const resultado = levenbergMarquardt(
		{ x: dias, y: tallas },
		crearModeloLogistico as ParameterizedFunction,
		{
			initialValues,
			minValues: MIN_VALUES,
			maxValues: MAX_VALUES,
			maxIterations: 40,
			gradientDifference: 1e-3,
			damping: 1.5,
			errorTolerance: 1e-5
		}
	);

	if (!resultado.parameterValues || resultado.parameterValues.length !== 3) {
		return null;
	}

	return resultado.parameterValues;
}

/**
 * Ejecutar ajuste LM para modelo estacional (5 parámetros).
 */
export function ejecutarAjusteEstacional(
	dias: number[],
	tallas: number[],
	initialValues: number[]
): number[] | null {
	const resultado = levenbergMarquardt(
		{ x: dias, y: tallas },
		crearModeloLogisticoEstacional as ParameterizedFunction,
		{
			initialValues,
			minValues: MIN_VALUES_ESTACIONAL,
			maxValues: MAX_VALUES_ESTACIONAL,
			maxIterations: 100,
			gradientDifference: 1e-4,
			damping: 1.5,
			errorTolerance: 1e-8
		}
	);

	if (!resultado.parameterValues || resultado.parameterValues.length !== 5) {
		return null;
	}

	return resultado.parameterValues;
}

/**
 * Formatear los parámetros ajustados con el redondeo especificado.
 */
export function formatearResultado(
	L: number,
	k: number,
	x0: number,
	r2: number
): ParametrosSigmoidal {
	return {
		L: Math.round(L * 100) / 100,
		k: Math.round(k * 10000) / 10000,
		x0: Math.round(x0 * 100) / 100,
		r2: Math.round(r2 * 10000) / 10000
	};
}

/**
 * Tipo extendido para modelo estacional.
 */
export type ParametrosSigmoidalEstacional = ParametrosSigmoidal & {
	k1: number;
	k2: number;
};

/**
 * Formatear parámetros del modelo estacional.
 */
export function formatearResultadoEstacional(
	L: number,
	k0: number,
	k1: number,
	k2: number,
	x0: number,
	r2: number
): ParametrosSigmoidalEstacional {
	return {
		L: Math.round(L * 100) / 100,
		k: Math.round(k0 * 10000) / 10000,
		x0: Math.round(x0 * 100) / 100,
		r2: Math.round(r2 * 10000) / 10000,
		k1: Math.round(k1 * 10000) / 10000,
		k2: Math.round(k2 * 10000) / 10000
	};
}

/**
 * Resultado del bootstrap paramétrico.
 */
export interface ResultadoBootstrap {
	mediana: number[];
	limiteInferior: number[];
	limiteSuperior: number[];
}

/**
 * Remuestreo con reemplazo de índices.
 */
function remuestreoConReemplazo(n: number): number[] {
	return Array.from({ length: n }, () => Math.floor(Math.random() * n));
}

/**
 * Calcula el percentil de un arreglo ordenado usando interpolación lineal.
 */
function calcularPercentil(sortedArr: number[], p: number): number {
	const n = sortedArr.length;
	if (n === 0) return 0;
	const index = p * (n - 1);
	const lower = Math.floor(index);
	const upper = Math.ceil(index);
	const weight = index - lower;
	if (upper >= n) return sortedArr[n - 1];
	return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
}

/**
 * Bootstrap paramétrico para cuantificación de riesgo en la proyección.
 * Ejecuta 1.000 iteraciones de re-muestreo con reemplazo, ajustando el modelo
 * logístico en cada iteración y proyectando al horizonte solicitado.
 *
 * @param dias - Días de cultivo observados
 * @param longitudes - Longitudes observadas (mm)
 * @param horizonteDias - Cuántos días proyectar hacia el futuro
 * @returns Percentiles 2.5, 50 y 97.5 de la proyección
 */
export async function calcularProyeccionBootstrap(
	dias: number[],
	longitudes: number[],
	horizonteDias: number
): Promise<ResultadoBootstrap | null> {
	if (!validarDatosEntrada(dias, longitudes) || horizonteDias <= 0) {
		return null;
	}

	const n = dias.length;
	const initialValues = calcularValoresIniciales(dias, longitudes);
	const paramsOriginales = ejecutarAjuste(dias, longitudes, initialValues);
	if (!paramsOriginales) {
		return null;
	}

	const ITERACIONES = 1000;
	const BATCH_SIZE = 50;
	const proyecciones: number[][] = [];

	const ultimoDia = Math.max(...dias);
	const diasFuturos = Array.from({ length: horizonteDias }, (_, i) => ultimoDia + i + 1);

	const modeloOriginal = crearModeloLogistico(paramsOriginales);
	const proyeccionFallback = diasFuturos.map((d) => modeloOriginal(d));

	for (let batchStart = 0; batchStart < ITERACIONES; batchStart += BATCH_SIZE) {
		const batchEnd = Math.min(batchStart + BATCH_SIZE, ITERACIONES);
		for (let iter = batchStart; iter < batchEnd; iter++) {
			const idx = remuestreoConReemplazo(n);
			const diasBoot = idx.map((i) => dias[i]);
			const longBoot = idx.map((i) => longitudes[i]);

			const paramsBoot = ejecutarAjusteRapido(diasBoot, longBoot, paramsOriginales);
			if (paramsBoot) {
				const modeloBoot = crearModeloLogistico(paramsBoot);
				proyecciones.push(diasFuturos.map((d) => modeloBoot(d)));
			} else {
				proyecciones.push([...proyeccionFallback]);
			}
		}
		if (batchEnd < ITERACIONES) {
			await new Promise((resolve) => setImmediate(resolve));
		}
	}

	const mediana: number[] = [];
	const limiteInferior: number[] = [];
	const limiteSuperior: number[] = [];

	for (let d = 0; d < horizonteDias; d++) {
		const valores = proyecciones.map((p) => p[d]).sort((a, b) => a - b);
		limiteInferior.push(calcularPercentil(valores, 0.025));
		mediana.push(calcularPercentil(valores, 0.5));
		limiteSuperior.push(calcularPercentil(valores, 0.975));
	}

	return { mediana, limiteInferior, limiteSuperior };
}
