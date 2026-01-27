/**
 * GET /api/proyectar/models
 * Devuelve la lista de modelos disponibles en el microservicio externo.
 *
 * Este endpoint se usa como health check liviano en la pagina /proyectar.
 * No expone datos de usuario ni mediciones, por eso no requiere sesion:
 * exigir auth aqui puede marcar la API como "Degradado" en produccion si la
 * cookie de sesion no llega a esta llamada secundaria.
 */

import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { obtenerModelosDisponibles } from '$lib/server/prediction-service';

export const GET: RequestHandler = async (event) => {
	try {
		const modelos = await obtenerModelosDisponibles();
		return json({ success: true, modelos });
	} catch (error) {
		console.error('Error al obtener modelos:', error);
		const message = error instanceof Error ? error.message : 'Error interno del servidor';
		return json({ error: message }, { status: 500 });
	}
};
