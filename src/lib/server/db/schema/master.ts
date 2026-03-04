import { pgTable, text, serial } from 'drizzle-orm/pg-core';

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