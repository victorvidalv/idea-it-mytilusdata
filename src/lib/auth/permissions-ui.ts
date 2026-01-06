import { ROLES, MAPA_NAVEGACION } from './permissions.data';
import type { Rol } from './permissions.data';

/**
 * Obtener navegación completa para un rol.
 */
export function getNavegacion(role: Rol) {
	return MAPA_NAVEGACION[role];
}

/**
 * Verificar si el rol tiene navegación diferente a la base.
 */
export function tieneNavegacionExtendida(role: Rol): boolean {
	return role === ROLES.ADMIN;
}

/**
 * Obtener estilos (colores) para un rol.
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
