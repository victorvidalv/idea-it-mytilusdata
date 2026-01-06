import type { ParametrosSigmoidal } from './proyeccion-tipos';

// Evaluar la función sigmoidal en un punto x dado los parámetros
// Fórmula: f(x) = L / (1 + exp(-k * (x - x0)))
export function evaluarSigmoidal(
	x: number,
	params: ParametrosSigmoidal
): number {
	const { L, k, x0 } = params;
	const exponent = -k * (x - x0);
	// Evitar overflow en exp
	if (exponent > 700) return L;
	if (exponent < -700) return 0;
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
 * Mantiene k y x0 (la forma de la curva), solo ajusta L.
 * Usa mínimos cuadrados ponderados para dar menos peso a puntos cerca de la asíntota.
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
		const g = 1 + Math.exp(clippedExp);
		// L_opt = ∑(y_i / g_i) / ∑(1 / g_i²)
		sumaNumerador += tallas[i] / g;
		sumaDenominador += 1 / (g * g);
	}

	if (sumaDenominador === 0) {
		return curva.L;
	}

	return sumaNumerador / sumaDenominador;
}
