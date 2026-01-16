import type { ParametrosSigmoidal } from './proyeccion-tipos';

const L_MIN_BIOLOGICO = 40;
const L_MAX_BIOLOGICO = 110;
const MARGEN_ASINTOTA_OBSERVADA = 1.02;

function limitar(valor: number, minimo: number, maximo: number): number {
	return Math.min(maximo, Math.max(minimo, valor));
}

// Evaluar la función sigmoidal en un punto x dado los parámetros
// Fórmula: f(x) = L / (1 + exp(-k * (x - x0)))
export function evaluarSigmoidal(x: number, params: ParametrosSigmoidal): number {
	const { L, k, x0 } = params;
	const exponent = -k * (x - x0);
	// Evitar overflow en exp
	if (exponent > 700) return 0;
	if (exponent < -700) return L;
	return L / (1 + Math.exp(exponent));
}

// Generar puntos de una curva sigmoidal en un rango de días
export function generarCurvaSigmoidal(
	params: ParametrosSigmoidal,
	diaInicio: number,
	diaFin: number,
	pasos: number = 100
): { dia: number; talla: number }[] {
	const puntos: { dia: number; talla: number }[] = [];
	const paso = (diaFin - diaInicio) / pasos;
	for (let i = 0; i <= pasos; i++) {
		const dia = diaInicio + i * paso;
		const talla = evaluarSigmoidal(dia, params);
		puntos.push({ dia, talla });
	}
	return puntos;
}

/**
 * Calcular L escalado óptimamente para ajustar la curva de referencia a los datos del usuario.
 * Mantiene k y x0 (la forma temporal), solo ajusta L.
 *
 * La solución cerrada minimiza SSE(L) = Σ(y_i - L·a_i)^2, con
 * a_i = 1 / (1 + exp(-k(t_i - x0))). Luego se proyecta al intervalo
 * biológicamente admisible y se exige que la asíntota supere las tallas observadas.
 */
export function calcularLEscalado(
	datos: { dias: number[]; tallas: number[] },
	curva: ParametrosSigmoidal
): number {
	const { dias, tallas } = datos;
	const { k, x0 } = curva;

	// Evitar división por cero si todos los días son iguales
	if (dias.length === 0 || tallas.length === 0) {
		return curva.L;
	}

	let sumaNumerador = 0;
	let sumaDenominador = 0;

	for (let i = 0; i < dias.length; i++) {
		const exponent = -k * (dias[i] - x0);
		const clippedExp = Math.max(-20, Math.min(20, exponent));
		const factorForma = 1 / (1 + Math.exp(clippedExp));
		// L_opt = ∑(y_i·a_i) / ∑(a_i²)
		sumaNumerador += tallas[i] * factorForma;
		sumaDenominador += factorForma * factorForma;
	}

	if (sumaDenominador === 0) {
		return curva.L;
	}

	const lSinRestriccion = sumaNumerador / sumaDenominador;
	const tallaMaximaObservada = Math.max(...tallas);
	const limiteInferior = Math.min(
		L_MAX_BIOLOGICO,
		Math.max(L_MIN_BIOLOGICO, tallaMaximaObservada * MARGEN_ASINTOTA_OBSERVADA)
	);

	return limitar(lSinRestriccion, limiteInferior, L_MAX_BIOLOGICO);
}
