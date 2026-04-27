import { pgTable, integer, real, jsonb, timestamp, serial, text } from 'drizzle-orm/pg-core';
import { ciclos } from './productive';
import { usuarios } from './auth';

// --- BIBLIOTECA DE PARÁMETROS SIGMOIDALES ---

/**
 * Tipo para los puntos de datos: {dia: talla}
 * Ejemplo: {"0": 15.5, "30": 25.2, "60": 38.7}
 */
export type PuntosTalla = Record<string, number>;

/**
 * Tipo para los parámetros calculados del modelo sigmoidal
 */
export type ParametrosSigmoidal = {
	L: number; // Asíntota superior (talla máxima en mm)
	k: number; // Tasa de crecimiento
	x0: number; // Punto de inflexión (día de crecimiento medio)
	r2: number; // Coeficiente de determinación
};

/**
 * Tipo para metadatos adicionales
 */
export type MetadatosBiblioteca = {
	origen?: string;
	[ key: string ]: unknown;
};

/**
 * Biblioteca: Almacena parámetros de curvas sigmoidales ajustadas por ciclo.
 * Cada registro representa un modelo predictivo con sus coeficientes
 * L, k, x0 y el coeficiente de determinación r2.
 *
 * El campo 'puntosJson' almacena {dia: talla} de las mediciones utilizadas
 * para el ajuste del modelo sigmoidal.
 */
export const biblioteca = pgTable('biblioteca', {
	id: serial('id').primaryKey(),

	// Código de referencia legible para humanos
	codigoReferencia: text('codigo_referencia').notNull(),

	// Ciclo de origen (usamos ciclo_origen_id que es el nombre existente en BD)
	cicloId: integer('ciclo_origen_id')
		.notNull()
		.references(() => ciclos.id),

	// Puntos de datos: {dia: talla} utilizados para el ajuste
	puntosJson: jsonb('puntos_json').$type<PuntosTalla>().notNull(),

	// Parámetros del modelo sigmoidal calculados
	parametrosCalculados: jsonb('parametros_calculados').$type<ParametrosSigmoidal>().notNull(),

	// Tipo de fórmula utilizada (por defecto LOGISTICO)
	formulaTipo: text('formula_tipo').notNull().default('LOGISTICO'),

	// Metadatos adicionales
	metadatos: jsonb('metadatos').$type<MetadatosBiblioteca>(),

	// Usuario propietario del registro
	userId: integer('user_id')
		.notNull()
		.references(() => usuarios.id),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});