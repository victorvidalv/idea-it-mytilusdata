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
	validarDatosEntrada,
	crearModeloLogistico,
	MIN_PUNTOS
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

/**
 * Resultado de la validación walk-forward de degradación temporal.
 */
export interface ResultadoDegradacion {
	degradacionM1: number[];
	degradacionM2: number[];
	degradacionM3: number[];
}

/**
 * Validación Walk-Forward: mide la degradación del modelo proyectando
 * 1, 2 y 3 meses hacia adelante desde cada punto de corte mensual.
 *
 * @param dias - Días de cultivo observados
 * @param tallas - Longitudes observadas
 * @returns Objeto con arrays de RMSE para cada horizonte de proyección
 */
export function validarDegradacionTemporal(
	dias: number[],
	tallas: number[]
): ResultadoDegradacion | null {
	if (!validarDatosEntrada(dias, tallas)) {
		return null;
	}

	// Agrupar datos por mes aproximado (30 días)
	const datosPorMes = new Map<number, { dias: number[]; tallas: number[] }>();
	for (let i = 0; i < dias.length; i++) {
		const mes = Math.floor(dias[i] / 30);
		if (!datosPorMes.has(mes)) {
			datosPorMes.set(mes, { dias: [], tallas: [] });
		}
		datosPorMes.get(mes)!.dias.push(dias[i]);
		datosPorMes.get(mes)!.tallas.push(tallas[i]);
	}

	const mesesOrdenados = Array.from(datosPorMes.keys()).sort((a, b) => a - b);
	const degradacionM1: number[] = [];
	const degradacionM2: number[] = [];
	const degradacionM3: number[] = [];

	for (let i = 0; i < mesesOrdenados.length - 1; i++) {
		// Acumular datos hasta el mes i (inclusive)
		const diasTrain: number[] = [];
		const tallasTrain: number[] = [];
		for (let j = 0; j <= i; j++) {
			const m = mesesOrdenados[j];
			const grupo = datosPorMes.get(m)!;
			diasTrain.push(...grupo.dias);
			tallasTrain.push(...grupo.tallas);
		}

		if (diasTrain.length < MIN_PUNTOS) {
			continue;
		}

		const params = ajustarCiclo({ cicloId: -1, dias: diasTrain, tallas: tallasTrain });
		if (!params) {
			continue;
		}

		const modelo = crearModeloLogistico([params.L, params.k, params.x0]);

		const calcularRMSE = (mesObjetivo: number): number | null => {
			const grupo = datosPorMes.get(mesObjetivo);
			if (!grupo || grupo.dias.length === 0) {
				return null;
			}
			let sumSq = 0;
			for (let k = 0; k < grupo.dias.length; k++) {
				const pred = modelo(grupo.dias[k]);
				sumSq += (grupo.tallas[k] - pred) ** 2;
			}
			return Math.sqrt(sumSq / grupo.dias.length);
		};

		const rmse1 = calcularRMSE(mesesOrdenados[i + 1]);
		const rmse2 = i + 2 < mesesOrdenados.length ? calcularRMSE(mesesOrdenados[i + 2]) : null;
		const rmse3 = i + 3 < mesesOrdenados.length ? calcularRMSE(mesesOrdenados[i + 3]) : null;

		if (rmse1 !== null) degradacionM1.push(rmse1);
		if (rmse2 !== null) degradacionM2.push(rmse2);
		if (rmse3 !== null) degradacionM3.push(rmse3);
	}

	return { degradacionM1, degradacionM2, degradacionM3 };
}
