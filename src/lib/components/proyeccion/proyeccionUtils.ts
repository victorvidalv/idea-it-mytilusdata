// Utilidades para la proyección de crecimiento
import { SERIES_COLORS, COLOR_REFERENCIA as COLOR_REFERENCIA_BASE, COLOR_REFERENCIA_ESCALADA as COLOR_REFERENCIA_ESCALADA_BASE } from '$lib/components/graficos/seriesColors';

// Colores para las series
export const COLOR_META = 'oklch(0.60 0.20 60)';
export const COLOR_REAL = SERIES_COLORS[0];
export const COLOR_PROYECTADO = 'oklch(0.72 0.15 185)';
export const COLOR_REFERENCIA = COLOR_REFERENCIA_BASE; // Gris azulado para curva original
export const COLOR_REFERENCIA_ESCALADA = COLOR_REFERENCIA_ESCALADA_BASE; // Naranja para curva escalada

// Parámetros sigmoidales para curva de referencia
export interface ParametrosSigmoidal {
	L: number; // Asíntota superior (talla máxima en mm)
	k: number; // Velocidad de crecimiento
	x0: number; // Punto de inflexión (día)
}

// Curva de referencia de la biblioteca
export interface CurvaReferencia {
	id: number;
	codigoReferencia: string;
	sse: number;
	parametros: ParametrosSigmoidal;
}

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

export interface PuntoProyeccion {
	dia: number;
	talla: number;
	tipo: 'dato' | 'proyeccion';
}

export interface Medicion {
	dia: number;
	talla: number;
}

export interface SerieData {
	key: string;
	label: string;
	data: { dia: number; talla: number }[];
	color: string;
}

export interface TablaDato {
	dia: number;
	talla: number;
	tipo: 'dato' | 'proyeccion';
}

/**
 * Construye las series de datos para el gráfico de proyección.
 * @param proyeccion - Puntos proyectados del ajuste sigmoidal
 * @param mediciones - Datos históricos (mediciones reales)
 * @param meta - Valor de talla objetivo (meta)
 * @param curvaRef - Curva de referencia de la biblioteca (opcional)
 */
export function construirSeriesProyeccion(
	proyeccion: PuntoProyeccion[],
	mediciones: Medicion[],
	meta: number | undefined,
	curvaRef?: CurvaReferencia
): SerieData[] {
	const series: SerieData[] = [];
	const maxDia = Math.max(0, ...proyeccion.map((p) => p.dia), ...mediciones.map((m) => m.dia));

	// Meta: línea horizontal
	if (meta != null) {
		series.push({
			key: 'meta',
			label: 'Meta',
			data: [
				{ dia: 0, talla: meta },
				{ dia: maxDia, talla: meta }
			],
			color: COLOR_META
		});
	}

	// Curva de referencia de la biblioteca (antes de los datos reales para que quede atrás)
	if (curvaRef) {
		const diasRef = generarCurvaSigmoidal(curvaRef.parametros, 0, maxDia, 100);
		series.push({
			key: 'referencia',
			label: `Ref: ${curvaRef.codigoReferencia}`,
			data: diasRef,
			color: COLOR_REFERENCIA
		});

		// Curva ESCALADA para ajustarse a los datos del usuario
		if (mediciones.length > 0) {
			const L_escalado = calcularLEscalado(
				{ dias: mediciones.map((m) => m.dia), tallas: mediciones.map((m) => m.talla) },
				curvaRef.parametros
			);
			const parametrosEscalados = { ...curvaRef.parametros, L: L_escalado };
			const diasEscalado = generarCurvaSigmoidal(parametrosEscalados, 0, maxDia, 100);
			series.push({
				key: 'referencia-escalada',
				label: `Ref esc: ${curvaRef.codigoReferencia} (L=${L_escalado.toFixed(1)})`,
				data: diasEscalado,
				color: COLOR_REFERENCIA_ESCALADA
			});
		}
	}

	// Real: puntos de mediciones históricas
	if (mediciones.length > 0) {
		series.push({
			key: 'real',
			label: 'Real',
			data: mediciones.map((m) => ({ dia: m.dia, talla: m.talla })),
			color: COLOR_REAL
		});
	}

	// Proyectado: curva ajustada
	if (proyeccion.length > 0) {
		series.push({
			key: 'proyectado',
			label: 'Proyectado',
			data: proyeccion.map((p) => ({ dia: p.dia, talla: p.talla })),
			color: COLOR_PROYECTADO
		});
	}

	return series;
}

/**
 * Combina y ordena datos para la tabla.
 */
export function construirTablaDatos(
	proyeccion: PuntoProyeccion[],
	mediciones: Medicion[]
): TablaDato[] {
	const datos: TablaDato[] = [
		...mediciones.map((m) => ({ dia: m.dia, talla: m.talla, tipo: 'dato' as const })),
		...proyeccion.map((p) => ({ dia: p.dia, talla: p.talla, tipo: p.tipo }))
	];
	return datos.sort((a, b) => a.dia - b.dia);
}

/**
 * Genera descripción para el gráfico.
 */
export function generarDescripcionGrafico(mediciones: Medicion[], proyeccion: PuntoProyeccion[]): string {
	if (mediciones.length > 0) {
		return `${mediciones.length} datos reales + ${proyeccion.length} proyectados`;
	}
	return `${proyeccion.length} puntos visualizados`;
}
