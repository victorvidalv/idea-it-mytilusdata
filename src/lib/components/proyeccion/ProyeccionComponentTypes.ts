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
	dia: number;
	talla: number;
}

export interface PuntoProyeccion {
	dia: number;
	talla: number;
	tipo: 'dato' | 'proyeccion' | 'interpolado' | 'proyectado';
}

export interface ParametrosSigmoidal {
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
	parametros?: ParametrosSigmoidal;
}

export interface CurvaReferencia {
	id: number;
	codigoReferencia: string;
	sse: number;
	parametros: ParametrosSigmoidal;
}

export interface Metadatos {
	rangoDias: string;
	rangoTallas: string;
	tallaObjetivo?: number;
	diaObjetivo?: number;
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

export interface ResultadoProyeccion {
	success: boolean;
	proyeccion?: PuntoProyeccion[];
	curvaUsada?: CurvaUsada;
	curvaReferencia?: CurvaReferencia;
	metadatos?: Metadatos;
	incertidumbre?: IncertidumbreProyeccion;
	degradacionRMSE?: DegradacionRMSE;
	error?: string;
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
