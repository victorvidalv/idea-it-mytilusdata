/**
 * Servicio de modelado sigmoidal para ajuste de curvas de crecimiento.
 * Replica la lógica de scipy.optimize.curve_fit del ETL.py usando
 * el algoritmo Levenberg-Marquardt.
 */

import { levenbergMarquardt, type ParameterizedFunction } from 'ml-levenberg-marquardt';
import type { ParametrosSigmoidal, PuntosTalla } from '$lib/server/db/schema';

/**
 * Resultado del ajuste de un ciclo individual.
 */
export interface ResultadoAjuste {
	cicloId: number;
	parametros: ParametrosSigmoidal | null;
	puntos: PuntosTalla;
	exitoso: boolean;
}

/**
 * Datos de entrada para el ajuste por ciclo.
 */
export interface DatosCiclo {
	cicloId: number;
	dias: number[];
	tallas: number[];
}

/**
 * Modelo logístico sigmoidal: f(t) = L / (1 + exp(-k * (t - x0)))
 * 
 * Parámetros:
 * - L: asíntota superior (talla máxima)
 * - k: tasa de crecimiento
 * - x0: punto de inflexión (día de crecimiento medio)
 */
function crearModeloLogistico(parametros: number[]): (x: number) => number {
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
function calcularR2(
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
 * Restricciones biológicas para los parámetros (bounds).
 * Igual que en el ETL.py:
 * - L: [40, 110] mm (talla máxima de mitilidos)
 * - k: [0.005, 0.06] (tasa de crecimiento)
 * - x0: [0, 500] días (punto de inflexión)
 */
const MIN_VALUES = [40, 0.005, 0];
const MAX_VALUES = [110, 0.06, 500];

/**
 * Umbral mínimo de R² para aceptar el ajuste.
 */
const UMBRAL_R2 = 0.85;

/**
 * Mínimo de puntos requeridos para un ajuste estable.
 */
const MIN_PUNTOS = 5;

/**
 * Ajusta el modelo sigmoidal a los datos de un ciclo.
 * 
 * @param datos - Datos del ciclo (días y tallas)
 * @returns Parámetros ajustados o null si el ajuste falla
 */
export function ajustarCiclo(datos: DatosCiclo): ParametrosSigmoidal | null {
	const { dias, tallas } = datos;

	// Validar mínimo de puntos
	if (dias.length < MIN_PUNTOS || tallas.length < MIN_PUNTOS) {
		return null;
	}

	// Validar que tengan la misma longitud
	if (dias.length !== tallas.length) {
		return null;
	}

	try {
		// Semillas iniciales (initial guess) - igual que en Python
		const initialValues = [
			Math.max(...tallas), // L: máximo de las tallas observadas
			0.02, // k: valor medio de tasa de crecimiento
			dias[Math.floor(dias.length / 2)] // x0: mediana de los días
		];

		// Ejecutar Levenberg-Marquardt
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

		// Verificar convergencia
		if (!resultado.parameterValues || resultado.parameterValues.length !== 3) {
			return null;
		}

		const [L, k, x0] = resultado.parameterValues;

		// Calcular R²
		const r2 = calcularR2(dias, tallas, resultado.parameterValues);

		// Verificar calidad del ajuste
		if (r2 < UMBRAL_R2) {
			return null;
		}

		// Redondear como en Python
		return {
			L: Math.round(L * 100) / 100,
			k: Math.round(k * 10000) / 10000,
			x0: Math.round(x0 * 100) / 100,
			r2: Math.round(r2 * 10000) / 10000
		};
	} catch {
		// Error en el ajuste (igual que en Python que retorna None)
		return null;
	}
}

/**
 * Procesa todos los ciclos y genera la biblioteca de parámetros.
 * 
 * @param datosPorCiclo - Mapa de cicloId a sus datos de días y tallas
 * @returns Array de resultados de ajuste por ciclo
 */
export function procesarCiclos(
	datosPorCiclo: Map<number, DatosCiclo>
): ResultadoAjuste[] {
	const resultados: ResultadoAjuste[] = [];

	for (const [cicloId, datos] of datosPorCiclo) {
		const parametros = ajustarCiclo(datos);

		// Crear puntos {dia: talla}
		const puntos: PuntosTalla = {};
		for (let i = 0; i < datos.dias.length; i++) {
			puntos[datos.dias[i].toString()] = datos.tallas[i];
		}

		resultados.push({
			cicloId,
			parametros,
			puntos,
			exitoso: parametros !== null
		});
	}

	return resultados;
}

/**
 * Filtra solo los ciclos con ajuste exitoso.
 */
export function filtrarExitosos(resultados: ResultadoAjuste[]): ResultadoAjuste[] {
	return resultados.filter((r) => r.exitoso && r.parametros !== null);
}