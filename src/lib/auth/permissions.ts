/**
 * Permissions centralizado por rol y entidad.
 *
 * Define qué puede hacer cada rol sobre cada entidad (centros, ciclos, registros).
 * Esta es la única fuente de verdad para permisos en la aplicación.
 *
 * NOTA: Este archivo es accesible desde cliente y servidor.
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

import { MAPA_PERMISOS } from './permissions.data';
import type { Rol } from './permissions.data';

// Re-exportar funciones de verificación y UI
export {
	puedeVerTodos,
	puedeCrear,
	puedeEditar,
	puedeEliminar,
	puedeAccederRuta
} from './permissions-checks';

export {
	getNavegacion,
	tieneNavegacionExtendida,
	getRolStyles
} from './permissions-ui';

/**
 * Obtener configuración de permisos para un rol.
 */
export function getPermisosRol(role: Rol) {
	return MAPA_PERMISOS[role];
}
