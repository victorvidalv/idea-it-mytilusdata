/**
 * Handler compartido para POST /api/proyectar y compatibilidad /api/proyeccion.
 * Ahora delega el cálculo a un microservicio externo de predicción.
 */

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { ProyeccionRequest } from '../types';
import { llamarApiPrediccion } from '$lib/server/prediction-service';
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
 * Calcular días relativos desde la primera fecha.
 * Útil para mantener compatibilidad con la UI que usa días.
 */
function calcularDiasDesdePrimeraFecha(fechas: string[]): number[] {
	if (fechas.length === 0) return [];
	const fechaInicio = new Date(fechas[0] + 'T00:00:00Z');
	return fechas.map((f) => {
		const fecha = new Date(f + 'T00:00:00Z');
		return Math.round((fecha.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
	});
}

/**
 * POST /api/proyectar
 * Ejecuta la proyección de crecimiento delegando al microservicio externo.
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

		// Usar fechas reales del request
		const fechas = body.fechas;

		const datos = fechas.map((fecha, i) => ({
			fecha,
			talla: body.tallas[i]
		}));

		const config: { horizon?: number; talla_objetivo?: number } = {};
		if (body.tallaObjetivo != null) {
			config.talla_objetivo = body.tallaObjetivo;
		}
		if (body.diasMax != null) {
			config.horizon = body.diasMax;
		}

		const resultado = await llamarApiPrediccion({
			datos,
			config: Object.keys(config).length > 0 ? config : undefined,
			modelo: body.modelo
		});

		if (!resultado.success) {
			return json(
				{
					error: resultado.warnings?.join('; ') || 'Error al ejecutar la proyección',
					metadatos: { totalPuntos: body.fechas.length }
				},
				{ status: 422 }
			);
		}

		// Calcular días relativos desde la primera fecha para compatibilidad con UI
		const diasRelativos = calcularDiasDesdePrimeraFecha(fechas);
		const diasRelativosProyeccion = calcularDiasDesdePrimeraFecha(
			resultado.predicciones.map((p) => p.fecha)
		);
		const proyeccion = resultado.predicciones.map((p, i) => ({
			dia: diasRelativosProyeccion[i],
			talla: p.talla,
			tipo: 'proyectado'
		}));

		// Normalizar incertidumbre si viene
		let incertidumbre;
		if (resultado.incertidumbre) {
			// Convertir fechas de incertidumbre a días relativos
			const diasIncertidumbre = calcularDiasDesdePrimeraFecha(
				resultado.incertidumbre.dias.map((d) => {
					// Si ya es fecha ISO, usarla; si es número, convertir desde fecha inicio
					if (typeof d === 'string' && d.includes('-')) return d;
					const fechaInicio = new Date(fechas[0] + 'T00:00:00Z');
					fechaInicio.setDate(fechaInicio.getDate() + d);
					return fechaInicio.toISOString().split('T')[0];
				})
			);
			incertidumbre = {
				dias: diasIncertidumbre,
				mediana: resultado.incertidumbre.mediana,
				limiteInferior: resultado.incertidumbre.limite_inferior,
				limiteSuperior: resultado.incertidumbre.limite_superior
			};
		}

		return json({
			success: true,
			proyeccion,
			curvaUsada: {
				id: 0,
				codigoReferencia: resultado.modelo_usado,
				sse: resultado.metricas?.rmse ?? 0,
				esCurvaLocal: true,
				r2: resultado.metricas?.r_squared,
				parametros: resultado.parametros_modelo
			},
			metadatos: {
				rangoDias: [Math.min(...diasRelativos), Math.max(...diasRelativos)],
				rangoTallas: [Math.min(...body.tallas), Math.max(...body.tallas)],
				tallaObjetivo: body.tallaObjetivo,
				totalPuntos: body.fechas.length
			},
			modeloUsado: resultado.modelo_usado,
			metricas: resultado.metricas,
			incertidumbre
		});
	} catch (error) {
		console.error('Error en POST /api/proyectar:', error);
		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
