// Re-exports centralizados
export type { AccionAuditoria, AuditLogParams } from './types';
export { logAuditEvent } from './log';
export {
	logLoginSuccess,
	logLoginFailed,
	logMagicLinkSent,
	logLogout,
	logApiKeyGenerated,
	logApiKeyRevoked,
	logApiAccess,
	logDataExport,
	logUserCreated,
	logRoleChange
} from './convenience';