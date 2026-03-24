/**
 * Utilidades de cálculo para la proyección.
 */

import type { ParametrosSigmoidal } from '$lib/server/db/schema';
import type { DatosUsuario, ProyeccionConfig } from './similitud-tipos';

const LIMITE_DIAS = 500;

export function calcularDiaObjetivo(
	parametros: ParametrosSigmoidal,
	tallaObjetivo: number
): number | undefined {
	const { L, k, x0 } = parametros;
	if (tallaObjetivo >= L || tallaObjetivo <= 0) return undefined;

	const argLog = L / tallaObjetivo - 1;
	const diaCalculado = x0 - (1 / k) * Math.log(argLog);
    
	if (diaCalculado <= 0 || diaCalculado >= LIMITE_DIAS) return undefined;
    
	return Math.ceil(diaCalculado);
}

export function calcularDiaFinal(
	parametros: ParametrosSigmoidal,
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
