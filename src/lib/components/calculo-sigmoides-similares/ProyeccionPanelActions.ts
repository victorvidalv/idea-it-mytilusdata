/**
 * Acciones para ProyeccionPanel.svelte.
 */

import type { ResultadoProyeccion, ModeloPrediccion } from './ProyeccionComponentTypes';

export async function ejecutarProyeccion(
	fechas: string[],
	tallas: number[],
	tallaObjetivo: string,
	modelo?: string,
	horizon?: number
): Promise<ResultadoProyeccion> {
	const body: Record<string, unknown> = { fechas, tallas };
	const tallaObj = parseFloat(tallaObjetivo);
	if (!isNaN(tallaObj) && tallaObj > 0) {
		body.tallaObjetivo = tallaObj;
	}
	if (modelo) {
		body.modelo = modelo;
	}
	if (horizon !== undefined && !isNaN(horizon)) {
		body.horizon = Math.max(1, Math.min(365, Math.round(horizon)));
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

export async function obtenerModelosPrediccion(): Promise<ModeloPrediccion[]> {
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
	const modelos = data.modelos || [];
	// Normalizar modelos si vienen en formato legacy (solo id, nombre, descripcion)
	return modelos.map((m: Record<string, unknown>) => ({
		id: String(m.id || m.codigo || ''),
		nombre: String(m.nombre || m.name || ''),
		descripcion: String(m.descripcion || m.description || ''),
		modelType: (m.modelType as ModeloPrediccion['modelType']) || 'Matematico',
		featuresRequired: Array.isArray(m.featuresRequired) ? m.featuresRequired : ['talla'],
		featuresOptional: Array.isArray(m.featuresOptional) ? m.featuresOptional : [],
		minPoints: typeof m.minPoints === 'number' ? m.minPoints : 5,
		supportsUncertainty: Boolean(m.supportsUncertainty ?? true),
		supportsTargetDate: Boolean(m.supportsTargetDate ?? true),
		status: (m.status as ModeloPrediccion['status']) || 'Estable'
	}));
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
