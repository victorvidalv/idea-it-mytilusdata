import type { ParametrosSigmoidal } from '$lib/server/db/schema';

/**
 * Datos de entrada del usuario.
 */
export interface DatosUsuario {
	dias: number[];
	tallas: number[];
}

/**
 * Configuración para la proyección.
 */
export interface ProyeccionConfig {
	tallaObjetivo?: number;
	diasMax?: number;
}

/**
 * Punto proyectado con día y talla.
 */
export interface PuntoProyectado {
	dia: number;
	talla: number;
	tipo: 'interpolado' | 'proyectado';
}

/**
 * Resultado completo de la proyección.
 */
export interface ResultadoProyeccion {
	success: boolean;
	proyeccion: PuntoProyectado[];
	curvaUsada: {
		id: number;
		codigoReferencia: string;
		sse: number;
		esCurvaLocal: boolean;
		r2?: number;
		parametros?: ParametrosSigmoidal;
	};
	/** Curva de referencia de la biblioteca (null si no hay biblioteca) */
	curvaReferencia: {
		id: number;
		codigoReferencia: string;
		sse: number;
		parametros: ParametrosSigmoidal;
	} | null;
	metadatos: {
		rangoDias: [number, number];
		rangoTallas: [number, number];
		tallaObjetivo?: number;
		diaObjetivo?: number;
		totalPuntos: number;
	};
	error?: string;
}
