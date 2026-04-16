/**
 * Tipos para el componente RegistroRow y componentes relacionados.
 * Extraídos para reducir complejidad ciclomática del componente principal.
 */

export interface RegistroRowData {
	id: number;
	centroId?: number | null;
	centroNombre: string;
	cicloId?: number | null;
	cicloNombre?: string | null;
	tipoId?: number | null;
	tipoNombre?: string | null;
	origenNombre?: string | null;
	valor: number;
	unidad?: string | null;
	fechaMedicion: Date | string | null;
	notas?: string | null;
	isOwner: boolean;
}

export interface RegistroPageData {
	centros: Array<{ id: number; nombre: string }>;
	ciclos: Array<{ id: number; nombre: string; lugarId: number }>;
	tipos: Array<{ id: number; codigo: string; unidadBase: string }>;
	origenes: Array<{ id: number; nombre: string }>;
}

/**
 * Estado de edición para la fila de registro.
 * Agrupa props relacionadas para reducir complejidad ciclomática.
 */
export interface EditState {
	editingId: number | null;
	onEdit: (reg: unknown) => void;
	onCancel: () => void;
}