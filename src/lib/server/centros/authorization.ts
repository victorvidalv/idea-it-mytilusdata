/**
 * Funciones de autorización para el módulo de centros.
 */

import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';

/**
 * Verifica si el usuario puede ver todos los centros (no solo los propios).
 * ADMIN e INVESTIGADOR pueden ver todos, USUARIO solo los propios.
 */
export function canViewAll(userRol: Rol | undefined): boolean {
	return hasMinRole(userRol, ROLES.INVESTIGADOR);
}

/**
 * Verifica si el usuario puede modificar un centro específico.
 * Un usuario puede modificar si es dueño del centro o si es ADMIN.
 */
export function canModifyCentro(
	centroUserId: number,
	currentUserId: number,
	userRol: Rol
): boolean {
	return centroUserId === currentUserId || userRol === ROLES.ADMIN;
}

/**
 * Verifica si el usuario puede eliminar un centro específico.
 * Un usuario puede eliminar si es dueño del centro o si es ADMIN.
 */
export function canDeleteCentro(
	centroUserId: number,
	currentUserId: number,
	userRol: Rol
): boolean {
	return centroUserId === currentUserId || userRol === ROLES.ADMIN;
}

/**
 * Calcula el flag isOwner para un centro.
 * Es owner si es el creador del centro o si es ADMIN.
 */
export function calculateIsOwner(
	centroUserId: number,
	currentUserId: number,
	userRol: Rol
): boolean {
	return centroUserId === currentUserId || userRol === ROLES.ADMIN;
}