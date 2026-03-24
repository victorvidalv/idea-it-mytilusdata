/**
 * Lógica compartida para ProyeccionForm.svelte.
 */

import type { Lugar, Ciclo, MedicionCargada } from './ProyeccionComponentTypes';

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
	const res = await fetch(`/api/proyeccion?cicloId=${cicloId}`, {
		credentials: 'include'
	});
	const data = await res.json();

	if (!res.ok || !data.success) {
		throw new Error(data.error || 'Error al cargar mediciones');
	}

	return data.mediciones || [];
}

export function validarPuntoManual(diaStr: string, tallaStr: string): { dia: number; talla: number; error: string | null } {
	const dia = parseInt(diaStr, 10);
	const talla = parseFloat(tallaStr);

	if (isNaN(dia) || isNaN(talla)) {
		return { dia: 0, talla: 0, error: 'Ingresa valores numéricos válidos' };
	}

	if (dia < 0) {
		return { dia: 0, talla: 0, error: 'El día debe ser un número positivo' };
	}

	if (talla <= 0 || talla > 200) {
		return { dia: 0, talla: 0, error: 'La talla debe estar entre 0 y 200 mm' };
	}

	return { dia, talla, error: null };
}
