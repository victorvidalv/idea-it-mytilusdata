import type { Alerta } from './curva-alertas-tipos';

const TALLA_MIN_BIOLOGICA_ESPERADA = 20;
const TALLA_MAX_BIOLOGICA_ESPERADA = 120;

// Calcular coeficiente de variación
export function calcularCoeficienteVariacion(tallas: number[]): number {
	if (tallas.length < 3) return 0;
	const media = tallas.reduce((a, b) => a + b, 0) / tallas.length;
	const varianza = tallas.reduce((s, t) => s + (t - media) ** 2, 0) / tallas.length;
	return Math.sqrt(varianza) / media;
}

// Validar alta dispersión en los datos
export function validarDispersion(mediciones: { dia: number; talla: number }[]): Alerta[] {
	if (mediciones.length < 3) return [];
	const tallasArr = mediciones.map((m) => m.talla);
	const cv = calcularCoeficienteVariacion(tallasArr);
	if (cv > 0.4) {
		return [
			{
				tipo: 'warning',
				titulo: 'Alta dispersión en los datos',
				mensaje: `El coeficiente de variación es ${(cv * 100).toFixed(0)}%. Los datos tienen una dispersión alta, lo que reduce la confiabilidad de la proyección. Esto puede indicar mediciones en diferentes individuos o condiciones heterogéneas.`
			}
		];
	}
	return [];
}

// Advertir tallas fuera del rango biológico esperado sin bloquear el gráfico.
export function validarRangoBiologicoTallas(mediciones: { dia: number; talla: number }[]): Alerta[] {
	const fueraDeRango = mediciones.filter(
		(m) =>
			m.talla < TALLA_MIN_BIOLOGICA_ESPERADA ||
			m.talla > TALLA_MAX_BIOLOGICA_ESPERADA
	);

	if (fueraDeRango.length === 0) return [];

	const ejemplos = fueraDeRango
		.slice(0, 3)
		.map((m) => `día ${m.dia}: ${m.talla} mm`)
		.join(', ');

	return [
		{
			tipo: 'warning',
			titulo: 'Datos fuera del rango biológico esperado',
			mensaje: `${fueraDeRango.length} medición(es) están fuera del rango referencial ${TALLA_MIN_BIOLOGICA_ESPERADA}-${TALLA_MAX_BIOLOGICA_ESPERADA} mm (${ejemplos}). El gráfico se genera igual, pero la proyección debe interpretarse con cautela porque puede estar representando una etapa temprana, un registro atípico o una unidad de medida distinta.`
		}
	];
}

// Validar extrapolación a la asíntota — simplificado, ya no depende de parámetros sigmoidales
export function validarExtrapolacionAsintota(
	_L: number | undefined,
	tallaObjetivo: number | undefined
): Alerta[] {
	// Ya no aplica con modelos predictivos externos
	return [];
}

// Validar talla máxima observada vs L — simplificado
export function validarTallaMaxima(
	_L: number | undefined,
	mediciones: { dia: number; talla: number }[]
): Alerta[] {
	// Ya no aplica con modelos predictivos externos
	return [];
}
