import { pgTable, text, integer, boolean, timestamp, serial, real, geometry, index } from 'drizzle-orm/pg-core';
import { usuarios } from './auth';

// --- ESTRUCTURA PRODUCTIVA ---

/**
 * Lugares (Centros de Cultivo): Ubicación geográfica de los centros.
 * Incluye columna geom (PostGIS) para operaciones espaciales, junto con
 * columnas latitud/longitud legacy para compatibilidad durante la migración.
 *
 * TIPO GEOMETRY: Usa PostGIS geometry(Point, 4326) con SRID WGS84.
 * - x = longitud, y = latitud
 * - Permite consultas espaciales eficientes con índice GIST
 * - Compatible con GeoJSON y MapLibre
 */
export const lugares = pgTable('lugares', {
	id: serial('id').primaryKey(),
	nombre: text('nombre').notNull(),
	// Columna PostGIS para almacenar punto geográfico (x=longitud, y=latitud)
	geom: geometry('geom', { type: 'point', mode: 'xy', srid: 4326 }),
	// Columnas legacy - mantener durante migración para rollback
	latitud: real('latitud'),
	longitud: real('longitud'),
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),
	createdAt: timestamp('created_at').defaultNow()
}, (table) => [
	index('idx_lugares_geom').using('gist', table.geom)
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