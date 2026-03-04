import { pgTable, text, integer, real, timestamp, serial } from 'drizzle-orm/pg-core';
import { ciclos, lugares } from './productive';
import { usuarios } from './auth';
import { tiposRegistro } from './master';
import { origenDatos } from './master';

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