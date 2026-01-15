/**
 * Módulo de proyección para el servicio de similitud.
 */

import { crearModeloLogistico, crearModeloLogisticoEstacional } from './modelado-utils';
import { calcularDiaFinal } from './similitud-proyeccion-logic';
import type { ParametrosSigmoidal } from '$lib/server/db/schema';
import type { ParametrosSigmoidalEstacional } from './modelado-utils';
import type { DatosUsuario, ProyeccionConfig, PuntoProyectado } from './similitud-tipos';

function mappingPunto(dia: number, modelo: (d: number) => number, diaCorte: number): PuntoProyectado {
	return {
		dia,
		talla: Math.round(modelo(dia) * 100) / 100,
		tipo: dia <= diaCorte ? 'interpolado' : 'proyectado'
	};
}

/**
 * Generar puntos de proyección.
 * Soporta tanto modelo base como estacional.
 */
export function generarProyeccion(
	parametros: ParametrosSigmoidal | ParametrosSigmoidalEstacional,
	datos: DatosUsuario,
	config: ProyeccionConfig
): PuntoProyectado[] {
	let modelo: (d: number) => number;
	if ('k1' in parametros && 'k2' in parametros) {
		modelo = crearModeloLogisticoEstacional([parametros.L, parametros.k, parametros.k1, parametros.k2, parametros.x0]);
	} else {
		modelo = crearModeloLogistico([parametros.L, parametros.k, parametros.x0]);
	}
	const diaUltimoDato = datos.dias[datos.dias.length - 1];
	const diaFinal = calcularDiaFinal(parametros, diaUltimoDato, config);

	const paso = 5;
	const puntos: PuntoProyectado[] = [];

	for (let dia = paso; dia <= diaFinal; dia += paso) {
		puntos.push(mappingPunto(dia, modelo, diaUltimoDato));
	}

	const ultimo = puntos[puntos.length - 1];
	if (!ultimo || ultimo.dia !== diaFinal) {
		puntos.push(mappingPunto(diaFinal, modelo, diaUltimoDato));
	}

	return puntos;
}

export { calcularDiaObjetivo } from './similitud-proyeccion-logic';
