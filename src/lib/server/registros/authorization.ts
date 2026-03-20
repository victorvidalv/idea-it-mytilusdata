/**
 * Funciones de autorización para el módulo de registros.
 */

import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';

/**
 * Verifica si el usuario puede ver todos los registros (no solo los propios).
 * ADMIN e INVESTIGADOR pueden ver todos, USUARIO solo los propios.
 */
export function canViewAll(userRol: Rol | undefined): boolean {
	return hasMinRole(userRol, ROLES.INVESTIGADOR);
}

/**
 * Verifica si el usuario puede modificar un registro específico.
 * Un usuario puede modificar si es dueño del registro o si es ADMIN.
 */
export function canModifyRegistro(
	registroUserId: number,
	currentUserId: number,
	userRol: Rol
): boolean {
	return registroUserId === currentUserId || userRol === ROLES.ADMIN;
}

/**
 * Verifica si el usuario puede eliminar un registro específico.
 * Un usuario puede eliminar si es dueño del registro o si es ADMIN.
 */
export function canDeleteRegistro(
	registroUserId: number,
	currentUserId: number,
	userRol: Rol
): boolean {
	return registroUserId === currentUserId || userRol === ROLES.ADMIN;
}

/**
 * Calcula el flag isOwner para un registro.
 * Es owner si es el creador del registro o si es ADMIN.
 */
export function calculateIsOwner(
	registroUserId: number,
	currentUserId: number,
	userRol: Rol
): boolean {
	return registroUserId === currentUserId || userRol === ROLES.ADMIN;
}