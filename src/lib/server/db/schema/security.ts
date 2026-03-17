import { pgTable, text, integer, timestamp, serial } from 'drizzle-orm/pg-core';
import { usuarios } from './auth';

// --- SEGURIDAD Y RATE LIMITING ---

/**
 * Consentimientos: Registro legal para cumplimiento de Ley 19.628.
 */
export const consentimientos = pgTable('consentimientos', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),
	versionDocumento: text('version_documento').notNull(),
	fechaAceptacion: timestamp('fecha_aceptacion').defaultNow(),
	ipOrigen: text('ip_origen')
});

/**
 * API Keys: Acceso programático a los datos del usuario.
 * Solo se permite una clave por usuario.
 */
export const apiKeys = pgTable('api_keys', {
	id: serial('id').primaryKey(),
	key: text('key').notNull().unique(),
	userId: integer('user_id')
		.notNull()
		.unique()
		.references(() => usuarios.id),
	createdAt: timestamp('created_at').defaultNow()
});

/**
 * Rate Limit Logs: Registra intentos de login para prevenir abuso.
 * Se usa para limitar intentos por IP y por email.
 */
export const rateLimitLogs = pgTable('rate_limit_logs', {
	id: serial('id').primaryKey(),
	identifier: text('identifier').notNull(), // IP o email
	tipo: text('tipo', { enum: ['IP', 'EMAIL'] }).notNull(),
	createdAt: timestamp('created_at').defaultNow()
});

/**
 * Email Cooldowns: Controla el tiempo entre envíos de email.
 * Previene spam de magic links al mismo correo.
 */
export const emailCooldowns = pgTable('email_cooldowns', {
	id: serial('id').primaryKey(),
	email: text('email').notNull().unique(),
	lastSentAt: timestamp('last_sent_at').notNull()
});