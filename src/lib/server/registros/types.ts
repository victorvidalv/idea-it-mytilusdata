/**
 * Tipos específicos del módulo de registros de mediciones.
 */

import type { lugares, ciclos, tiposRegistro, origenDatos } from '$lib/server/db/schema';

/** Registro con permisos calculados para la UI */
export type RegistroConPermisos = {
	id: number;
	valor: number;
	fechaMedicion: Date;
	notas: string | null;
	centroId: number;
	centroNombre: string;
	cicloId: number | null;
	cicloNombre: string | null;
	tipoId: number;
	tipoNombre: string;
	unidad: string | null;
	origenNombre: string;
	userId: number;
	isOwner: boolean;
};

/** Datos del formulario de creación/edición de registro */
export type RegistroFormData = {
	lugarId: number;
	cicloId?: number | null | undefined;
	tipoId: number;
	origenId: number;
	valor: number;
	fechaMedicion: string;
	notas: string;
};

/** Tipo para datos de actualización de medición */
export type MedicionUpdateData = {
	valor: number;
	fechaMedicion: Date;
	lugarId: number;
	cicloId: number | null;
	tipoId: number;
	origenId: number;
	notas: string;
};

/** Tipo inferido de la tabla lugares */
export type Centro = typeof lugares.$inferSelect;

/** Tipo inferido de la tabla ciclos */
export type Ciclo = typeof ciclos.$inferSelect;

/** Tipo inferido de la tabla tiposRegistro */
export type TipoRegistro = typeof tiposRegistro.$inferSelect;

/** Tipo inferido de la tabla origenDatos */
export type OrigenDatos = typeof origenDatos.$inferSelect;