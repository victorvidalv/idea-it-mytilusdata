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
			key: 'meta', label: 'Meta',
			data: [{ dia: 0, talla: meta }, { dia: maxDia, talla: meta }],
			color: COLOR_META,
			value: 'talla',
			props: { line: { color: COLOR_META }, fill: 'transparent' }
		});
	}

	// Curva de referencia de la biblioteca
	if (curvaRef) {
		const diasRef = generarCurvaSigmoidal(curvaRef.parametros, 0, maxDia);
		series.push({
			key: 'referencia', label: `Ref: ${curvaRef.codigoReferencia}`,
			data: diasRef, color: COLOR_REFERENCIA,
			value: 'talla',
			props: { line: { color: COLOR_REFERENCIA }, fill: 'transparent' }
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
				data: diasEscalado, color: COLOR_REFERENCIA_ESCALADA,
				value: 'talla',
				props: { line: { color: COLOR_REFERENCIA_ESCALADA }, fill: 'transparent' }
			});
		}
	}

	// Real y Proyectado
	if (mediciones.length > 0) {
		series.push({
			key: 'real', label: 'Real',
			data: mediciones.map((m) => ({ dia: m.dia, talla: m.talla })), color: COLOR_REAL,
			value: 'talla',
			props: { line: { color: COLOR_REAL }, fill: 'transparent' }
		});
	}

	// Incertidumbre: banda + mediana (renderizadas con AreaChart)
	if (incertidumbre && incertidumbre.dias.length > 0) {
		const datosBanda = incertidumbre.dias.map((dia, i) => ({
			dia,
			talla: incertidumbre.limiteSuperior[i],
			limiteInferior: incertidumbre.limiteInferior[i],
			limiteSuperior: incertidumbre.limiteSuperior[i],
			mediana: incertidumbre.mediana[i]
		}));

		// Banda de confianza (renderizada primero para quedar detrás)
		series.push({
			key: 'banda',
			label: 'Intervalo de confianza (95%)',
			data: datosBanda,
			color: 'rgba(59, 130, 246, 0.25)',
			value: 'limiteSuperior',
			props: {
				y0: (d: { limiteInferior: number }) => d.limiteInferior,
				stroke: 'none',
				fill: 'rgba(59, 130, 246, 0.2)'
			}
		});

		// Mediana sobre la banda
		series.push({
			key: 'proyectado',
			label: 'Proyectado (mediana)',
			data: datosBanda,
			color: COLOR_PROYECTADO,
			value: 'mediana',
			props: {
				line: { color: COLOR_PROYECTADO, strokeWidth: 2.5 },
				fill: 'transparent'
			}
		});
	} else if (proyeccion.length > 0) {
		series.push({
			key: 'proyectado', label: 'Proyectado',
			data: proyeccion.map((p) => ({ dia: p.dia, talla: p.talla })), color: COLOR_PROYECTADO,
			value: 'talla',
			props: { line: { color: COLOR_PROYECTADO }, fill: 'transparent' }
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
		return `${mediciones.length} reales + ${proyeccion.length} proyectados`;
	}
	return `${proyeccion.length} puntos`;
}
