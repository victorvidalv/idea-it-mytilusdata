Aunque usarás **SQLite** para desarrollo local, este código está diseñado para ser fácilmente migrable a **PostgreSQL** (cambiando los imports de `sqlite-core` a `pg-core`), manteniendo la lógica de negocio intacta.

### Estructura de Archivos Recomendada

```text
src/lib/server/db/
├── schema.ts        <-- Este archivo
└── index.ts         <-- Configuración del cliente drizzle

```

### Esquema de Base de Datos (`schema.ts`)

```typescript
import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// --- SISTEMA DE ACCESO Y SEGURIDAD ---

/**
 * Tabla de Usuarios: Soporta el aislamiento de datos (Multi-tenancy).
 * [cite_start]Cada dato productivo estará anclado a un ID de esta tabla[cite: 147].
 */
export const usuarios = sqliteTable('usuarios', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	nombre: text('nombre').notNull(),
	email: text('email').notNull().unique(),
	rol: text('rol', { enum: ['ADMIN', 'EQUIPO', 'PUBLICO'] }).default('PUBLICO'),
	activo: integer('activo', { mode: 'boolean' }).default(true),
	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

/**
 * Magic Links: Para autenticación Passwordless vía Resend.
 * [cite_start]Almacena hashes para evitar que el robo de la DB comprometa accesos activos[cite: 314].
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
 * [cite_start]Lugares (Centros de Cultivo): Ubicación geográfica de los centros[cite: 115].
 * [cite_start]Incluye latitud y longitud para análisis espacial e investigadores[cite: 124].
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
 * [cite_start]Ciclos de Cultivo: Define el periodo desde siembra hasta cosecha[cite: 107].
 * [cite_start]Es la unidad temporal clave para el modelo predictivo sigmoidal[cite: 117].
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
 * [cite_start]Tipos de Registro: Define qué se mide y su unidad de base[cite: 520, 530].
 * [cite_start]Garantiza que el ETL convierta todo a una unidad canónica (mm, g, etc)[cite: 518].
 */
export const tiposRegistro = sqliteTable('tipos_registro', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	codigo: text('codigo').notNull().unique(), // Ej: 'TALLA', 'BIOMASA', 'TEMP_AGUA'
	unidadBase: text('unidad_base').notNull() // Ej: 'mm', 'g', 'C'
});

/**
 * [cite_start]Origen de Datos: Diferencia entre muestreo manual, satélite o PSMB[cite: 126, 407].
 */
export const origenDatos = sqliteTable('origen_datos', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	nombre: text('nombre').notNull() // Ej: 'Manual', 'Satelital', 'PSMB'
});

// --- HECHOS (MEDICIONES) ---

/**
 * Mediciones: Tabla central que almacena todos los datos.
 * [cite_start]El campo 'valor' debe estar siempre en la 'unidadBase' del tipo correspondiente[cite: 521].
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
 * [cite_start]Consentimientos: Registro legal para cumplimiento de Ley 19.628[cite: 311, 350].
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
```

### Notas Técnicas para el Agente de IA

1.  **Multi-tenancy:** Todas las consultas de lectura en la plataforma deben incluir un filtro `where(eq(schema.mediciones.userId, session.userId))`.

2.  **Aislamiento Ambiental:** Si `cicloId` es `NULL`, la medición se considera un "Forzante Ambiental" (SST, Clorofila, etc.) que afecta a todos los ciclos de ese centro (`lugarId`).

3.  **Lógica del ETL:** Antes de insertar en `mediciones`, el código debe verificar el `tipoId`. Si el usuario ingresa "cm" para un tipo cuya `unidadBase` es "mm", el valor se debe multiplicar por 10 **antes** del `insert`.

4.  **Modelo Predictivo:** Para alimentar el microservicio de Python, se deben extraer únicamente las mediciones donde `origenId` corresponda a fuentes validadas (Manual/Histórico) y `tipoId` sea 'TALLA' o 'BIOMASA'.
