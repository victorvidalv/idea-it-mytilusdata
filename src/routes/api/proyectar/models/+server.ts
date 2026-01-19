/**
 * GET /api/proyectar-sigmoides/models
 * Devuelve la lista de modelos disponibles en el microservicio externo.
 */

import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { obtenerModelosDisponibles } from '$lib/server/prediction-service';
import { verificarAutenticacion } from '../../proyeccion/validation';

export const GET: RequestHandler = async (event) => {
	const userId = verificarAutenticacion(event.locals);
	if (!userId) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		const modelos = await obtenerModelosDisponibles();
		return json({ success: true, modelos });
	} catch (error) {
		console.error('Error al obtener modelos:', error);
		const message = error instanceof Error ? error.message : 'Error interno del servidor';
		return json({ error: message }, { status: 500 });
	}
};
