// Tipos para el dashboard de gráficos

export interface TipoRegistro {
	id: number;
	codigo: string;
	unidadBase: string;
}

export interface Centro {
	id: number;
	nombre: string;
	userId: number;
}

export interface Ciclo {
	id: number;
	nombre: string;
	lugarId: number;
}

export interface Registro {
	userId?: number;
	lugarId: number;
	cicloId: number | null;
	tipoId: number;
	valor: number;
	fechaMedicion: string;
	tipoCodigo?: string;
	tipoUnidad?: string;
}

export interface Usuario {
	id: number;
	nombre: string;
}

export interface DashboardData {
	tipos: TipoRegistro[];
	centros: Centro[];
	ciclos: Ciclo[];
	registros: Registro[];
	usuarios?: Usuario[];
}

export interface TipoEstadistica {
	codigo: string;
	unidad: string;
	promedio: number;
	min: number;
	max: number;
	cuenta: number;
}

export interface ChartSeriesItem {
	key: string;
	label: string;
	data: { date: Date; value: number }[];
	color: string;
}

export interface FiltrosState {
	selectedUserId: string;
	selectedCentroId: number;
	selectedCicloId: number;
	selectedTipoIds: Set<number>;
}

export interface Stats {
	total: number;
	porTipo: TipoEstadistica[];
}