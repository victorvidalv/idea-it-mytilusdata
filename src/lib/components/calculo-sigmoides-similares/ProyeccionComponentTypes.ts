/**
 * Tipos compartidos para los componentes del módulo de proyección.
 */

export interface Lugar {
	id: number;
	nombre: string;
}

export interface Ciclo {
	id: number;
	nombre: string;
	lugarId: number;
	fechaSiembra: string | Date;
}

export interface MedicionCargada {
	fecha: string;
	diaCultivo?: number;
	talla: number;
	biomasa?: number;
	densidad?: number;
	temperatura?: number;
}

export interface MedicionesCicloCargadas {
	mediciones: MedicionCargada[];
	fechaSiembra?: string;
}

export interface PuntoProyeccion {
	dia: number;
	talla: number;
	tipo: 'dato' | 'proyeccion' | 'interpolado' | 'proyectado';
}

export interface ParametrosSigmoidal extends Record<string, number> {
	L: number;
	k: number;
	x0: number;
}

export interface CurvaUsada {
	id: number;
	codigoReferencia: string;
	sse: number;
	esCurvaLocal: boolean;
	r2?: number;
	parametros?: ParametrosSigmoidal | Record<string, number>;
}

export interface CurvaReferencia {
	id: number;
	codigoReferencia: string;
	sse: number;
	parametros: ParametrosSigmoidal;
}

export interface Metadatos {
	rangoDias: string | [number, number];
	rangoTallas: string | [number, number];
	fechaSiembra?: string;
	primerDiaObservado?: number;
	ultimoDiaObservado?: number;
	tallaObjetivo?: number;
	diaObjetivo?: number;
	fechaObjetivo?: string;
	diaInicioProyeccion?: number;
	horizonteDias?: number;
	horizonteMeses?: number;
	modeloUsado?: string;
	totalPuntos: number;
}

export interface Ajuste {
	visible: boolean;
	tipo: string;
	descripcion: string;
}

export interface IncertidumbreProyeccion {
	dias: number[];
	mediana: number[];
	limiteInferior: number[];
	limiteSuperior: number[];
}

export interface DegradacionRMSE {
	meses: number[];
	rmse: number[];
}

export interface ModeloPrediccion {
	id: string;
	nombre: string;
	descripcion: string;
	modelType: 'Matematico' | 'ML' | 'Estadistico';
	featuresRequired: string[];
	featuresOptional: string[];
	minPoints: number;
	supportsUncertainty: boolean;
	supportsTargetDate: boolean;
	status: 'Estable' | 'Experimental';
}

export interface ResultadoProyeccion {
	success: boolean;
	proyeccion?: PuntoProyeccion[];
	curvaUsada?: CurvaUsada;
	curvaReferencia?: CurvaReferencia;
	metadatos?: Metadatos;
	incertidumbre?: IncertidumbreProyeccion;
	degradacionRMSE?: DegradacionRMSE;
	modeloUsado?: string;
	metricas?: Record<string, number>;
	warnings?: string[];
	metadata?: Record<string, unknown>;
	error?: string;
}

export interface ProyeccionRequest {
	fechaSiembra?: string;
	fechas: string[];
	tallas: number[];
	tallaObjetivo?: number;
	modelo?: string;
	horizon?: number;
}

export function formatearFormulaSigmoidal(p: ParametrosSigmoidal, nombre: string): string {
    return `${nombre}(t) = ${p.L.toFixed(1)} / (1 + e^(-${p.k.toFixed(4)} · (t - ${p.x0.toFixed(1)})))`;
}

export const R2_LEVELS = [
    { min: 0.98, texto: 'Excelente', clase: 'text-green-500' },
    { min: 0.95, texto: 'Muy bueno', clase: 'text-emerald-500' },
    { min: 0.90, texto: 'Bueno', clase: 'text-blue-500' },
    { min: 0.85, texto: 'Aceptable', clase: 'text-yellow-500' }
];

export function calificarR2(r2: number | undefined) {
    if (r2 === undefined) return null;
    return R2_LEVELS.find(l => r2 >= l.min) || { texto: 'Bajo', clase: 'text-red-500' };
}
