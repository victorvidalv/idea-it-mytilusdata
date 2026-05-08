// Utilidades para generar alertas de confiabilidad de curvas de proyección
import type { ParametrosSigmoidal } from './proyeccionUtils';

// Tipo de alerta
export interface Alerta {
	tipo: 'warning' | 'info';
	titulo: string;
	mensaje: string;
}

// Parámetros necesarios para generar alertas
export interface ParametrosAlertas {
	totalPuntos: number;
	mediciones: { dia: number; talla: number }[];
	esCurvaLocal: boolean;
	r2?: number;
	parametros?: ParametrosSigmoidal;
	tallaObjetivo?: number;
}

// Validar cantidad de datos insuficientes
function validarDatosInsuficientes(n: number): Alerta[] {
	const resultado: Alerta[] = [];
	if (n < 5) {
		resultado.push({
			tipo: 'warning',
			titulo: 'Datos insuficientes',
			mensaje: `Solo se dispone de ${n} puntos de datos. Con menos de 5 puntos, la estimación de parámetros es inestable. Se recomienda agregar más mediciones para mejorar la confiabilidad.`
		});
	} else if (n < 10) {
		resultado.push({
			tipo: 'info',
			titulo: 'Muestra limitada',
			mensaje: `Se dispone de ${n} puntos. Un mínimo de 10 mediciones proporciona mayor estabilidad estadística para los 3 parámetros del modelo (L, k, x₀).`
		});
	}
	return resultado;
}

// Validar si el ajuste viene de biblioteca
function validarAjustePorBiblioteca(esCurvaLocal: boolean): Alerta[] {
	if (!esCurvaLocal) {
		return [
			{
				tipo: 'warning',
				titulo: 'Proyección basada en biblioteca',
				mensaje: 'No se logró un ajuste local directo a tus datos (insuficientes o dispersos). Se usó la curva más similar de la biblioteca histórica y se escaló su magnitud (L). La forma (k, x₀) proviene de otro ciclo productivo, por lo que la proyección podría diferir si las condiciones de cultivo son distintas.'
			}
		];
	}
	return [];
}

// Validar R² bajo
function validarRCuadrado(r2: number | undefined): Alerta[] {
	if (r2 === undefined) return [];
	if (r2 < 0.95) {
		const pct = (r2 * 100).toFixed(1);
		return [
			{
				tipo: r2 < 0.9 ? 'warning' : 'info',
				titulo: `R² = ${r2.toFixed(3)} (${pct}% varianza explicada)`,
				mensaje:
					r2 < 0.9
						? 'El modelo explica menos del 90% de la variabilidad. Los datos podrían no seguir un patrón sigmoidal claro, o haber puntos atípicos que afectan el ajuste. Verifica las mediciones.'
						: 'El ajuste es aceptable pero no óptimo. Puede mejorarse con más mediciones o verificando puntos atípicos.'
			}
		];
	}
	return [];
}

// Calcular coeficiente de variación
function calcularCoeficienteVariacion(tallas: number[]): number {
	if (tallas.length < 3) return 0;
	const media = tallas.reduce((a, b) => a + b, 0) / tallas.length;
	const varianza = tallas.reduce((s, t) => s + (t - media) ** 2, 0) / tallas.length;
	return Math.sqrt(varianza) / media;
}

// Validar alta dispersión en los datos
function validarDispersion(mediciones: { dia: number; talla: number }[]): Alerta[] {
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
function validarExtrapolacionAsintota(
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
function validarTallaMaxima(
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

/**
 * Genera todas las alertas de confiabilidad para una curva de proyección.
 * Combina las validaciones individuales en un solo resultado.
 */
export function generarAlertas(entrada: ParametrosAlertas): Alerta[] {
	const { totalPuntos, mediciones, esCurvaLocal, r2, parametros, tallaObjetivo } = entrada;
	const n = totalPuntos ?? mediciones.length;

	return [
		...validarDatosInsuficientes(n),
		...validarAjustePorBiblioteca(esCurvaLocal),
		...validarRCuadrado(r2),
		...validarDispersion(mediciones),
		...validarExtrapolacionAsintota(parametros, tallaObjetivo),
		...validarTallaMaxima(parametros, mediciones)
	];
}
