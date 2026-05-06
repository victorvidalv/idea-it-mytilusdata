/**
 * Datos estáticos del sistema de permisos.
 *
 * Este archivo contiene únicamente constantes y tipos de datos.
 * Es importado por permissions.ts para separar datos de lógica.
 */

// =============================================================================
// ROLES
// =============================================================================

/** Definición de roles (evita importar desde $lib/server/ para uso en cliente) */
export const ROLES = {
	USUARIO: 'USUARIO',
	INVESTIGADOR: 'INVESTIGADOR',
	ADMIN: 'ADMIN'
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

// =============================================================================
// TIPOS
// =============================================================================

/** Entidades que tienen control de permisos */
export type Entidad = 'centros' | 'ciclos' | 'registros' | 'origenes';

/** Permisos disponibles sobre una entidad */
export interface PermisosEntidad {
	/** Puede ver registros de la entidad */
	canView: boolean;
	/** Puede ver TODOS los registros (no solo los propios) */
	canViewAll: boolean;
	/** Puede crear nuevos registros */
	canCreate: boolean;
	/** Puede editar cualquier registro (sin importar dueño) */
	canEdit: boolean;
	/** Puede editar solo sus propios registros */
	canEditOwn: boolean;
	/** Puede eliminar cualquier registro */
	canDelete: boolean;
	/** Puede eliminar solo sus propios registros */
	canDeleteOwn: boolean;
}

/** Permisos completos de un rol */
export interface PermisosRol {
	role: Rol;
	label: string;
	entidades: Record<Entidad, PermisosEntidad>;
	rutasExtras: string[];
}

/** Elemento de navegación */
export interface ItemNavegacion {
	label: string;
	href: string;
	icon?: string;
}

// =============================================================================
// CONFIGURACIÓN DE PERMISOS POR ROL
// =============================================================================

/**
 * Permisos base para usuarios regulares.
 * Solo ve y edita sus propios datos.
 */
export const PERMISOS_USUARIO: PermisosRol = {
	role: ROLES.USUARIO,
	label: 'Usuario',
	entidades: {
		centros: { canView: true, canViewAll: false, canCreate: true, canEdit: false, canEditOwn: true, canDelete: false, canDeleteOwn: true },
		ciclos: { canView: true, canViewAll: false, canCreate: true, canEdit: false, canEditOwn: true, canDelete: false, canDeleteOwn: true },
		registros: { canView: true, canViewAll: false, canCreate: true, canEdit: false, canEditOwn: true, canDelete: false, canDeleteOwn: true },
		origenes: { canView: true, canViewAll: false, canCreate: true, canEdit: false, canEditOwn: true, canDelete: false, canDeleteOwn: true }
	},
	rutasExtras: []
};

/**
 * Permisos para investigadores.
 * Ve todos los datos pero solo edita/elimina los suyos.
 */
export const PERMISOS_INVESTIGADOR: PermisosRol = {
	role: ROLES.INVESTIGADOR,
	label: 'Investigador',
	entidades: {
		centros: { canView: true, canViewAll: true, canCreate: true, canEdit: false, canEditOwn: true, canDelete: false, canDeleteOwn: true },
		ciclos: { canView: true, canViewAll: true, canCreate: true, canEdit: false, canEditOwn: true, canDelete: false, canDeleteOwn: true },
		registros: { canView: true, canViewAll: true, canCreate: true, canEdit: false, canEditOwn: true, canDelete: false, canDeleteOwn: true },
		origenes: { canView: true, canViewAll: true, canCreate: true, canEdit: false, canEditOwn: true, canDelete: false, canDeleteOwn: true }
	},
	rutasExtras: ['/investigador']
};

/**
 * Permisos para administradores.
 * Acceso total sin restricciones.
 */
export const PERMISOS_ADMIN: PermisosRol = {
	role: ROLES.ADMIN,
	label: 'Administrador',
	entidades: {
		centros: { canView: true, canViewAll: true, canCreate: true, canEdit: true, canEditOwn: true, canDelete: true, canDeleteOwn: true },
		ciclos: { canView: true, canViewAll: true, canCreate: true, canEdit: true, canEditOwn: true, canDelete: true, canDeleteOwn: true },
		registros: { canView: true, canViewAll: true, canCreate: true, canEdit: true, canEditOwn: true, canDelete: true, canDeleteOwn: true },
		origenes: { canView: true, canViewAll: true, canCreate: true, canEdit: true, canEditOwn: true, canDelete: true, canDeleteOwn: true }
	},
	rutasExtras: ['/admin', '/usuarios', '/investigador']
};

/** Mapa de permisos por rol */
export const MAPA_PERMISOS: Record<Rol, PermisosRol> = {
	USUARIO: PERMISOS_USUARIO,
	INVESTIGADOR: PERMISOS_INVESTIGADOR,
	ADMIN: PERMISOS_ADMIN
};

// =============================================================================
// NAVEGACIÓN
// =============================================================================

/**
 * Navegación base (compartida por USUARIO e INVESTIGADOR).
 * ADMIN tiene navegación adicional.
 */
export const NAVEGACION_BASE: ItemNavegacion[] = [
	{ label: 'Dashboard', href: '/dashboard', icon: 'home' },
	{ label: 'Centros', href: '/centros', icon: 'map-pin' },
	{ label: 'Ciclos', href: '/ciclos', icon: 'refresh-cw' },
	{ label: 'Registros', href: '/registros', icon: 'clipboard-list' },
	{ label: 'Orígenes', href: '/origenes', icon: 'database' },
	{ label: 'Gráficos', href: '/graficos', icon: 'bar-chart-2' }
];

/** Navegación adicional para ADMIN */
export const NAVEGACION_ADMIN: ItemNavegacion[] = [
	{ label: 'Usuarios', href: '/usuarios', icon: 'users' },
	{ label: 'Investigador', href: '/investigador', icon: 'search' }
];

/** Navegación completa por rol */
export const MAPA_NAVEGACION: Record<Rol, ItemNavegacion[]> = {
	USUARIO: NAVEGACION_BASE,
	INVESTIGADOR: NAVEGACION_BASE,
	ADMIN: [...NAVEGACION_BASE, ...NAVEGACION_ADMIN]
};

/** Rutas base accesibles para todos los usuarios autenticados */
export const RUTAS_BASE = ['/dashboard', '/centros', '/ciclos', '/registros', '/origenes', '/graficos'] as const;
