import { db } from '../db';
import { auditLogs } from '../db/schema';
import type { AuditLogParams } from './types';

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