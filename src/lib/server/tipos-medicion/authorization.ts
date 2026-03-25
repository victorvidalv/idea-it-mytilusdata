/**
 * Funciones de autorización para el módulo de tipos de medición.
 */

import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';

/**
 * Verifica si el usuario puede administrar tipos de medición.
 * Solo ADMIN puede crear, editar y eliminar tipos de medición.
 */
export function canManageTiposMedicion(userRol: Rol | undefined): boolean {
	return hasMinRole(userRol, ROLES.ADMIN);
}

/**
 * Verifica si el usuario puede ver la página de administración de tipos.
 * Solo ADMIN tiene acceso.
 */
export function canViewTiposMedicion(userRol: Rol | undefined): boolean {
	return hasMinRole(userRol, ROLES.ADMIN);
}