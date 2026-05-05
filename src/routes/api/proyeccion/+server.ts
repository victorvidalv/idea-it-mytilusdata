/**
 * Endpoint API para proyección de crecimiento.
 * Recibe datos día a día del usuario y retorna la curva proyectada
 * basándose en la biblioteca de curvas sigmoidales.
 */

import { json } from '@sveltejs/kit';
import { ejecutarProyeccion, exportarProyeccionCSV } from '$lib/server/biblioteca/similitud';
import { db } from '$lib/server/db';
import { ciclos, mediciones, tiposRegistro } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestEvent } from './$types';

// Interfaces para el body de la request
interface ProyeccionRequest {
	dias: number[];
	tallas: number[];
	tallaObjetivo?: number;
	diasMax?: number;
}

interface ProyeccionCSVRequest {
	dias: number[];
	tallas: number[];
	tallaObjetivo?: number;
	diasMax?: number;
}

/**
 * Verificar que el usuario está autenticado.
 * Retorna null si no lo está.
 */
function verificarAutenticacion(locals: App.Locals): number | null {
	if (!locals.user) {
		return null;
	}
	return locals.user.userId;
}

/**
 * POST /api/proyeccion
 * Ejecuta la proyección de crecimiento usando el servicio de similitud.
 * Requiere autenticación.
 */
export async function POST({ request, locals }: RequestEvent) {
	// Verificar autenticación
	const userId = verificarAutenticacion(locals);
	if (!userId) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		const body: ProyeccionRequest = await request.json();

		// Validar que los campos requeridos existan
		if (!body.dias || !Array.isArray(body.dias)) {
			return json({ error: 'Campo requerido: dias (array de números)' }, { status: 400 });
		}
		if (!body.tallas || !Array.isArray(body.tallas)) {
			return json({ error: 'Campo requerido: tallas (array de números)' }, { status: 400 });
		}

		// Validar longitud de arrays
		if (body.dias.length !== body.tallas.length) {
			return json(
				{ error: 'Los arrays dias y tallas deben tener la misma longitud' },
				{ status: 400 }
			);
		}

		// Validar cantidad mínima de puntos
		if (body.dias.length < 3) {
			return json(
				{ error: 'Se requieren al menos 3 puntos de datos para proyectar' },
				{ status: 400 }
			);
		}

		// Ejecutar proyección
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

/**
 * GET /api/proyeccion?cicloId=123
 * Obtiene las mediciones de talla de un ciclo para proyección.
 * Requiere autenticación y que el ciclo pertenezca al usuario.
 */
export async function GET({ locals, url }: RequestEvent) {
	// Verificar autenticación
	const userId = verificarAutenticacion(locals);
	if (!userId) {
		return json({ error: 'No autorizado' }, { status: 401 });
	}

	try {
		const cicloIdParam = url.searchParams.get('cicloId');

		// Validar que cicloId esté presente
		if (!cicloIdParam) {
			return json({ error: 'Parámetro requerido: cicloId' }, { status: 400 });
		}

		const cicloId = parseInt(cicloIdParam, 10);
		if (isNaN(cicloId)) {
			return json({ error: 'Parámetro cicloId debe ser un número válido' }, { status: 400 });
		}

		// 1. Obtener el ciclo y verificar que pertenece al usuario
		const cicloResult = await db
			.select({
				id: ciclos.id,
				nombre: ciclos.nombre,
				fechaSiembra: ciclos.fechaSiembra
			})
			.from(ciclos)
			.where(and(eq(ciclos.id, cicloId), eq(ciclos.userId, userId)))
			.limit(1);

		if (cicloResult.length === 0) {
			return json(
				{ error: 'Ciclo no encontrado o no pertenece al usuario' },
				{ status: 404 }
			);
		}

		const ciclo = cicloResult[0];

		// 2. Obtener mediciones de talla filtradas por ciclo y tipo TALLA_LONGITUD
		const medicionesTalla = await db
			.select({
				valor: mediciones.valor,
				fechaMedicion: mediciones.fechaMedicion
			})
			.from(mediciones)
			.innerJoin(tiposRegistro, eq(mediciones.tipoId, tiposRegistro.id))
			.where(
				and(
					eq(mediciones.cicloId, cicloId),
					eq(tiposRegistro.codigo, 'TALLA_LONGITUD'),
					eq(mediciones.userId, userId)
				)
			)
			.orderBy(mediciones.fechaMedicion);

		// 3. Calcular día como diferencia entre fechaMedicion y fechaSiembra
		const fechaSiembraMs = new Date(ciclo.fechaSiembra).getTime();
		const medicionesConDia = medicionesTalla.map((m) => {
			const fechaMedMs = new Date(m.fechaMedicion).getTime();
			const dia = Math.round((fechaMedMs - fechaSiembraMs) / (1000 * 60 * 60 * 24));
			return {
				dia,
				talla: m.valor
			};
		});

		// 4. Validar mínimo de puntos
		if (medicionesConDia.length < 3) {
			return json(
				{
					error: 'Se requieren al menos 3 mediciones de talla para proyectar',
					totalMediciones: medicionesConDia.length
				},
				{ status: 422 }
			);
		}

		// 5. Retornar resultado
		return json({
			success: true,
			ciclo: {
				id: ciclo.id,
				nombre: ciclo.nombre,
				fechaSiembra: ciclo.fechaSiembra
			},
			mediciones: medicionesConDia
		});
	} catch (error) {
		console.error('Error en GET /api/proyeccion:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
