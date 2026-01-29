/**
 * Tipos e interfaces para el endpoint de proyección.
 */

/**
 * Request body para ejecutar proyección.
 * Ahora usa fechas reales en lugar de días relativos.
 * Soporta datos multivariables opcionales.
 */
export interface ProyeccionRequest {
	/** Fecha de siembra del ciclo: día productivo 0 para calcular dia_cultivo. */
	fechaSiembra?: string;
	fechas: string[];
	tallas: number[];
	tallaObjetivo?: number;
	diasMax?: number;
	modelo?: string;
	// Campos multivariables opcionales
	biomasas?: number[];
	densidades?: number[];
	temperaturas?: number[];
	features?: Array<Record<string, number>>;
	horizon?: number;
}

/**
 * Request body para exportar CSV.
 */
export interface ProyeccionCSVRequest {
	fechas: string[];
	tallas: number[];
	tallaObjetivo?: number;
	diasMax?: number;
	modelo?: string;
}

/**
 * Datos de medición con fecha real (ISO).
 * La API se encarga de calcular días internamente.
 * Soporta campos multivariables opcionales.
 */
export interface MedicionConFecha {
	fecha: string;
	diaCultivo?: number;
	talla: number;
	biomasa?: number;
	densidad?: number;
	temperatura?: number;
	features?: Record<string, number>;
}

/**
 * Información básica de un ciclo para proyección.
 */
export interface CicloInfo {
	id: number;
	nombre: string;
	fechaSiembra: Date;
}

/**
 * Resultado exitoso de obtener mediciones para proyección.
 */
export interface GetProyeccionSuccess {
	success: true;
	ciclo: CicloInfo;
	mediciones: MedicionConFecha[];
}

/**
 * Resultado fallido de obtener mediciones para proyección.
 */
export interface GetProyeccionError {
	success: false;
	error: string;
	totalMediciones?: number;
}

/**
 * Resultado de obtener mediciones para proyección.
 */
export type GetProyeccionResult = GetProyeccionSuccess | GetProyeccionError;

/**
 * Resultado exitoso de ejecución de proyección.
 */
export interface PostProyeccionSuccess {
	success: true;
	proyeccion: Array<{ dia: number; talla: number; tipo: string }>;
	curvaUsada: {
		id: number;
		codigoReferencia: string;
		sse: number;
		esCurvaLocal: boolean;
		r2?: number;
		parametros?: Record<string, number>;
	};
	metadatos: Record<string, unknown>;
	modeloUsado?: string;
	metricas?: Record<string, number>;
	incertidumbre?: {
		dias: number[];
		mediana: number[];
		limiteInferior: number[];
		limiteSuperior: number[];
	};
	warnings?: string[];
}

/**
 * Resultado fallido de ejecución de proyección.
 */
export interface PostProyeccionError {
	success: false;
	error: string;
	metadatos?: Record<string, unknown>;
	warnings?: string[];
}

/**
 * Resultado de ejecución de proyección.
 */
export type PostProyeccionResult = PostProyeccionSuccess | PostProyeccionError;
