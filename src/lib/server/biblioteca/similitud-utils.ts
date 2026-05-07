/**
 * Utilidades para el servicio de similitud y proyección.
 * Funciones auxiliares para validación y cálculo.
 */

import type { BibliotecaRecord } from './queries';
import { crearModeloLogistico } from './modelado-utils';
import type { ParametrosSigmoidal } from '$lib/server/db/schema';
import type { DatosUsuario } from './similitud';
import type { ProyeccionConfig, PuntoProyectado, ResultadoProyeccion } from './similitud';

// Límites biológicos
const TALLA_MIN = 20;
const TALLA_MAX = 120;
const LIMITE_DIAS = 500;

/**
 * Validar día individual.
 */
function esDiaValido(dia: number): boolean {
	return Number.isFinite(dia) && dia >= 0;
}

/**
 * Validar talla individual.
 */
function esTallaValida(talla: number): boolean {
	return Number.isFinite(talla) && talla >= TALLA_MIN && talla <= TALLA_MAX;
}

/**
 * Verificar que los días estén en orden ascendente sin duplicados.
 */
function verificarOrdenDias(dias: number[]): boolean {
	for (let i = 1; i < dias.length; i++) {
		if (dias[i] <= dias[i - 1]) {
			return false;
		}
	}
	return true;
}

/**
 * Validar datos de entrada del usuario.
 * Verifica que los datos sean numéricos y estén en rango válido.
 */
export function validarDatosUsuario(datos: DatosUsuario): string | null {
	const { dias, tallas } = datos;

	if (dias.length !== tallas.length) {
		return 'Los días y tallas deben tener la misma longitud';
	}

	if (dias.length < 3) {
		return 'Se requieren al menos 3 puntos de datos';
	}

	// Validar cada día y talla
	for (let i = 0; i < dias.length; i++) {
		if (!esDiaValido(dias[i])) {
			return `Día inválido en posición ${i}: ${dias[i]}`;
		}
		if (!esTallaValida(tallas[i])) {
			return `Talla inválida en posición ${i}: ${tallas[i]}. Debe estar entre ${TALLA_MIN} y ${TALLA_MAX}`;
		}
	}

	// Verificar que los días están en orden ascendente
	if (!verificarOrdenDias(dias)) {
		return 'Los días deben estar en orden ascendente y sin duplicados';
	}

	return null;
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
 * Normalizar array de tallas al rango [0, 1].
 * Usado para comparar solo la forma de las curvas, no su escala absoluta.
 */
function normalizarArray(valores: number[]): number[] {
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
function crearModeloLogisticoNormalizado(
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
 * Calcular el día objetivo cuando se alcanza una talla objetivo.
 */
export function calcularDiaObjetivo(
	parametros: ParametrosSigmoidal,
	tallaObjetivo: number
): number | undefined {
	const { L, k, x0 } = parametros;

	// La talla objetivo debe estar en (0, L) para que la inversa tenga solución
	if (tallaObjetivo >= L || tallaObjetivo <= 0) {
		return undefined;
	}

	// Inversa de la logística: t = x0 - (1/k) * ln(L/y - 1)
	const argLog = L / tallaObjetivo - 1;
	const diaCalculado = x0 - (1 / k) * Math.log(argLog);
	if (diaCalculado > 0 && diaCalculado < LIMITE_DIAS) {
		return Math.ceil(diaCalculado);
	}

	return undefined;
}

/**
 * Generar puntos de proyección (interpolación y extrapolación).
 */
export function generarProyeccion(
	parametros: ParametrosSigmoidal,
	datos: DatosUsuario,
	config: ProyeccionConfig
): PuntoProyectado[] {
	const { L, k, x0 } = parametros;
	const modelo = crearModeloLogistico([L, k, x0]);

	const { dias: diasUsuario } = datos;
	const { tallaObjetivo, diasMax = LIMITE_DIAS } = config;

	const diaFinal = Math.max(diasUsuario[diasUsuario.length - 1], diasMax);

	let diaObjetivo = diaFinal;
	if (tallaObjetivo && tallaObjetivo < L) {
		const diaCalc = calcularDiaObjetivo(parametros, tallaObjetivo);
		if (diaCalc !== undefined) {
			diaObjetivo = diaCalc;
		}
	}

	const puntos: PuntoProyectado[] = [];
	const paso = 5;

	for (let dia = paso; dia <= diaObjetivo; dia += paso) {
		const talla = modelo(dia);
		const tipo: 'interpolado' | 'proyectado' =
			dia <= diasUsuario[diasUsuario.length - 1] ? 'interpolado' : 'proyectado';

		puntos.push({
			dia,
			talla: Math.round(talla * 100) / 100,
			tipo
		});
	}

	const ultimoPunto = puntos[puntos.length - 1];
	if (ultimoPunto.dia !== diaObjetivo) {
		const talla = modelo(diaObjetivo);
		puntos.push({
			dia: diaObjetivo,
			talla: Math.round(talla * 100) / 100,
			tipo: 'proyectado'
		});
	}

	return puntos;
}

/**
 * Crear resultado de error con datos vacíos.
 */
export function crearResultadoError(
	error: string,
	datos: DatosUsuario
): ResultadoProyeccion {
	const rangoDias: [number, number] = [Math.min(...datos.dias), Math.max(...datos.dias)];
	const rangoTallas: [number, number] = [Math.min(...datos.tallas), Math.max(...datos.tallas)];

	return {
		success: false,
		proyeccion: [],
		curvaUsada: { id: -1, codigoReferencia: '', sse: 0, esCurvaLocal: false },
		curvaReferencia: null,
		metadatos: {
			rangoDias,
			rangoTallas,
			totalPuntos: datos.dias.length
		},
		error
	};
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
