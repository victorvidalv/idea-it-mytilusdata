/** Rutas que requieren autenticación de usuario */
export const PROTECTED_ROUTES = [
	'/dashboard',
	'/centros',
	'/ciclos',
	'/registros',
	'/graficos',
	'/admin',
	'/investigador',
	'/perfil'
] as const;

/** Verifica si la ruta requiere autenticación de usuario */
export function isProtectedRoute(pathname: string): boolean {
	return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/** Verifica si el usuario tiene acceso a rutas de admin */
export function requiresAdminAccess(pathname: string): boolean {
	return pathname.startsWith('/admin');
}

/** Verifica si el usuario tiene acceso a rutas de investigador */
export function requiresInvestigadorAccess(pathname: string): boolean {
	return pathname.startsWith('/investigador');
}

/** Verifica si es la ruta de login */
export function isLoginRoute(pathname: string): boolean {
	return pathname.startsWith('/auth/login');
}

/** Verifica si es una ruta de API */
export function isApiRoute(pathname: string): boolean {
	return pathname.startsWith('/api/');
}