import { pgTable, text, integer, timestamp, serial } from 'drizzle-orm/pg-core';
import { usuarios } from './auth';

// --- AUDITORÍA ---

/**
 * Audit Logs: Registro de eventos de seguridad y acciones importantes.
 * Permite rastrear actividades sospechosas y cumplir con requisitos de auditoría.
 */
export const auditLogs = pgTable('audit_logs', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').references(() => usuarios.id),
	accion: text('accion').notNull(), // 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', etc.
	entidad: text('entidad'), // 'usuario', 'medicion', 'centro', etc.
	entidadId: integer('entidad_id'),
	ip: text('ip'),
	userAgent: text('user_agent'),
	detalles: text('detalles'), // JSON stringificado para info adicional
	createdAt: timestamp('created_at').defaultNow()
});