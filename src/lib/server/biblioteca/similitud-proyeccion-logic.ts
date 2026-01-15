/**
 * Utilidades de cálculo para la proyección.
 */

import { crearModeloLogistico, crearModeloLogisticoEstacional } from './modelado-utils';
import type { ParametrosSigmoidal } from '$lib/server/db/schema';
import type { ParametrosSigmoidalEstacional } from './modelado-utils';
import type { DatosUsuario, ProyeccionConfig } from './similitud-tipos';

const LIMITE_DIAS = 500;

function buscarDiaObjetivoNumerico(
	modelo: (d: number) => number,
	tallaObjetivo: number
): number | undefined {
	// Búsqueda lineal simple: iterar día a día hasta encontrar talla >= objetivo
	for (let dia = 1; dia < LIMITE_DIAS; dia++) {
		const t = modelo(dia);
		if (t >= tallaObjetivo) {
			return dia;
		}
	}
	return undefined;
}

export function calcularDiaObjetivo(
	parametros: ParametrosSigmoidal | ParametrosSigmoidalEstacional,
	tallaObjetivo: number
): number | undefined {
	const { L, k, x0 } = parametros;
	if (tallaObjetivo >= L || tallaObjetivo <= 0) return undefined;

	if ('k1' in parametros && 'k2' in parametros) {
		const modelo = crearModeloLogisticoEstacional([parametros.L, parametros.k, parametros.k1, parametros.k2, parametros.x0]);
		return buscarDiaObjetivoNumerico(modelo, tallaObjetivo);
	}

	const argLog = L / tallaObjetivo - 1;
	const diaCalculado = x0 - (1 / k) * Math.log(argLog);
    
	if (diaCalculado <= 0 || diaCalculado >= LIMITE_DIAS) return undefined;
    
	return Math.ceil(diaCalculado);
}

export function calcularDiaFinal(
	parametros: ParametrosSigmoidal | ParametrosSigmoidalEstacional,
	ultimaMedicion: number,
	config: ProyeccionConfig
): number {
	const diasMax = config.diasMax ?? LIMITE_DIAS;
	const diaBase = Math.max(ultimaMedicion, diasMax);

	if (config.tallaObjetivo && config.tallaObjetivo < parametros.L) {
		return calcularDiaObjetivo(parametros, config.tallaObjetivo) ?? diaBase;
	}

	return diaBase;
}
