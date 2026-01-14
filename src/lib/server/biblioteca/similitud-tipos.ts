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
 * Datos de incertidumbre del bootstrap paramétrico.
 */
export interface IncertidumbreProyeccionBackend {
	dias: number[];
	mediana: number[];
	limiteInferior: number[];
	limiteSuperior: number[];
}

/**
 * Datos de degradación temporal (walk-forward).
 */
export interface DegradacionRMSEBackend {
	meses: number[];
	rmse: number[];
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
	/** Incertidumbre calculada vía bootstrap paramétrico (solo ajuste local) */
	incertidumbre?: IncertidumbreProyeccionBackend;
	/** Degradación temporal walk-forward */
	degradacionRMSE?: DegradacionRMSEBackend;
	error?: string;
}
