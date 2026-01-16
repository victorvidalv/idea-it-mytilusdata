/**
 * Validación de puntos manuales para el formulario de proyección.
 */

interface ResultadoValidacion {
	dia: number;
	talla: number;
	error: string | null;
}

function validarDia(dia: number): string | null {
	if (isNaN(dia)) return 'Ingresa un día válido';
	if (dia < 0) return 'El día debe ser un número positivo';
	return null;
}

function validarTalla(talla: number): string | null {
	if (isNaN(talla)) return 'Ingresa una talla válida';
	if (talla <= 0 || talla > 200) return 'La talla debe estar entre 0 y 200 mm';
	return null;
}

export function validarPuntoManual(diaStr: string, tallaStr: string): ResultadoValidacion {
	const dia = parseInt(diaStr, 10);
	const talla = parseFloat(tallaStr);

	const errorDia = validarDia(dia);
	if (errorDia) return { dia: 0, talla: 0, error: errorDia };

	const errorTalla = validarTalla(talla);
	if (errorTalla) return { dia: 0, talla: 0, error: errorTalla };

	return { dia, talla, error: null };
}
