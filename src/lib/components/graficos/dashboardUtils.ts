// Utilidades para el dashboard de gráficos
import type { TipoRegistro, Registro, TipoEstadistica, ChartSeriesItem, Stats } from './types';

/**
 * Construye series de datos para el gráfico a partir de tipos y registros
 */
export function buildChartSeries(
	tipos: TipoRegistro[],
	registros: Registro[],
	colorMap: Map<number, string>
): ChartSeriesItem[] {
	return tipos
		.map((tipo) => {
			const tipoData = registros
				.filter((r) => r.tipoId === tipo.id)
				.map((r) => ({
					date: new Date(r.fechaMedicion),
					value: r.valor
				}))
				.sort((a, b) => a.date.getTime() - b.date.getTime());

			if (tipoData.length === 0) return null;

			return {
				key: tipo.codigo,
				label: `${tipo.codigo} (${tipo.unidadBase})`,
				data: tipoData,
				color: colorMap.get(tipo.id) ?? 'oklch(0.55 0.18 200)'
			};
		})
		.filter(Boolean) as ChartSeriesItem[];
}

/**
 * Calcula estadísticas agregadas por tipo de registro
 */
export function calculateStats(registros: Registro[], tipos: TipoRegistro[]): Stats {
	if (registros.length === 0) {
		return { total: 0, porTipo: [] };
	}

	const porTipo = tipos
		.map((tipo) => {
			const valores = registros.filter((r) => r.tipoId === tipo.id).map((r) => r.valor);

			if (valores.length === 0) {
				return {
					codigo: tipo.codigo,
					unidad: tipo.unidadBase,
					promedio: 0,
					min: 0,
					max: 0,
					cuenta: 0
				};
			}

			return crearEstadisticaTipo(tipo.codigo, tipo.unidadBase, valores);
		})
		.filter((s: TipoEstadistica) => s.cuenta > 0);

	return { total: registros.length, porTipo };
}

/**
 * Crea estadísticas para un tipo específico a partir de sus valores
 */
function crearEstadisticaTipo(
	codigo: string,
	unidad: string,
	valores: number[]
): TipoEstadistica {
	return {
		codigo,
		unidad,
		promedio: Math.round((valores.reduce((a, b) => a + b, 0) / valores.length) * 100) / 100,
		min: Math.round(Math.min(...valores) * 100) / 100,
		max: Math.round(Math.max(...valores) * 100) / 100,
		cuenta: valores.length
	};
}