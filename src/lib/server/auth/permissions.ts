/**
 * Permissions centralizado por rol y entidad (server-only).
 *
 * Define qué puede hacer cada rol sobre cada entidad (centros, ciclos, registros).
 * Esta es la única fuente de verdad para permisos en la aplicación.
 */

import { ROLES } from './roles';
import type { Rol } from './roles';
import {
	MAPA_PERMISOS,
	MAPA_NAVEGACION,
	RUTAS_BASE,
	type Entidad,
	type PermisosRol,
	type ItemNavegacion
} from './permissions.server.data';

// Re-exportar tipos para uso externo
export type { Entidad, PermisosRol, ItemNavegacion };

// =============================================================================
// FUNCIONES DE CONSULTA DE PERMISOS
// =============================================================================

/**
 * Obtener configuración de permisos para un rol.
 */
export function getPermisosRol(role: Rol): PermisosRol {
	return MAPA_PERMISOS[role];
}

/**
 * Verificar si un rol puede ver todos los datos de una entidad.
 */
export function puedeVerTodos(role: Rol, entidad: Entidad): boolean {
	const permisos = MAPA_PERMISOS[role];
	return permisos.entidades[entidad].canViewAll;
}

/**
 * Verificar si un rol puede crear registros de una entidad.
 */
export function puedeCrear(role: Rol, entidad: Entidad): boolean {
	const permisos = MAPA_PERMISOS[role];
	return permisos.entidades[entidad].canCreate;
}

/**
 * Verificar si un rol puede editar un registro específico.
 * Considera si es dueño del registro o si tiene permisos de edición global.
 */
export function puedeEditar(
	role: Rol,
	entidad: Entidad,
	usuarioId: string,
	ownerId: string
): boolean {
	const permisos = MAPA_PERMISOS[role];
	const entidadPermisos = permisos.entidades[entidad];

	if (entidadPermisos.canEdit) return true;
	if (entidadPermisos.canEditOwn && usuarioId === ownerId) return true;

	return false;
}

/**
 * Verificar si un rol puede eliminar un registro específico.
 * Considera si es dueño del registro o si tiene permisos de eliminación global.
 */
export function puedeEliminar(
	role: Rol,
	entidad: Entidad,
	usuarioId: string,
	ownerId: string
): boolean {
	const permisos = MAPA_PERMISOS[role];
	const entidadPermisos = permisos.entidades[entidad];

	if (entidadPermisos.canDelete) return true;
	if (entidadPermisos.canDeleteOwn && usuarioId === ownerId) return true;

	return false;
}

/**
 * Verificar si un rol puede acceder a una ruta.
 */
export function puedeAccederRuta(role: Rol, ruta: string): boolean {
	const permisos = MAPA_PERMISOS[role];

	// Rutas base siempre accesibles para usuarios autenticados
	if (RUTAS_BASE.some((r) => ruta.startsWith(r))) return true;

	// Verificar rutas extras del rol
	return permisos.rutasExtras.some((r) => ruta.startsWith(r));
}

// =============================================================================
// FUNCIONES DE NAVEGACIÓN
// =============================================================================

/**
 * Obtener navegación completa para un rol.
 */
export function getNavegacion(role: Rol): ItemNavegacion[] {
	return MAPA_NAVEGACION[role];
}

/**
 * Verificar si el rol tiene navegación diferente a la base.
 * ADMIN es el único con navegación extendida.
 */
export function tieneNavegacionExtendida(role: Rol): boolean {
	return role === ROLES.ADMIN;
}
