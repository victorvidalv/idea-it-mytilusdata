import { MAPA_PERMISOS, RUTAS_BASE } from './permissions.data';
import type { Rol, Entidad } from './permissions.data';

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
	if (RUTAS_BASE.some((r) => ruta.startsWith(r))) return true;
	return permisos.rutasExtras.some((r) => ruta.startsWith(r));
}
