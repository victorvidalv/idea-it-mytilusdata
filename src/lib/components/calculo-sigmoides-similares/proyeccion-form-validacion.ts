/**
 * Validación de puntos manuales para el formulario de proyección.
 * Ahora usa fechas reales en lugar de días relativos.
 */

interface ResultadoValidacion {
	fecha: string;
	talla: number;
	error: string | null;
}

function validarFecha(fecha: string): string | null {
	if (!fecha || fecha.trim() === '') return 'Ingresa una fecha válida';
	const fechaObj = new Date(fecha);
	if (isNaN(fechaObj.getTime())) return 'La fecha no es válida';
	return null;
}

function validarTalla(talla: number): string | null {
	if (isNaN(talla)) return 'Ingresa una talla válida';
	if (talla <= 0 || talla > 200) return 'La talla debe estar entre 0 y 200 mm';
	return null;
}

export function validarPuntoManual(fechaStr: string, tallaStr: string): ResultadoValidacion {
	const errorFecha = validarFecha(fechaStr);
	if (errorFecha) return { fecha: '', talla: 0, error: errorFecha };

	const talla = parseFloat(tallaStr);
	const errorTalla = validarTalla(talla);
	if (errorTalla) return { fecha: '', talla: 0, error: errorTalla };

	return { fecha: fechaStr, talla, error: null };
}
