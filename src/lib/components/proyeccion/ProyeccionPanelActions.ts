/**
 * Acciones para ProyeccionPanel.svelte.
 */

import type { ResultadoProyeccion } from './ProyeccionComponentTypes';

export async function ejecutarProyeccion(dias: number[], tallas: number[], tallaObjetivo: string): Promise<ResultadoProyeccion> {
	const body: Record<string, unknown> = { dias, tallas };
	const tallaObj = parseFloat(tallaObjetivo);
	if (!isNaN(tallaObj) && tallaObj > 0) {
		body.tallaObjetivo = tallaObj;
	}

	const res = await fetch('/api/proyeccion', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(body)
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => ({ error: `Error HTTP ${res.status}` }));
		throw new Error(errorData.error || `Error HTTP ${res.status}`);
	}

	return await res.json();
}

export function exportarCSV(resultado: ResultadoProyeccion) {
	if (!resultado?.success || !resultado.proyeccion) return;

	const headers = ['Día', 'Talla (mm)', 'Tipo'];
	const filas = resultado.proyeccion.map((p) => [p.dia, p.talla.toFixed(2), p.tipo]);
	const csv = [headers, ...filas].map((r) => r.join(',')).join('\n');

	const blob = new Blob([csv], { type: 'text/csv' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'proyeccion-crecimiento.csv';
	a.click();
	URL.revokeObjectURL(url);
}
