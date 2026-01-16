import { crearModeloLogistico, crearModeloLogisticoEstacional } from './modelado-utils';
import type { ParametrosSigmoidal } from '$lib/server/db/schema';
import type { ParametrosSigmoidalEstacional } from './modelado-utils';
import type {
	DatosUsuario,
	IncertidumbreProyeccionBackend,
	PuntoProyectado
} from './similitud-tipos';

const Z_95 = 1.96;
const ERROR_MINIMO_MM = 0.5;
const FACTOR_ANALOGO = 1.35;

function crearModelo(
	parametros: ParametrosSigmoidal | ParametrosSigmoidalEstacional
): (d: number) => number {
	if ('k1' in parametros && 'k2' in parametros) {
		return crearModeloLogisticoEstacional([
			parametros.L,
			parametros.k,
			parametros.k1,
			parametros.k2,
			parametros.x0
		]);
	}

	return crearModeloLogistico([parametros.L, parametros.k, parametros.x0]);
}

function calcularRmseObservado(
	datos: DatosUsuario,
	parametros: ParametrosSigmoidal | ParametrosSigmoidalEstacional
): number {
	const modelo = crearModelo(parametros);
	const sumaCuadrados = datos.dias.reduce((suma, dia, i) => {
		const residuo = datos.tallas[i] - modelo(dia);
		return suma + residuo * residuo;
	}, 0);

	return Math.max(ERROR_MINIMO_MM, Math.sqrt(sumaCuadrados / datos.dias.length));
}

/**
 * Banda de incertidumbre residual para escenarios donde no hay bootstrap confiable,
 * especialmente proyecciones basadas en perfiles de referencia de biblioteca.
 *
 * La amplitud parte del RMSE observado y aumenta con sqrt(h/30), donde h es el
 * horizonte en días desde la última medición. Ese crecimiento sublineal evita
 * bandas artificialmente explosivas, pero comunica que el error acumulado crece
 * al alejarse del último dato real. En referencias históricas se aplica un factor conservador.
 */
export function calcularIncertidumbreResidual(
	datos: DatosUsuario,
	parametros: ParametrosSigmoidal | ParametrosSigmoidalEstacional,
	proyeccion: PuntoProyectado[],
	esCurvaLocal: boolean
): IncertidumbreProyeccionBackend | undefined {
	if (datos.dias.length === 0 || proyeccion.length === 0) return undefined;

	const modelo = crearModelo(parametros);
	const ultimoDia = Math.max(...datos.dias);
	const rmse = calcularRmseObservado(datos, parametros);
	const factorFuente = esCurvaLocal ? 1 : FACTOR_ANALOGO;

	const dias = proyeccion
		.map((punto) => punto.dia)
		.filter((dia) => dia > ultimoDia)
		.sort((a, b) => a - b);

	if (dias.length === 0) return undefined;

	const mediana: number[] = [];
	const limiteInferior: number[] = [];
	const limiteSuperior: number[] = [];

	for (const dia of dias) {
		const horizonteDias = Math.max(1, dia - ultimoDia);
		const crecimientoTemporal = Math.sqrt(1 + horizonteDias / 30);
		const semiancho = Z_95 * rmse * crecimientoTemporal * factorFuente;
		const centro = modelo(dia);

		mediana.push(Math.round(centro * 100) / 100);
		limiteInferior.push(Math.round(Math.max(0, centro - semiancho) * 100) / 100);
		limiteSuperior.push(Math.round(Math.min(parametros.L, centro + semiancho) * 100) / 100);
	}

	return { dias, mediana, limiteInferior, limiteSuperior };
}
