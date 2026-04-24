/**
 * Módulo de estadísticas para el servicio de similitud.
 * Funciones para cálculo de R² y escalado de parámetros.
 */

import {
	MAX_VALUES,
	MIN_VALUES,
	crearModeloLogistico,
	crearModeloLogisticoEstacional
} from './modelado-utils';
import type { ParametrosSigmoidal } from '$lib/server/db/schema';
import type { ParametrosSigmoidalEstacional } from './modelado-utils';
import type { DatosUsuario } from './similitud';

const MARGEN_ASINTOTA_OBSERVADA = 1.02;

function limitar(valor: number, minimo: number, maximo: number): number {
	return Math.min(maximo, Math.max(minimo, valor));
}

/**
 * Calcular R² (coeficiente de determinación).
 * Soporta tanto modelo base como estacional.
 */
export function calcularR2(
	datos: DatosUsuario,
	parametros: ParametrosSigmoidal | ParametrosSigmoidalEstacional
): number {
	const { dias, tallas } = datos;
	const { L, k, x0 } = parametros;

	let modelo: (d: number) => number;
	if ('k1' in parametros && 'k2' in parametros) {
		modelo = crearModeloLogisticoEstacional([L, k, parametros.k1, parametros.k2, x0]);
	} else {
		modelo = crearModeloLogistico([L, k, x0]);
	}

	const yMean = tallas.reduce((a, b) => a + b, 0) / tallas.length;
	const ssRes = tallas.reduce((sum, y, i) => sum + (y - modelo(dias[i])) ** 2, 0);
	const ssTot = tallas.reduce((sum, y) => sum + (y - yMean) ** 2, 0);

	return ssTot !== 0 ? 1 - ssRes / ssTot : 0;
}

/**
 * Escalar parámetros de una curva de biblioteca para ajustarse a los datos del usuario.
 * Mantiene k y x0 (forma temporal), solo recalcula L por mínimos cuadrados analíticos.
 *
 * Con a_i = 1 / (1 + exp(-k(t_i - x0))), el modelo queda y_i ≈ L·a_i.
 * El óptimo sin restricción es L* = ∑(y_i·a_i) / ∑(a_i²). Después se proyecta
 * al intervalo biológico permitido, exigiendo que la asíntota quede por encima
 * de las tallas ya observadas.
 */
export function escalarParametros(
	parametros: ParametrosSigmoidal,
	datos: DatosUsuario
): ParametrosSigmoidal {
	const { k, x0 } = parametros;
	const { dias, tallas } = datos;

	if (dias.length === 0) {
		return parametros;
	}

	let sumNum = 0;
	let sumDen = 0;
	for (let i = 0; i < dias.length; i++) {
		const exponente = Math.max(-20, Math.min(20, -k * (dias[i] - x0)));
		const factorForma = 1 / (1 + Math.exp(exponente));
		sumNum += tallas[i] * factorForma;
		sumDen += factorForma * factorForma;
	}

	const lSinRestriccion = sumDen > 0 ? sumNum / sumDen : parametros.L;
	const tallaMaximaObservada = Math.max(...tallas);
	const limiteInferior = Math.min(
		MAX_VALUES[0],
		Math.max(MIN_VALUES[0], tallaMaximaObservada * MARGEN_ASINTOTA_OBSERVADA)
	);
	const L_nuevo = limitar(lSinRestriccion, limiteInferior, MAX_VALUES[0]);

	return { ...parametros, L: Math.round(L_nuevo * 100) / 100 };
}
