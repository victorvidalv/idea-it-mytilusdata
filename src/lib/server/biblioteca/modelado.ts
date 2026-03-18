/**
 * Servicio de modelado sigmoidal para ajuste de curvas de crecimiento.
 * Replica la lógica de scipy.optimize.curve_fit del ETL.py usando
 * el algoritmo Levenberg-Marquardt.
 */

import type { ParametrosSigmoidal, PuntosTalla } from '$lib/server/db/schema';
import {
	calcularR2,
	calcularValoresIniciales,
	ejecutarAjuste,
	formatearResultado,
	UMBRAL_R2,
	validarDatosEntrada
} from './modelado-utils';

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
 * Ajusta el modelo sigmoidal a los datos de un ciclo.
 *
 * @param datos - Datos del ciclo (días y tallas)
 * @returns Parámetros ajustados o null si el ajuste falla
 */
export function ajustarCiclo(datos: DatosCiclo): ParametrosSigmoidal | null {
	const { dias, tallas } = datos;

	if (!validarDatosEntrada(dias, tallas)) {
		return null;
	}

	try {
		const initialValues = calcularValoresIniciales(dias, tallas);
		const parametros = ejecutarAjuste(dias, tallas, initialValues);

		if (!parametros) {
			return null;
		}

		const [L, k, x0] = parametros;
		const r2 = calcularR2(dias, tallas, parametros);

		if (r2 < UMBRAL_R2) {
			return null;
		}

		return formatearResultado(L, k, x0, r2);
	} catch {
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