import { redirect } from '@sveltejs/kit';

// --- Constantes de Roles ---

/** Jerarquía de roles: mayor índice = mayor privilegio */
export const ROLES = {
    USUARIO: 'USUARIO',
    INVESTIGADOR: 'INVESTIGADOR',
    ADMIN: 'ADMIN'
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

/** Niveles numéricos para comparación jerárquica */
const ROLE_LEVEL: Record<Rol, number> = {
    USUARIO: 0,
    INVESTIGADOR: 1,
    ADMIN: 2
};

/**
 * Verificar si el usuario tiene al menos el rol requerido.
 * Lanza redirect a /dashboard si no tiene permisos.
 */
export function requireRole(userRol: Rol | undefined, minRole: Rol): void {
    if (!userRol || ROLE_LEVEL[userRol] < ROLE_LEVEL[minRole]) {
        throw redirect(303, '/dashboard');
    }
}

/**
 * Verificar si un rol es igual o superior a otro (sin lanzar redirect).
 */
export function hasMinRole(userRol: Rol | undefined, minRole: Rol): boolean {
    if (!userRol) return false;
    return ROLE_LEVEL[userRol] >= ROLE_LEVEL[minRole];
}
