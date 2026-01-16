import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// --- SISTEMA DE ACCESO Y SEGURIDAD ---

/**
 * Tabla de Usuarios: Soporta el aislamiento de datos (Multi-tenancy).
 * Cada dato productivo estará anclado a un ID de esta tabla.
 */
export const usuarios = sqliteTable('usuarios', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	nombre: text('nombre').notNull(),
	email: text('email').notNull().unique(),
	rol: text('rol', { enum: ['ADMIN', 'INVESTIGADOR', 'USUARIO'] }).default('USUARIO'),
	activo: integer('activo', { mode: 'boolean' }).default(true),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * Magic Links: Para autenticación Passwordless vía Resend.
 * Almacena hashes para evitar que el robo de la DB comprometa accesos activos.
 */
export const magicLinkTokens = sqliteTable('magic_link_tokens', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	tokenHash: text('token_hash').notNull().unique(),
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
	usedAt: integer('used_at', { mode: 'timestamp' }),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// --- ESTRUCTURA PRODUCTIVA ---

/**
 * Lugares (Centros de Cultivo): Ubicación geográfica de los centros.
 * Incluye latitud y longitud para análisis espacial e investigadores.
 */
export const lugares = sqliteTable('lugares', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	nombre: text('nombre').notNull(),
	latitud: real('latitud'), // Necesario para correlación con datos satelitales
	longitud: real('longitud'),
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * Ciclos de Cultivo: Define el periodo desde siembra hasta cosecha.
 * Es la unidad temporal clave para el modelo predictivo sigmoidal.
 */
export const ciclos = sqliteTable('ciclos', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	nombre: text('nombre').notNull(), // Ej: "Siembra Primavera 2025"
	fechaSiembra: integer('fecha_siembra', { mode: 'timestamp' }).notNull(),
	fechaFinalizacion: integer('fecha_finalizacion', { mode: 'timestamp' }),
	lugarId: integer('lugar_id')
		.notNull()
		.references(() => lugares.id),
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),
	activo: integer('activo', { mode: 'boolean' }).default(true)
});

// --- TABLAS MAESTRAS (NORMALIZACIÓN) ---

/**
 * Tipos de Registro: Define qué se mide y su unidad de base.
 * Garantiza que el ETL convierta todo a una unidad canónica (mm, g, etc).
 */
export const tiposRegistro = sqliteTable('tipos_registro', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	codigo: text('codigo').notNull().unique(), // Ej: 'TALLA', 'BIOMASA', 'TEMP_AGUA'
	unidadBase: text('unidad_base').notNull() // Ej: 'mm', 'g', 'C'
});

/**
 * Origen de Datos: Diferencia entre muestreo manual, satélite o PSMB.
 */
export const origenDatos = sqliteTable('origen_datos', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	nombre: text('nombre').notNull() // Ej: 'Manual', 'Satelital', 'PSMB'
});

// --- HECHOS (MEDICIONES) ---

/**
 * Mediciones: Tabla central que almacena todos los datos.
 * El campo 'valor' debe estar siempre en la 'unidadBase' del tipo correspondiente.
 */
export const mediciones = sqliteTable('mediciones', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	valor: real('valor').notNull(), // Valor numérico puro normalizado
	fechaMedicion: integer('fecha_medicion', { mode: 'timestamp' }).notNull(),

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
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * Consentimientos: Registro legal para cumplimiento de Ley 19.628.
 */
export const consentimientos = sqliteTable('consentimientos', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),
	versionDocumento: text('version_documento').notNull(),
	fechaAceptacion: text('fecha_aceptacion').default(sql`CURRENT_TIMESTAMP`),
	ipOrigen: text('ip_origen')
});

/**
 * API Keys: Acceso programático a los datos del usuario.
 * Solo se permite una clave por usuario.
 */
export const apiKeys = sqliteTable('api_keys', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	key: text('key').notNull().unique(),
	userId: integer('user_id')
		.notNull()
		.unique()
		.references(() => usuarios.id),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});
