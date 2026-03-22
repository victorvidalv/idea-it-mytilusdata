/**
 * Módulo de proyección para el servicio de similitud.
 * Funciones para generar proyecciones de crecimiento.
 */

import { crearModeloLogistico } from './modelado-utils';
import type { ParametrosSigmoidal } from '$lib/server/db/schema';
import type { DatosUsuario, ProyeccionConfig, PuntoProyectado } from './similitud';

// Límites biológicos
const LIMITE_DIAS = 500;

/**
 * Calcular el día objetivo cuando se alcanza una talla objetivo.
 */
export function calcularDiaObjetivo(
	parametros: ParametrosSigmoidal,
	tallaObjetivo: number
): number | undefined {
	const { L, k, x0 } = parametros;

	// La talla objetivo debe estar en (0, L) para que la inversa tenga solución
	if (tallaObjetivo >= L || tallaObjetivo <= 0) {
		return undefined;
	}

	// Inversa de la logística: t = x0 - (1/k) * ln(L/y - 1)
	const argLog = L / tallaObjetivo - 1;
	const diaCalculado = x0 - (1 / k) * Math.log(argLog);
	if (diaCalculado > 0 && diaCalculado < LIMITE_DIAS) {
		return Math.ceil(diaCalculado);
	}

	return undefined;
}

/**
 * Determinar si un punto es interpolado o proyectado según el día final de datos.
 */
function determinarTipoPunto(dia: number, diaFinalDatos: number): 'interpolado' | 'proyectado' {
	return dia <= diaFinalDatos ? 'interpolado' : 'proyectado';
}

/**
 * Crear un punto proyectado con redondeo.
 */
function crearPunto(dia: number, modelo: (d: number) => number, tipo: 'interpolado' | 'proyectado'): PuntoProyectado {
	return {
		dia,
		talla: Math.round(modelo(dia) * 100) / 100,
		tipo
	};
}

/**
 * Calcular el día objetivo final para la proyección.
 */
function calcularDiaObjetivoFinal(
	parametros: ParametrosSigmoidal,
	datos: DatosUsuario,
	config: ProyeccionConfig
): number {
	const diasMax = config.diasMax ?? LIMITE_DIAS;
	const diaFinal = Math.max(datos.dias[datos.dias.length - 1], diasMax);

	if (!config.tallaObjetivo || config.tallaObjetivo >= parametros.L) {
		return diaFinal;
	}

	const diaCalc = calcularDiaObjetivo(parametros, config.tallaObjetivo);
	return diaCalc !== undefined ? diaCalc : diaFinal;
}

/**
 * Generar puntos de proyección (interpolación y extrapolación).
 */
export function generarProyeccion(
	parametros: ParametrosSigmoidal,
	datos: DatosUsuario,
	config: ProyeccionConfig
): PuntoProyectado[] {
	const { L, k, x0 } = parametros;
	const modelo = crearModeloLogistico([L, k, x0]);
	const diaFinalDatos = datos.dias[datos.dias.length - 1];
	const diaObjetivo = calcularDiaObjetivoFinal(parametros, datos, config);

	const puntos: PuntoProyectado[] = [];
	const paso = 5;

	for (let dia = paso; dia <= diaObjetivo; dia += paso) {
		const tipo = determinarTipoPunto(dia, diaFinalDatos);
		puntos.push(crearPunto(dia, modelo, tipo));
	}

	// Asegurar que el día objetivo esté incluido
	const ultimoPunto = puntos[puntos.length - 1];
	if (ultimoPunto.dia !== diaObjetivo) {
		puntos.push(crearPunto(diaObjetivo, modelo, 'proyectado'));
	}

	return puntos;
}
