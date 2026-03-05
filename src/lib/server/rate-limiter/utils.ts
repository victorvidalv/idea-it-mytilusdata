/**
 * Formatea milisegundos a una cadena legible.
 * @param ms - Milisegundos a formatear
 * @returns Cadena legible con minutos u horas
 */
export function formatTime(ms: number): string {
	const minutes = Math.ceil(ms / (60 * 1000));

	if (minutes < 60) {
		return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
	}

	const hours = Math.ceil(minutes / 60);
	return `${hours} hora${hours !== 1 ? 's' : ''}`;
}