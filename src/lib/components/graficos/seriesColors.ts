// Colores para las series del gráfico y mapeo de tipos

import type { TipoRegistro } from './types';

// Colores para las series del gráfico (hasta 10)
export const SERIES_COLORS = [
	'oklch(0.55 0.18 200)', // ocean-light
	'oklch(0.72 0.15 185)', // teal-glow
	'oklch(0.65 0.17 170)', // chart-2
	'oklch(0.7 0.18 140)', // chart-3
	'oklch(0.6 0.22 280)', // chart-4
	'oklch(0.65 0.22 30)', // chart-5
	'oklch(0.55 0.15 300)',
	'oklch(0.60 0.20 60)',
	'oklch(0.50 0.18 120)',
	'oklch(0.70 0.12 250)'
];

// Colores para curvas de referencia
export const COLOR_REFERENCIA = 'oklch(0.60 0.10 250)'; // Gris azulado - curva original
export const COLOR_REFERENCIA_ESCALADA = 'oklch(0.65 0.20 50)'; // Naranja - curva escalada proporcionalmente

/**
 * Crea un mapa estable de tipo.id → color
 */
export function buildTipoColorMap(tipos: TipoRegistro[]): Map<number, string> {
	return new Map(tipos.map((t, i) => [t.id, SERIES_COLORS[i % SERIES_COLORS.length]]));
}