// Parámetros sigmoidales para curva de proyección
export interface ParametrosSigmoidal {
	L: number; // Asíntota superior (talla máxima en mm)
	k: number; // Velocidad de crecimiento
	x0: number; // Punto de inflexión (día)
}

// Curva de referencia de la biblioteca
export interface CurvaReferencia {
	id: number;
	codigoReferencia: string;
	sse: number;
	parametros: ParametrosSigmoidal;
}

export interface PuntoProyeccion {
	dia: number;
	talla: number;
	tipo: 'dato' | 'proyeccion';
}

export interface Medicion {
	dia: number;
	talla: number;
}

export interface SerieData {
	key: string;
	label: string;
	data: { dia: number; talla: number }[];
	color: string;
}

export interface TablaDato {
	dia: number;
	talla: number;
	tipo: 'dato' | 'proyeccion';
}
