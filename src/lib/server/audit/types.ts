// --- Tipos de Acciones de Auditoría ---

export type AccionAuditoria =
	| 'LOGIN_SUCCESS'
	| 'LOGIN_FAILED'
	| 'LOGOUT'
	| 'MAGIC_LINK_SENT'
	| 'API_KEY_GENERATED'
	| 'API_KEY_REVOKED'
	| 'API_ACCESS'
	| 'DATA_EXPORT'
	| 'ROLE_CHANGE'
	| 'USER_CREATED';

// --- Interfaz de Parámetros ---

export interface AuditLogParams {
	userId?: number;
	accion: AccionAuditoria;
	entidad?: string;
	entidadId?: number;
	ip?: string;
	userAgent?: string;
	detalles?: Record<string, unknown>;
}