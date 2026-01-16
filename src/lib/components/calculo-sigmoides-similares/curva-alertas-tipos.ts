import type { ParametrosSigmoidal } from './proyeccionUtils';

// Tipo de alerta
export interface Alerta {
	tipo: 'warning' | 'info';
	titulo: string;
	mensaje: string;
}

// Parámetros necesarios para generar alertas
export interface ParametrosAlertas {
	totalPuntos: number;
	mediciones: { dia: number; talla: number }[];
	esCurvaLocal: boolean;
	r2?: number;
	parametros?: ParametrosSigmoidal;
	tallaObjetivo?: number;
}
