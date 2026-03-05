/**
 * Funciones de transformación para el módulo de ciclos productivos.
 */

import type { Rol } from '$lib/server/auth';
import { calculateIsOwner } from './authorization';
import { getLugarById } from './queries';
import type { Ciclo, CicloConLugar } from './types';

/**
 * Serializa una fecha a formato ISO string para el cliente.
 */
export function serializeDate(fecha: Date | null): string | null {
	return fecha ? new Date(fecha).toISOString() : null;
}

/**
 * Transforma un ciclo crudo del DB a formato enriquecido para la UI.
 * Incluye nombre del lugar y flag isOwner.
 */
export async function transformCicloConLugar(
	ciclo: Ciclo,
	currentUserId: number,
	userRol: Rol
): Promise<CicloConLugar> {
	const lugar = await getLugarById(ciclo.lugarId);

	return {
		id: ciclo.id,
		nombre: ciclo.nombre,
		fechaSiembra: serializeDate(ciclo.fechaSiembra),
		fechaFinalizacion: serializeDate(ciclo.fechaFinalizacion),
		lugarId: ciclo.lugarId,
		userId: ciclo.userId,
		activo: ciclo.activo ?? true,
		lugarNombre: lugar?.nombre ?? 'Desconocido',
		isOwner: calculateIsOwner(ciclo.userId, currentUserId, userRol)
	};
}

/**
 * Transforma una lista de ciclos con datos enriquecidos.
 */
export async function transformCiclosConLugar(
	ciclos: Ciclo[],
	currentUserId: number,
	userRol: Rol
): Promise<CicloConLugar[]> {
	return Promise.all(
		ciclos.map((ciclo) => transformCicloConLugar(ciclo, currentUserId, userRol))
	);
}