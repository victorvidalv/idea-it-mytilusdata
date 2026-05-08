/**
 * Módulo de estadísticas para el servicio de similitud.
 * Funciones para cálculo de R² y escalado de parámetros.
 */

import { crearModeloLogistico } from './modelado-utils';
import type { ParametrosSigmoidal } from '$lib/server/db/schema';
import type { DatosUsuario } from './similitud';

/**
 * Calcular R² (coeficiente de determinación).
 */
export function calcularR2(
	datos: DatosUsuario,
	parametros: ParametrosSigmoidal
): number {
	const { dias, tallas } = datos;
	const { L, k, x0 } = parametros;
	const modelo = crearModeloLogistico([L, k, x0]);

	const yMean = tallas.reduce((a, b) => a + b, 0) / tallas.length;
	const ssRes = tallas.reduce((sum, y, i) => sum + (y - modelo(dias[i])) ** 2, 0);
	const ssTot = tallas.reduce((sum, y) => sum + (y - yMean) ** 2, 0);

	return ssTot !== 0 ? 1 - ssRes / ssTot : 0;
}

/**
 * Escalar parámetros de una curva de biblioteca para ajustarse a los datos del usuario.
 * Mantiene k y x0 (forma), solo recalcula L por mínimos cuadrados analíticos.
 * L_opt = ∑(y_i / g_i) / ∑(1 / g_i²)  donde g_i = 1 + exp(-k*(t_i - x0))
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
		const g = 1 + Math.exp(exponente);
		sumNum += tallas[i] / g;
		sumDen += 1 / (g * g);
	}

	const L_nuevo = sumDen > 0 ? sumNum / sumDen : parametros.L;
	return { ...parametros, L: Math.round(L_nuevo * 100) / 100 };
}
