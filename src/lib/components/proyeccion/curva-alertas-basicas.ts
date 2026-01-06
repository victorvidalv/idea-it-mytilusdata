import type { Alerta } from './curva-alertas-tipos';

// Validar cantidad de datos insuficientes
export function validarDatosInsuficientes(n: number): Alerta[] {
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
export function validarAjustePorBiblioteca(esCurvaLocal: boolean): Alerta[] {
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
export function validarRCuadrado(r2: number | undefined): Alerta[] {
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
