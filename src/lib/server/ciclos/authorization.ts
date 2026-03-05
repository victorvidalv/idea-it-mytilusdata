/**
 * Funciones de autorización para el módulo de ciclos productivos.
 */

import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';

/**
 * Verifica si el usuario puede ver todos los ciclos (no solo los propios).
 * ADMIN e INVESTIGADOR pueden ver todos, USUARIO solo los propios.
 */
export function canViewAllCiclos(userRol: Rol | undefined): boolean {
	return hasMinRole(userRol, ROLES.INVESTIGADOR);
}

/**
 * Verifica si el usuario puede modificar un ciclo específico.
 * Un usuario puede modificar si es dueño del ciclo o si es ADMIN.
 */
export function canModifyCiclo(
	cicloUserId: number,
	currentUserId: number,
	userRol: Rol
): boolean {
	return cicloUserId === currentUserId || userRol === ROLES.ADMIN;
}

/**
 * Verifica si el usuario puede eliminar un ciclo específico.
 * Un usuario puede eliminar si es dueño del ciclo o si es ADMIN.
 */
export function canDeleteCiclo(
	cicloUserId: number,
	currentUserId: number,
	userRol: Rol
): boolean {
	return cicloUserId === currentUserId || userRol === ROLES.ADMIN;
}

/**
 * Calcula el flag isOwner para un ciclo.
 * Es owner si es el creador del ciclo o si es ADMIN.
 */
export function calculateIsOwner(
	cicloUserId: number,
	currentUserId: number,
	userRol: Rol
): boolean {
	return cicloUserId === currentUserId || userRol === ROLES.ADMIN;
}