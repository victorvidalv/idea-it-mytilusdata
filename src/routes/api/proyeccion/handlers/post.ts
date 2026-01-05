/**
 * Handler para POST /api/proyeccion.
 */

import { json } from '@sveltejs/kit';
import { ejecutarProyeccion } from '$lib/server/biblioteca/similitud';
import type { RequestEvent } from './$types';
import type { ProyeccionRequest } from '../types';
import {
	verificarAutenticacion,
	validarCamposRequeridos,
	validarLongitudArrays,
	validarMinimoPuntos
} from '../validation';

/**
 * Validar request body para proyección.
 */
function validarRequest(body: Partial<ProyeccionRequest>): { valido: boolean; error?: string } {
	const validacionCampos = validarCamposRequeridos(body);
	if (!validacionCampos.valido) {
		return { valido: false, error: validacionCampos.error };
	}

	const validacionLongitud = validarLongitudArrays(body as ProyeccionRequest);
	if (!validacionLongitud.valido) {
		return { valido: false, error: validacionLongitud.error };
	}

	const validacionMinimo = validarMinimoPuntos(body as ProyeccionRequest);
	if (!validacionMinimo.valido) {
		return { valido: false, error: validacionMinimo.error };
	}

	return { valido: true };
}

/**
 * POST /api/proyeccion
 * Ejecuta la proyección de crecimiento usando el servicio de similitud.
 * Requiere autenticación.
 */
export async function handlePostProyeccion({ request, locals }: RequestEvent): Promise<Response> {
	const userId = verificarAutenticacion(locals);
	if (!userId) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		const body: ProyeccionRequest = await request.json();

		const validacion = validarRequest(body);
		if (!validacion.valido) {
			return json({ error: validacion.error }, { status: 400 });
		}

		const resultado = await ejecutarProyeccion(
			{ dias: body.dias, tallas: body.tallas },
			{ tallaObjetivo: body.tallaObjetivo, diasMax: body.diasMax }
		);

		if (!resultado.success) {
			return json(
				{
					error: resultado.error || 'Error al ejecutar la proyección',
					metadatos: resultado.metadatos
				},
				{ status: 422 }
			);
		}

		return json({
			success: true,
			proyeccion: resultado.proyeccion,
			curvaUsada: resultado.curvaUsada,
			curvaReferencia: resultado.curvaReferencia,
			metadatos: resultado.metadatos
		});
	} catch (error) {
		console.error('Error en POST /api/proyeccion:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
