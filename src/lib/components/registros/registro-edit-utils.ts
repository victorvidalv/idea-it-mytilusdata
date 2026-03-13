/**
 * Utilidades para el formulario de edición de registros.
 * Funciones auxiliares para conversión de valores y formato de datos.
 */

/**
 * Convierte un ID numérico (posiblemente nulo) a string para su uso en formularios.
 */
export function toIdString(value: number | null | undefined): string {
	return value?.toString() ?? '';
}

/**
 * Formatea una fecha para su uso en input datetime-local.
 */
export function formatDateForInput(date: Date | string | null): string {
	if (!date) return '';
	return new Date(date).toISOString().slice(0, 16);
}

/**
 * Busca el ID de un origen por su nombre y lo devuelve como string.
 */
export function findOrigenId(
	origenes: Array<{ id: number; nombre: string }>,
	nombre: string | null | undefined
): string {
	if (!nombre) return '';
	const origen = origenes.find((o) => o.nombre === nombre);
	return origen?.id?.toString() ?? '';
}

/**
 * Inicializa los valores del formulario de edición a partir de un registro.
 */
export function initEditFormValues(
	reg: {
		centroId?: number | null;
		cicloId?: number | null;
		tipoId?: number | null;
		origenNombre?: string | null;
		valor: number;
		fechaMedicion: Date | string | null;
		notas?: string | null;
	},
	origenes: Array<{ id: number; nombre: string }>
) {
	return {
		lugarId: toIdString(reg.centroId),
		cicloId: toIdString(reg.cicloId),
		tipoId: toIdString(reg.tipoId),
		origenId: findOrigenId(origenes, reg.origenNombre),
		valor: reg.valor?.toString() ?? '',
		fechaMedicion: formatDateForInput(reg.fechaMedicion),
		notas: reg.notas ?? ''
	};
}