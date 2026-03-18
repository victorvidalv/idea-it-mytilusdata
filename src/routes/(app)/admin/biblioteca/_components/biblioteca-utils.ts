import type { BibliotecaRecord } from '$lib/server/biblioteca/queries';

/**
 * Formatea una fecha a formato legible en español
 */
export function formatFecha(fecha: Date | null): string {
	if (!fecha) return '-';
	return new Date(fecha).toLocaleDateString('es-CL', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

/**
 * Formatea un número con decimales específicos
 */
export function formatNumero(valor: number | undefined | null, decimales = 4): string {
	if (valor === undefined || valor === null) return '-';
	return valor.toFixed(decimales);
}

/**
 * Obtiene la cantidad de puntos del JSON
 */
export function getPuntosCount(puntosJson: BibliotecaRecord['puntosJson']): number {
	return Object.keys(puntosJson).length;
}

/**
 * Convierte el JSON de puntos a un array ordenado por día
 */
export function getDiasArray(puntosJson: BibliotecaRecord['puntosJson']): { dia: number; talla: number }[] {
	return Object.entries(puntosJson)
		.map(([dia, talla]) => ({ dia: parseInt(dia, 10), talla }))
		.sort((a, b) => a.dia - b.dia);
}

/**
 * Calcula la predicción sigmoidal
 */
export function calcularPrediccion(
	L: number,
	k: number,
	x0: number,
	dia: number
): number {
	return L / (1 + Math.exp(-k * (dia - x0)));
}

/**
 * Determina la clase CSS para el badge de R²
 */
export function getR2BadgeClass(r2: number | null | undefined): string {
	if (r2 && r2 >= 0.85) {
		return 'bg-green-100 text-green-800';
	}
	return 'bg-yellow-100 text-yellow-800';
}

/**
 * Determina la clase CSS para el error
 */
export function getErrorClass(error: number): string {
	return error > 5 ? 'text-red-600' : 'text-green-600';
}