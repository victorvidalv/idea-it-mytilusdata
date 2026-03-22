/**
 * Módulo de cálculo para el servicio de similitud.
 * Funciones para calcular SSE y comparar curvas.
 */

import type { BibliotecaRecord } from './queries';
import { crearModeloLogistico } from './modelado-utils';
import type { DatosUsuario } from './similitud';
import type { ParametrosSigmoidal } from '$lib/server/db/schema';

/**
 * Normalizar array de tallas al rango [0, 1].
 * Usado para comparar solo la forma de las curvas, no su escala absoluta.
 */
export function normalizarArray(valores: number[]): number[] {
	const min = Math.min(...valores);
	const max = Math.max(...valores);
	const rango = max - min;
	if (rango === 0) return valores.map(() => 0.5);
	return valores.map((v) => (v - min) / rango);
}

/**
 * Crear modelo logístico normalizado que devuelve valores en [0, 1].
 * Mantiene la forma de la curva pero sin escala absoluta.
 */
export function crearModeloLogisticoNormalizado(
	L: number,
	k: number,
	x0: number,
	diasReferencia: number[]
): (x: number) => number {
	const modelo = crearModeloLogistico([L, k, x0]);
	// Evaluar la curva en los mismos días para obtener su propio rango
	const valoresRef = diasReferencia.map((d) => modelo(d));
	const minRef = Math.min(...valoresRef);
	const maxRef = Math.max(...valoresRef);

	return (x: number) => {
		const valor = modelo(x);
		return (valor - minRef) / (maxRef - minRef || 1);
	};
}

/**
 * Calcular SSE (Sum of Squared Errors) entre los datos del usuario
 * y una curva sigmoidal de la biblioteca.
 */
export function calcularSSE(datos: DatosUsuario, curva: BibliotecaRecord): number {
	const { dias, tallas } = datos;
	const { L, k, x0 } = curva.parametrosCalculados;
	const modelo = crearModeloLogistico([L, k, x0]);

	let sse = 0;
	for (let i = 0; i < dias.length; i++) {
		const tallaProyectada = modelo(dias[i]);
		const residuo = tallas[i] - tallaProyectada;
		sse += residuo * residuo;
	}

	return sse;
}

/**
 * Calcular SSE normalizado (solo compara la forma, no la escala).
 * Tanto los datos del usuario como el modelo se normalizan a [0, 1].
 * Esto permite encontrar curvas con forma similar aunque tengan diferentes magnitudes.
 */
export function calcularSSENormalizado(datos: DatosUsuario, curva: BibliotecaRecord): number {
	const { dias, tallas } = datos;
	const { L, k, x0 } = curva.parametrosCalculados;

	// Normalizar tallas del usuario a [0, 1]
	const tallasNorm = normalizarArray(tallas);

	// Crear modelo normalizado
	const modeloNorm = crearModeloLogisticoNormalizado(L, k, x0, dias);

	let sse = 0;
	for (let i = 0; i < dias.length; i++) {
		const salida = modeloNorm(dias[i]);
		const residuo = tallasNorm[i] - salida;
		sse += residuo * residuo;
	}

	return sse;
}

/**
 * Encontrar la curva más similar en la biblioteca usando SSE.
 */
export async function encontrarCurvaMasSimilar(
	datos: DatosUsuario,
	biblioteca: BibliotecaRecord[]
): Promise<{
	bibliotecaId: number;
	codigoReferencia: string;
	sse: number;
	parametros: ParametrosSigmoidal;
} | null> {
	if (biblioteca.length === 0) {
		return null;
	}

	let mejorResultado: {
		bibliotecaId: number;
		codigoReferencia: string;
		sse: number;
		parametros: ParametrosSigmoidal;
	} | null = null;
	let menorSSE = Infinity;

	for (const curva of biblioteca) {
		const sse = calcularSSENormalizado(datos, curva);

		if (sse < menorSSE) {
			menorSSE = sse;
			mejorResultado = {
				bibliotecaId: curva.id,
				codigoReferencia: curva.codigoReferencia,
				sse,
				parametros: curva.parametrosCalculados
			};
		}
	}

	return mejorResultado;
}
