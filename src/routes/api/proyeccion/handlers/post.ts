/**
 * Handler compartido para POST /api/proyectar y compatibilidad /api/proyeccion.
 * Ahora delega el cálculo a un microservicio externo de predicción.
 * Soporta datos multivariables opcionales.
 */

import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import type { ProyeccionRequest } from '../types';
import { llamarApiPrediccion, PredictionServiceError } from '$lib/server/prediction-service';
import type { PredictionApiInput } from '$lib/server/prediction-service';
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
	return calcularDiasDesdeFechaBase(fechas, fechas[0]);
}

function calcularDiasDesdeFechaBase(fechas: string[], fechaBase: string): number[] {
	const fechaInicio = new Date(fechaBase + 'T00:00:00Z');
	return fechas.map((f) => {
		const fecha = new Date(f + 'T00:00:00Z');
		return Math.round((fecha.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
	});
}

function calcularDiaDesdeFechaBase(fecha: string, fechaBase: string): number {
	return calcularDiasDesdeFechaBase([fecha], fechaBase)[0] ?? 0;
}

/**
 * Construir PredictionApiInput completo a partir del request body.
 * Incluye variables multivariables opcionales si están presentes.
 */
function construirApiInput(body: ProyeccionRequest): PredictionApiInput {
	const fechas = body.fechas;

	const datos = fechas.map((fecha, i) => {
		const punto: PredictionApiInput['datos'][number] = {
			fecha,
			talla: body.tallas[i]
		};

		if (body.biomasas && body.biomasas[i] !== undefined) {
			punto.biomasa = body.biomasas[i];
		}
		if (body.densidades && body.densidades[i] !== undefined) {
			punto.densidad = body.densidades[i];
		}
		if (body.temperaturas && body.temperaturas[i] !== undefined) {
			punto.temperatura = body.temperaturas[i];
		}
		if (body.features && body.features[i] !== undefined) {
			punto.features = Object.entries(body.features[i]).map(([nombre, valor]) => ({
				nombre,
				valor
			}));
		}

		return punto;
	});

	const config: PredictionApiInput['config'] = {};
	if (body.tallaObjetivo != null) {
		config.talla_objetivo = body.tallaObjetivo;
	}
	config.horizon = 720;

	const input: PredictionApiInput = { datos };
	if (Object.keys(config).length > 0) {
		input.config = config;
	}
	if (body.modelo) {
		input.modelo = body.modelo;
	}

	return input;
}

/**
 * POST /api/proyectar
 * Ejecuta la proyección de crecimiento delegando al microservicio externo.
 * Requiere autenticación.
 * Acepta datos multivariables opcionales.
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

		// Construir input completo para la API
		const apiInput = construirApiInput(body);

		const resultado = await llamarApiPrediccion(apiInput);

		if (!resultado.success) {
			return json(
				{
					success: false,
					error: resultado.warnings?.join('; ') || 'Error al ejecutar la proyección',
					metadatos: { totalPuntos: body.fechas.length },
					warnings: resultado.warnings
				},
				{ status: 422 }
			);
		}

		// Calcular días relativos desde la primera fecha para compatibilidad con UI
		const diasRelativos = calcularDiasDesdePrimeraFecha(body.fechas);
		const fechaBase = body.fechas[0];
		const diasRelativosProyeccion = calcularDiasDesdeFechaBase(
			resultado.predicciones.map((p) => p.fecha),
			fechaBase
		);
		const ultimoDiaHistorico = Math.max(...diasRelativos);
		const proyeccion = resultado.predicciones.map((p, i) => ({
			dia: diasRelativosProyeccion[i],
			talla: p.talla,
			tipo: 'proyectado' as const
		}));
		const diaObjetivoDesdeMetricas =
			typeof resultado.metricas?.fecha_talla_objetivo === 'string'
				? calcularDiaDesdeFechaBase(resultado.metricas.fecha_talla_objetivo, fechaBase)
				: typeof resultado.metricas?.dias_hasta_objetivo === 'number'
					? ultimoDiaHistorico + resultado.metricas.dias_hasta_objetivo
					: undefined;
		const diaObjetivoDesdeProyeccion =
			body.tallaObjetivo != null
				? proyeccion.find((p) => p.talla >= body.tallaObjetivo!)?.dia
				: undefined;
		const diaObjetivo = diaObjetivoDesdeMetricas ?? diaObjetivoDesdeProyeccion;

		// Normalizar incertidumbre si viene
		let incertidumbre;
		if (resultado.incertidumbre) {
			// Algunos modelos devuelven bandas con dias explicitos; otros, como
			// ML-Random Forest, devuelven percentiles alineados con predicciones.
			const diasIncertidumbre = Array.isArray(resultado.incertidumbre.dias)
				? calcularDiasDesdePrimeraFecha(
						resultado.incertidumbre.dias.map((d: string | number) => {
							if (typeof d === 'string' && d.includes('-')) return d;
					const fechaInicio = new Date(fechaBase + 'T00:00:00Z');
							fechaInicio.setDate(fechaInicio.getDate() + (d as number));
							return fechaInicio.toISOString().split('T')[0];
						})
					)
				: diasRelativosProyeccion;
			incertidumbre = {
				dias: diasIncertidumbre,
				mediana: resultado.incertidumbre.mediana ?? resultado.predicciones.map((p) => p.talla),
				limiteInferior: resultado.incertidumbre.limite_inferior ?? resultado.incertidumbre.lower_p10,
				limiteSuperior: resultado.incertidumbre.limite_superior ?? resultado.incertidumbre.upper_p90
			};
		}

		// Recopilar warnings de todas las fuentes
		const warnings: string[] = [];
		if (resultado.warnings) {
			warnings.push(...resultado.warnings);
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
				diaObjetivo,
				fechaObjetivo: typeof resultado.metricas?.fecha_talla_objetivo === 'string'
					? resultado.metricas.fecha_talla_objetivo
					: undefined,
				diaInicioProyeccion: ultimoDiaHistorico,
				horizonteDias: 720,
				horizonteMeses: 24,
				modeloUsado: resultado.modelo_usado,
				totalPuntos: body.fechas.length,
				...(resultado.metadata ?? {})
			},
			modeloUsado: resultado.modelo_usado,
			metricas: resultado.metricas,
			incertidumbre,
			warnings: warnings.length > 0 ? warnings : undefined
		});
	} catch (error) {
		console.error('Error en POST /api/proyectar:', error);

		// Manejo de errores tipificado del servicio de predicción
		if (error instanceof PredictionServiceError) {
			const statusMap: Record<string, number> = {
				API_CAIDA: 503,
				VALIDACION: 422,
				MODELO_INEXISTENTE: 400,
				FALLO_INTERNO: 502,
				TIMEOUT: 504,
				DESCONOCIDO: 500
			};
			return json(
				{
					success: false,
					error: error.message,
					code: error.code,
					details: error.details
				},
				{ status: statusMap[error.code] || 500 }
			);
		}

		return json({ error: 'Error interno del servidor' }, { status: 500 });
	}
}
