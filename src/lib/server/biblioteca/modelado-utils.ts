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
 * Calcula el coeficiente de determinación R².
 */
export function calcularR2(
	dias: number[],
	tallas: number[],
	parametros: number[]
): number {
	const modelo = crearModeloLogistico(parametros);
	const yPred = dias.map((t) => modelo(t));
	const yMean = tallas.reduce((a, b) => a + b, 0) / tallas.length;

	const ssRes = tallas.reduce((sum, y, i) => sum + (y - yPred[i]) ** 2, 0);
	const ssTot = tallas.reduce((sum, y) => sum + (y - yMean) ** 2, 0);

	return ssTot !== 0 ? 1 - ssRes / ssTot : 0;
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
		Math.max(...tallas), // L: máximo de las tallas observadas
		0.02, // k: valor medio de tasa de crecimiento
		dias[Math.floor(dias.length / 2)] // x0: mediana de los días
	];
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