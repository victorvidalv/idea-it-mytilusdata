/**
 * Funciones de autorización para el módulo de orígenes de datos.
 */

import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';

/**
 * Verifica si el usuario puede administrar orígenes de datos.
 * Solo ADMIN puede gestionar orígenes de datos.
 */
export function canManageOrigenes(userRol: Rol | undefined): boolean {
	return hasMinRole(userRol, ROLES.ADMIN);
}