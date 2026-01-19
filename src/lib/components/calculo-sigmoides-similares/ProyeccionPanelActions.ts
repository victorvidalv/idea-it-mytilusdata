/**
 * Acciones para ProyeccionPanel.svelte.
 */

import type { ResultadoProyeccion } from './ProyeccionComponentTypes';

export async function ejecutarProyeccion(
	fechas: string[],
	tallas: number[],
	tallaObjetivo: string,
	modelo?: string
): Promise<ResultadoProyeccion> {
	const body: Record<string, unknown> = { fechas, tallas };
	const tallaObj = parseFloat(tallaObjetivo);
	if (!isNaN(tallaObj) && tallaObj > 0) {
		body.tallaObjetivo = tallaObj;
	}
	if (modelo) {
		body.modelo = modelo;
	}

	const res = await fetch('/api/proyectar', {
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

export async function obtenerModelosPrediccion(): Promise<Array<{ id: string; nombre: string; descripcion: string }>> {
	const res = await fetch('/api/proyectar/models', {
		method: 'GET',
		headers: { Accept: 'application/json' },
		credentials: 'include'
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => ({ error: `Error HTTP ${res.status}` }));
		throw new Error(errorData.error || `Error HTTP ${res.status}`);
	}

	const data = await res.json();
	return data.modelos || [];
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
