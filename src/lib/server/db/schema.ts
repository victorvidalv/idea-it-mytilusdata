import { pgTable, text, integer, real, boolean, timestamp, serial } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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

// --- ESTRUCTURA PRODUCTIVA ---

/**
 * Lugares (Centros de Cultivo): Ubicación geográfica de los centros.
 * Incluye latitud y longitud para análisis espacial e investigadores.
 */
export const lugares = pgTable('lugares', {
	id: serial('id').primaryKey(),
	nombre: text('nombre').notNull(),
	latitud: real('latitud'), // Necesario para correlación con datos satelitales
	longitud: real('longitud'),
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),
	createdAt: timestamp('created_at').defaultNow()
});

/**
 * Ciclos de Cultivo: Define el periodo desde siembra hasta cosecha.
 * Es la unidad temporal clave para el modelo predictivo sigmoidal.
 */
export const ciclos = pgTable('ciclos', {
	id: serial('id').primaryKey(),
	nombre: text('nombre').notNull(), // Ej: "Siembra Primavera 2025"
	fechaSiembra: timestamp('fecha_siembra', { mode: 'date' }).notNull(),
	fechaFinalizacion: timestamp('fecha_finalizacion', { mode: 'date' }),
	lugarId: integer('lugar_id')
		.notNull()
		.references(() => lugares.id),
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),
	activo: boolean('activo').default(true)
});

// --- TABLAS MAESTRAS (NORMALIZACIÓN) ---

/**
 * Tipos de Registro: Define qué se mide y su unidad de base.
 * Garantiza que el ETL convierta todo a una unidad canónica (mm, g, etc).
 */
export const tiposRegistro = pgTable('tipos_registro', {
	id: serial('id').primaryKey(),
	codigo: text('codigo').notNull().unique(), // Ej: 'TALLA', 'BIOMASA', 'TEMP_AGUA'
	unidadBase: text('unidad_base').notNull() // Ej: 'mm', 'g', 'C'
});

/**
 * Origen de Datos: Diferencia entre muestreo manual, satélite o PSMB.
 */
export const origenDatos = pgTable('origen_datos', {
	id: serial('id').primaryKey(),
	nombre: text('nombre').notNull() // Ej: 'Manual', 'Satelital', 'PSMB'
});

// --- HECHOS (MEDICIONES) ---

/**
 * Mediciones: Tabla central que almacena todos los datos.
 * El campo 'valor' debe estar siempre en la 'unidadBase' del tipo correspondiente.
 */
export const mediciones = pgTable('mediciones', {
	id: serial('id').primaryKey(),
	valor: real('valor').notNull(), // Valor numérico puro normalizado
	fechaMedicion: timestamp('fecha_medicion', { mode: 'date' }).notNull(),

	// Relaciones
	cicloId: integer('ciclo_id').references(() => ciclos.id), // Null si es dato ambiental de centro
	lugarId: integer('lugar_id')
		.notNull()
		.references(() => lugares.id),
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),
	tipoId: integer('tipo_id')
		.notNull()
		.references(() => tiposRegistro.id),
	origenId: integer('origen_id')
		.notNull()
		.references(() => origenDatos.id),

	notas: text('notas'),
	createdAt: timestamp('created_at').defaultNow()
});

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

// --- SEGURIDAD Y RATE LIMITING ---

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
