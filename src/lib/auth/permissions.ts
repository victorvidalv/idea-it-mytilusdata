/**
 * Permissions centralizado por rol y entidad.
 *
 * Define qué puede hacer cada rol sobre cada entidad (centros, ciclos, registros).
 * Esta es la única fuente de verdad para permisos en la aplicación.
 *
 * NOTA: Este archivo es accesible desde cliente y servidor.
 * Para lógica server-only, usar src/lib/server/auth/permissions.ts
 */

// Re-exportar tipos y constantes desde el módulo de datos
export {
	ROLES,
	PERMISOS_USUARIO,
	PERMISOS_INVESTIGADOR,
	PERMISOS_ADMIN,
	MAPA_PERMISOS,
	NAVEGACION_BASE,
	NAVEGACION_ADMIN,
	MAPA_NAVEGACION,
	RUTAS_BASE
} from './permissions.data';

export type {
	Rol,
	Entidad,
	PermisosEntidad,
	PermisosRol,
	ItemNavegacion
} from './permissions.data';

import {
	ROLES,
	MAPA_PERMISOS,
	MAPA_NAVEGACION,
	RUTAS_BASE
} from './permissions.data';

import type { Rol, Entidad } from './permissions.data';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Obtener configuración de permisos para un rol.
 */
export function getPermisosRol(role: Rol) {
	return MAPA_PERMISOS[role];
}

/**
 * Verificar si un rol puede ver todos los datos de una entidad.
 */
export function puedeVerTodos(role: Rol, entidad: Entidad): boolean {
	return MAPA_PERMISOS[role].entidades[entidad].canViewAll;
}

/**
 * Verificar si un rol puede crear registros de una entidad.
 */
export function puedeCrear(role: Rol, entidad: Entidad): boolean {
	return MAPA_PERMISOS[role].entidades[entidad].canCreate;
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
	const entidadPermisos = MAPA_PERMISOS[role].entidades[entidad];
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
	const entidadPermisos = MAPA_PERMISOS[role].entidades[entidad];
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

/**
 * Obtener navegación completa para un rol.
 */
export function getNavegacion(role: Rol) {
	return MAPA_NAVEGACION[role];
}

/**
 * Verificar si el rol tiene navegación diferente a la base.
 * ADMIN es el único con navegación extendida.
 */
export function tieneNavegacionExtendida(role: Rol): boolean {
	return role === ROLES.ADMIN;
}

/**
 * Obtener estilos (colores) para un rol.
 * Útil para mostrar badges y labels de rol en la UI.
 */
export function getRolStyles(role: Rol): { color: string; label: string } {
	switch (role) {
		case ROLES.ADMIN:
			return { color: 'text-red-400', label: 'Administrador' };
		case ROLES.INVESTIGADOR:
			return { color: 'text-teal-glow', label: 'Investigador' };
		case ROLES.USUARIO:
		default:
			return { color: 'text-muted-foreground', label: 'Usuario' };
	}
}
