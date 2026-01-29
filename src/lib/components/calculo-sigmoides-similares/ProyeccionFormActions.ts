/**
 * Lógica compartida para ProyeccionForm.svelte.
 */

import type { Lugar, MedicionCargada, MedicionesCicloCargadas } from './ProyeccionComponentTypes';
export { validarPuntoManual } from './proyeccion-form-validacion';

export async function fetchLugares(): Promise<Lugar[]> {
	try {
		const res = await fetch('/api/centros', { credentials: 'include' });
		if (!res.ok) throw new Error('Error al cargar lugares');
		const data = await res.json();
		return data.data || [];
	} catch {
		return [];
	}
}

function normalizarFecha(fecha: unknown): string | undefined {
	if (!fecha) return undefined;
	return String(fecha).split('T')[0];
}

export async function fetchMediciones(cicloId: number): Promise<MedicionesCicloCargadas> {
	const res = await fetch(`/api/proyectar?cicloId=${cicloId}`, {
		credentials: 'include'
	});
	const data = await res.json();

	if (!res.ok || !data.success) {
		throw new Error(data.error || 'Error al cargar mediciones');
	}

	return {
		mediciones: (data.mediciones || []) as MedicionCargada[],
		fechaSiembra: normalizarFecha(data.ciclo?.fechaSiembra)
	};
}
