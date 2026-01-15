// Utilidades para la proyección de crecimiento (Principal)
import {
	COLOR_META,
	COLOR_REAL,
	COLOR_PROYECTADO,
	COLOR_REFERENCIA,
	COLOR_REFERENCIA_ESCALADA
} from './proyeccion-colores';
import type {
	ParametrosSigmoidal,
	CurvaReferencia,
	PuntoProyeccion,
	Medicion,
	SerieData,
	TablaDato
} from './proyeccion-tipos';
import type { IncertidumbreProyeccion } from './ProyeccionComponentTypes';
import {
	evaluarSigmoidal,
	generarCurvaSigmoidal,
	calcularLEscalado
} from './proyeccion-sigmoidal';

// Re-exportar para conveniencia
export type { ParametrosSigmoidal, CurvaReferencia, PuntoProyeccion, Medicion, SerieData, TablaDato };
export { evaluarSigmoidal, generarCurvaSigmoidal, calcularLEscalado };

// Paleta premium para modo incertidumbre
const PALETA = {
	real: COLOR_REAL, // oklch(0.55 0.18 200) — azul oceánico
	mediana: 'oklch(0.55 0.16 65)', // ámbar profundo, alto contraste frente al azul
	bandaFill: 'rgba(251, 191, 36, 0.14)', // ámbar-400 al 14%
	bandaStroke: 'rgba(217, 119, 6, 0.55)', // ámbar-600 al 55%
	bandaStrokeLight: 'rgba(217, 119, 6, 0.30)', // ámbar-600 al 30%
	meta: COLOR_META,
	referencia: COLOR_REFERENCIA,
	referenciaEscalada: COLOR_REFERENCIA_ESCALADA
};

/**
 * Construye las series de datos para el gráfico de proyección.
 */
export function construirSeriesProyeccion(
	proyeccion: PuntoProyeccion[],
	mediciones: Medicion[],
	meta: number | undefined,
	curvaRef?: CurvaReferencia,
	incertidumbre?: IncertidumbreProyeccion
): SerieData[] {
	const series: SerieData[] = [];
	const maxDiaProy = proyeccion.length > 0 ? Math.max(...proyeccion.map((p) => p.dia)) : 0;
	const maxDiaMed = mediciones.length > 0 ? Math.max(...mediciones.map((m) => m.dia)) : 0;
	const maxDia = Math.max(0, maxDiaProy, maxDiaMed);

	// Meta: línea horizontal
	if (meta != null) {
		series.push({
			key: 'meta',
			label: 'Meta',
			data: [
				{ dia: 0, talla: meta },
				{ dia: maxDia, talla: meta }
			],
			color: PALETA.meta,
			value: 'talla',
			props: { line: { color: PALETA.meta, strokeWidth: 1.5 }, fill: 'transparent' }
		});
	}

	// Curva de referencia de la biblioteca
	if (curvaRef) {
		const diasRef = generarCurvaSigmoidal(curvaRef.parametros, 0, maxDia);
		series.push({
			key: 'referencia',
			label: `Ref: ${curvaRef.codigoReferencia}`,
			data: diasRef,
			color: PALETA.referencia,
			value: 'talla',
			props: { line: { color: PALETA.referencia, strokeWidth: 1.5 }, fill: 'transparent' }
		});

		// Curva ESCALADA para ajustarse a los datos del usuario
		if (mediciones.length > 0) {
			const L_escalado = calcularLEscalado(
				{ dias: mediciones.map((m) => m.dia), tallas: mediciones.map((m) => m.talla) },
				curvaRef.parametros
			);
			const parametrosEscalados = { ...curvaRef.parametros, L: L_escalado };
			const diasEscalado = generarCurvaSigmoidal(parametrosEscalados, 0, maxDia);
			series.push({
				key: 'referencia-escalada',
				label: `Ref esc: ${curvaRef.codigoReferencia} (L=${L_escalado.toFixed(1)})`,
				data: diasEscalado,
				color: PALETA.referenciaEscalada,
				value: 'talla',
				props: { line: { color: PALETA.referenciaEscalada, strokeWidth: 1.5 }, fill: 'transparent' }
			});
		}
	}

	// Real y Proyectado
	if (mediciones.length > 0) {
		series.push({
			key: 'real',
			label: 'Real',
			data: mediciones.map((m) => ({ dia: m.dia, talla: m.talla })),
			color: PALETA.real,
			value: 'talla',
			props: { line: { color: PALETA.real, strokeWidth: 2 }, fill: 'transparent' }
		});
	}

	// Incertidumbre: banda + límites punteados + mediana
	if (incertidumbre && incertidumbre.dias.length > 0) {
		const datosBanda = incertidumbre.dias.map((dia, i) => ({
			dia,
			talla: incertidumbre.limiteSuperior[i],
			limiteInferior: incertidumbre.limiteInferior[i],
			limiteSuperior: incertidumbre.limiteSuperior[i],
			mediana: incertidumbre.mediana[i]
		}));

		// 1. Relleno de la banda (sin borde, solo área)
		series.push({
			key: 'banda',
			label: 'Intervalo de confianza (95%)',
			data: datosBanda,
			color: PALETA.bandaStroke,
			value: 'limiteSuperior',
			props: {
				y0: (d: { limiteInferior: number }) => d.limiteInferior,
				stroke: 'none',
				fill: PALETA.bandaFill,
				fillOpacity: 1,
				line: false
			}
		});

		// 4. Mediana: línea gruesa sólida con color ámbar de alto contraste
		series.push({
			key: 'proyectado',
			label: 'Proyectado (mediana)',
			data: datosBanda,
			color: PALETA.mediana,
			value: 'mediana',
			props: {
				line: { color: PALETA.mediana, strokeWidth: 3.5 },
				fill: 'transparent'
			}
		});
	} else if (proyeccion.length > 0) {
		series.push({
			key: 'proyectado',
			label: 'Proyectado',
			data: proyeccion.map((p) => ({ dia: p.dia, talla: p.talla })),
			color: COLOR_PROYECTADO,
			value: 'talla',
			props: { line: { color: COLOR_PROYECTADO, strokeWidth: 2.5 }, fill: 'transparent' }
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
export function generarDescripcionGrafico(
	mediciones: Medicion[],
	proyeccion: PuntoProyeccion[]
): string {
	if (mediciones.length > 0) {
		return `${mediciones.length} reales + ${proyeccion.length} proyectados`;
	}
	return `${proyeccion.length} puntos`;
}
