import { pgTable, text, integer, boolean, timestamp, serial } from 'drizzle-orm/pg-core';

// --- SISTEMA DE ACCESO Y SEGURIDAD ---

/**
 * Tabla de Usuarios: Soporta el aislamiento de datos (Multi-tenancy).
 * Cada dato productivo estará anclado a un ID de esta tabla.
 */
export const usuarios = pgTable('usuarios', {
	id: serial('id').primaryKey(),
	nombre: text('nombre').notNull(),
	email: text('email').notNull().unique(),
	rol: text('rol', { enum: ['ADMIN', 'INVESTIGADOR', 'USUARIO'] }).default('USUARIO'),
	activo: boolean('activo').default(true),
	createdAt: timestamp('created_at').defaultNow()
});

/**
 * Magic Links: Para autenticación Passwordless vía Resend.
 * Almacena hashes para evitar que el robo de la DB comprometa accesos activos.
 */
export const magicLinkTokens = pgTable('magic_link_tokens', {
	id: serial('id').primaryKey(),
	tokenHash: text('token_hash').notNull().unique(),
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	usedAt: timestamp('used_at', { mode: 'date' }),
	createdAt: timestamp('created_at').defaultNow()
});

/**
 * Sesiones: Valida el estado del JWT en cada request.
 * Permite invalidar sesiones cuando el usuario es desactivado o cambia de rol.
 * El JWT contiene el sessionId, no solo el userId.
 */
export const sesiones = pgTable('sesiones', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),
	tokenHash: text('token_hash').notNull().unique(),
	userAgent: text('user_agent'),
	ip: text('ip'),
	expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	invalidatedAt: timestamp('invalidated_at', { mode: 'date' })
});