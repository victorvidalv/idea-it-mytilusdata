/**
 * Módulo de proyección para el servicio de similitud.
 */

import { crearModeloLogistico } from './modelado-utils';
import { calcularDiaFinal } from './similitud-proyeccion-logic';
import type { ParametrosSigmoidal } from '$lib/server/db/schema';
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
 */
export function generarProyeccion(
	parametros: ParametrosSigmoidal,
	datos: DatosUsuario,
	config: ProyeccionConfig
): PuntoProyectado[] {
	const modelo = crearModeloLogistico([parametros.L, parametros.k, parametros.x0]);
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
