import { pgTable, text, integer, boolean, timestamp, serial, real, index } from 'drizzle-orm/pg-core';
import { usuarios } from './auth';

// --- ESTRUCTURA PRODUCTIVA ---

/**
 * Lugares (Centros de Cultivo): Ubicación geográfica de los centros.
 * Usa columnas latitud/longitud (PostGIS no disponible en EasyPanel por defecto).
 */
export const lugares = pgTable('lugares', {
	id: serial('id').primaryKey(),
	nombre: text('nombre').notNull(),
	latitud: real('latitud'),
	longitud: real('longitud'),
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),
	createdAt: timestamp('created_at').defaultNow()
}, (table) => [
	index('idx_lugares_lat').on(table.latitud),
	index('idx_lugares_lon').on(table.longitud)
]);

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