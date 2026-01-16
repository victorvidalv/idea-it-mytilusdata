/**
 * Lógica compartida para ProyeccionForm.svelte.
 */

import type { Lugar, MedicionCargada } from './ProyeccionComponentTypes';
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

export async function fetchMediciones(cicloId: number): Promise<MedicionCargada[]> {
	const res = await fetch(`/api/proyectar-sigmoides?cicloId=${cicloId}`, {
		credentials: 'include'
	});
	const data = await res.json();

	if (!res.ok || !data.success) {
		throw new Error(data.error || 'Error al cargar mediciones');
	}

	return data.mediciones || [];
}
