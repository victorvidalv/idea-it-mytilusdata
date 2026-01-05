/**
 * Tipos e interfaces para el endpoint de proyección.
 */

/**
 * Request body para ejecutar proyección.
 */
export interface ProyeccionRequest {
	dias: number[];
	tallas: number[];
	tallaObjetivo?: number;
	diasMax?: number;
}

/**
 * Request body para exportar CSV.
 */
export interface ProyeccionCSVRequest {
	dias: number[];
	tallas: number[];
	tallaObjetivo?: number;
	diasMax?: number;
}

/**
 * Datos de medición con día calculado.
 */
export interface MedicionConDia {
	dia: number;
	talla: number;
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
	mediciones: MedicionConDia[];
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
	proyeccion: number[];
	curvaUsada: string;
	curvaReferencia: number[];
	metadatos: Record<string, unknown>;
}

/**
 * Resultado fallido de ejecución de proyección.
 */
export interface PostProyeccionError {
	success: false;
	error: string;
	metadatos?: Record<string, unknown>;
}

/**
 * Resultado de ejecución de proyección.
 */
export type PostProyeccionResult = PostProyeccionSuccess | PostProyeccionError;
