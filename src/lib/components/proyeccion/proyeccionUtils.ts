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
	curvaRef?: CurvaReferencia
): SerieData[] {
	const series: SerieData[] = [];
	const maxDia = Math.max(0, ...proyeccion.map((p) => p.dia), ...mediciones.map((m) => m.dia));

	// Meta: línea horizontal
	if (meta != null) {
		series.push({
			key: 'meta', label: 'Meta',
			data: [{ dia: 0, talla: meta }, { dia: maxDia, talla: meta }],
			color: COLOR_META
		});
	}

	// Curva de referencia de la biblioteca
	if (curvaRef) {
		const diasRef = generarCurvaSigmoidal(curvaRef.parametros, 0, maxDia);
		series.push({
			key: 'referencia', label: `Ref: ${curvaRef.codigoReferencia}`,
			data: diasRef, color: COLOR_REFERENCIA
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
				data: diasEscalado, color: COLOR_REFERENCIA_ESCALADA
			});
		}
	}

	// Real y Proyectado
	if (mediciones.length > 0) {
		series.push({
			key: 'real', label: 'Real',
			data: mediciones.map((m) => ({ dia: m.dia, talla: m.talla })), color: COLOR_REAL
		});
	}
	if (proyeccion.length > 0) {
		series.push({
			key: 'proyectado', label: 'Proyectado',
			data: proyeccion.map((p) => ({ dia: p.dia, talla: p.talla })), color: COLOR_PROYECTADO
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
