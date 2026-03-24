/**
 * Handler para GET /api/proyeccion.
 */

import { json } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import {
	verificarAutenticacion,
	validarCicloIdParam,
	obtenerCicloId
} from '../validation';
import {
	obtenerCiclo,
	obtenerMedicionesTalla,
	convertirMedicionesADias
} from '../queries';

/**
 * GET /api/proyeccion?cicloId=123
 * Obtiene las mediciones de talla de un ciclo para proyección.
 * Requiere autenticación y que el ciclo pertenezca al usuario.
 */
export async function handleGetProyeccion({ locals, url }: RequestEvent): Promise<Response> {
	const userId = verificarAutenticacion(locals);
	if (!userId) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		const cicloIdParam = url.searchParams.get('cicloId');

		const validacionParam = validarCicloIdParam(cicloIdParam);
		if (!validacionParam.valido) {
			return json({ error: validacionParam.error }, { status: 400 });
		}

		const cicloId = obtenerCicloId(cicloIdParam);
		if (cicloId === null) {
			return json({ error: 'Parámetro cicloId inválido' }, { status: 400 });
		}

		const ciclo = await obtenerCiclo(cicloId, userId);
		if (!ciclo) {
			return json({ error: 'Ciclo no encontrado o no pertenece al usuario' }, { status: 404 });
		}

		const medicionesRaw = await obtenerMedicionesTalla(cicloId, userId);
		const mediciones = convertirMedicionesADias(medicionesRaw, ciclo.fechaSiembra);

		if (mediciones.length < 3) {
			return json(
				{
					error: 'Se requieren al menos 3 mediciones de talla para proyectar',
					totalMediciones: mediciones.length
				},
				{ status: 422 }
			);
		}

		return json({
			success: true,
			ciclo: {
				id: ciclo.id,
				nombre: ciclo.nombre,
				fechaSiembra: ciclo.fechaSiembra
			},
			mediciones
		});
	} catch (error) {
		console.error('Error en GET /api/proyeccion:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
