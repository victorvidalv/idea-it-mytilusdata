import { db } from './db';
import { auditLogs } from './db/schema';

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

// --- Función Principal de Auditoría ---

/**
 * Registra un evento de auditoría en la base de datos.
 * @param params - Parámetros del evento de auditoría
 */
export async function logAuditEvent(params: AuditLogParams): Promise<void> {
	const { userId, accion, entidad, entidadId, ip, userAgent, detalles } = params;

	try {
		await db.insert(auditLogs).values({
			userId: userId ?? null,
			accion,
			entidad: entidad ?? null,
			entidadId: entidadId ?? null,
			ip: ip ?? null,
			userAgent: userAgent ?? null,
			detalles: detalles ? JSON.stringify(detalles) : null
		});
	} catch (error) {
		// No lanzar error para no interrumpir el flujo principal
		console.error('Error registrando evento de auditoría:', error);
	}
}

// --- Funciones de Conveniencia ---

/**
 * Registra un intento de login exitoso.
 */
export async function logLoginSuccess(params: {
	userId: number;
	ip?: string;
	userAgent?: string;
}): Promise<void> {
	await logAuditEvent({
		userId: params.userId,
		accion: 'LOGIN_SUCCESS',
		entidad: 'usuario',
		entidadId: params.userId,
		ip: params.ip,
		userAgent: params.userAgent
	});
}

/**
 * Registra un intento de login fallido.
 */
export async function logLoginFailed(params: {
	email: string;
	ip?: string;
	userAgent?: string;
	reason?: string;
}): Promise<void> {
	await logAuditEvent({
		accion: 'LOGIN_FAILED',
		entidad: 'usuario',
		ip: params.ip,
		userAgent: params.userAgent,
		detalles: { email: params.email, reason: params.reason }
	});
}

/**
 * Registra el envío de un magic link.
 */
export async function logMagicLinkSent(params: {
	userId?: number;
	email: string;
	ip?: string;
}): Promise<void> {
	await logAuditEvent({
		userId: params.userId,
		accion: 'MAGIC_LINK_SENT',
		entidad: 'usuario',
		ip: params.ip,
		detalles: { email: params.email }
	});
}

/**
 * Registra un logout.
 */
export async function logLogout(params: {
	userId: number;
	ip?: string;
	userAgent?: string;
}): Promise<void> {
	await logAuditEvent({
		userId: params.userId,
		accion: 'LOGOUT',
		entidad: 'usuario',
		entidadId: params.userId,
		ip: params.ip,
		userAgent: params.userAgent
	});
}

/**
 * Registra la generación de una API key.
 */
export async function logApiKeyGenerated(params: {
	userId: number;
	ip?: string;
	userAgent?: string;
}): Promise<void> {
	await logAuditEvent({
		userId: params.userId,
		accion: 'API_KEY_GENERATED',
		entidad: 'api_key',
		entidadId: params.userId,
		ip: params.ip,
		userAgent: params.userAgent
	});
}

/**
 * Registra la revocación de una API key.
 */
export async function logApiKeyRevoked(params: {
	userId: number;
	ip?: string;
	userAgent?: string;
}): Promise<void> {
	await logAuditEvent({
		userId: params.userId,
		accion: 'API_KEY_REVOKED',
		entidad: 'api_key',
		entidadId: params.userId,
		ip: params.ip,
		userAgent: params.userAgent
	});
}

/**
 * Registra el acceso a la API.
 */
export async function logApiAccess(params: {
	userId: number;
	endpoint: string;
	method: string;
	ip?: string;
	userAgent?: string;
}): Promise<void> {
	await logAuditEvent({
		userId: params.userId,
		accion: 'API_ACCESS',
		entidad: 'api',
		ip: params.ip,
		userAgent: params.userAgent,
		detalles: { endpoint: params.endpoint, method: params.method }
	});
}

/**
 * Registra una exportación de datos.
 */
export async function logDataExport(params: {
	userId: number;
	format: string;
	ip?: string;
	userAgent?: string;
}): Promise<void> {
	await logAuditEvent({
		userId: params.userId,
		accion: 'DATA_EXPORT',
		entidad: 'export',
		entidadId: params.userId,
		ip: params.ip,
		userAgent: params.userAgent,
		detalles: { format: params.format }
	});
}

/**
 * Registra la creación de un usuario.
 */
export async function logUserCreated(params: {
	userId: number;
	email: string;
	ip?: string;
	userAgent?: string;
}): Promise<void> {
	await logAuditEvent({
		userId: params.userId,
		accion: 'USER_CREATED',
		entidad: 'usuario',
		entidadId: params.userId,
		ip: params.ip,
		userAgent: params.userAgent,
		detalles: { email: params.email }
	});
}

/**
 * Registra un cambio de rol.
 */
export async function logRoleChange(params: {
	userId: number;
	oldRole: string;
	newRole: string;
	changedBy: number;
	ip?: string;
}): Promise<void> {
	await logAuditEvent({
		userId: params.changedBy,
		accion: 'ROLE_CHANGE',
		entidad: 'usuario',
		entidadId: params.userId,
		ip: params.ip,
		detalles: { oldRole: params.oldRole, newRole: params.newRole }
	});
}
