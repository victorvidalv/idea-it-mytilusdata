import type { Alerta } from './curva-alertas-tipos';
import type { ParametrosSigmoidal } from './proyeccionUtils';

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
				mensaje: `El coeficiente de variación es ${(cv * 100).toFixed(0)}%. Los datos tienen una dispersión alta, lo que reduce la confiabilidad del ajuste. Esto puede indicar mediciones en diferentes individuos o condiciones heterogéneas.`
			}
		];
	}
	return [];
}

// Validar extrapolación a la asíntota
export function validarExtrapolacionAsintota(
	params: ParametrosSigmoidal | undefined,
	tallaObjetivo: number | undefined
): Alerta[] {
	if (!params || !tallaObjetivo) return [];
	const fraccion = tallaObjetivo / params.L;
	if (fraccion > 0.95) {
		return [
			{
				tipo: 'warning',
				titulo: 'Meta muy cercana a la asíntota',
				mensaje: `La talla objetivo (${tallaObjetivo} mm) es el ${(fraccion * 100).toFixed(0)}% de la asíntota L = ${params.L.toFixed(1)} mm. En la zona asintótica, pequeñas variaciones en los parámetros producen grandes cambios en el día estimado. La predicción del día objetivo tiene alta incertidumbre.`
			}
		];
	}
	return [];
}

// Validar talla máxima observada vs L
export function validarTallaMaxima(
	params: ParametrosSigmoidal | undefined,
	mediciones: { dia: number; talla: number }[]
): Alerta[] {
	if (!params || mediciones.length === 0) return [];
	const maxTalla = Math.max(...mediciones.map((m) => m.talla));
	if (maxTalla > params.L * 0.98) {
		return [
			{
				tipo: 'warning',
				titulo: 'Talla observada cercana o superior a L',
				mensaje: `La talla máxima observada (${maxTalla.toFixed(1)} mm) está muy cerca o supera la asíntota L = ${params.L.toFixed(1)} mm. El modelo podría estar subestimando el crecimiento real. Considera que se requieren más datos en la fase de estabilización.`
			}
		];
	}
	return [];
}
