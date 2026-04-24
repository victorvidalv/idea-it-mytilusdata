import type { Alerta, ParametrosAlertas } from './curva-alertas-tipos';
import { validarDatosInsuficientes, validarAjustePorBiblioteca, validarRCuadrado } from './curva-alertas-basicas';
import {
	validarDispersion,
	validarExtrapolacionAsintota,
	validarRangoBiologicoTallas,
	validarTallaMaxima
} from './curva-alertas-avanzadas';

export type { Alerta, ParametrosAlertas };

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
		...validarRangoBiologicoTallas(mediciones),
		...validarDispersion(mediciones),
		...validarExtrapolacionAsintota(parametros, tallaObjetivo),
		...validarTallaMaxima(parametros, mediciones)
	];
}
