/**
 * Formatea una fecha en formato localizado (es-CL)
 */
export function formatDate(dateStr: string | null): string {
	if (!dateStr) return '—';
	return new Date(dateStr).toLocaleDateString('es-CL', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
}

/**
 * Calcula días de cultivo entre fecha de siembra y fecha de fin (o actualidad)
 */
export function diasCultivo(fechaSiembra: string | null, fechaFin: string | null): string {
	if (!fechaSiembra) return '—';
	const inicio = new Date(fechaSiembra);
	const fin = fechaFin ? new Date(fechaFin) : new Date();
	const dias = Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
	return `${dias}d`;
}

/**
 * Accesador para calcular duración en días para un ciclo
 */
export function getDuracionCiclo(c: { fechaSiembra: string | null; fechaFinalizacion: string | null }): number {
	if (!c.fechaSiembra) return 0;
	const inicio = new Date(c.fechaSiembra);
	const fin = c.fechaFinalizacion ? new Date(c.fechaFinalizacion) : new Date();
	return Math.floor((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
}