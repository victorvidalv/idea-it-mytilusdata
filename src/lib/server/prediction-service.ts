/**
 * Servicio de predicción externo.
 * Delega el cálculo de proyecciones a un microservicio Python.
 */

import { env } from '$env/dynamic/private';

const PREDICTION_API_URL = env.PREDICTION_API_URL || 'https://t2g-apipython.v6qptm.easypanel.host';
const PREDICTION_TIMEOUT_MS = 10_000;

/** Feature adicional para modelos multivariables */
export interface PredictionFeature {
	nombre: string;
	valor: number;
}

/** Datos de entrada para la API de predicción */
export interface PredictionApiInput {
	datos: Array<{
		fecha: string;
		talla: number;
		biomasa?: number;
		densidad?: number;
		temperatura?: number;
		features?: PredictionFeature[];
	}>;
	config?: {
		horizon?: number;
		talla_objetivo?: number;
		target?: 'talla' | 'biomasa' | string;
	};
	modelo?: string;
	metadata?: Record<string, unknown>;
}

/** Respuesta de la API de predicción */
export interface PredictionApiOutput {
	success: boolean;
	modelo_usado: string;
	predicciones: Array<{ fecha: string; talla: number; biomasa?: number; densidad?: number; temperatura?: number }>;
	parametros_modelo?: Record<string, number>;
	metricas?: {
		r_squared?: number;
		rmse?: number;
		mae?: number;
		dias_hasta_objetivo?: number;
		fecha_talla_objetivo?: string;
		[key: string]: unknown;
	};
	incertidumbre?: {
		dias?: number[];
		mediana?: number[];
		limite_inferior?: number[];
		limite_superior?: number[];
		lower_p10?: number[];
		upper_p90?: number[];
		method?: string;
	};
	warnings?: string[];
	metadata?: Record<string, unknown>;
	// Tolerar campos adicionales futuros
	[key: string]: unknown;
}

/** Modelo disponible en la API */
export interface PredictionModel {
	id: string;
	nombre: string;
	descripcion: string;
	modelType?: string;
	featuresRequired?: string[];
	featuresOptional?: string[];
	minPoints?: number;
	supportsUncertainty?: boolean;
	supportsTargetDate?: boolean;
	status?: string;
}

/** Errores tipificados del servicio de predicción */
export class PredictionServiceError extends Error {
	constructor(
		message: string,
		public readonly code: 'API_CAIDA' | 'VALIDACION' | 'MODELO_INEXISTENTE' | 'FALLO_INTERNO' | 'TIMEOUT' | 'DESCONOCIDO',
		public readonly statusCode?: number,
		public readonly details?: string
	) {
		super(message);
		this.name = 'PredictionServiceError';
	}
}

/**
 * Crear un AbortController con timeout.
 */
function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timeoutId));
}

/**
 * Clasificar un error de fetch en un PredictionServiceError tipificado.
 */
function clasificarError(error: unknown, statusCode?: number): PredictionServiceError {
	if (error instanceof PredictionServiceError) return error;

	const message = error instanceof Error ? error.message : 'Error desconocido';

	if (error instanceof Error && error.name === 'AbortError') {
		return new PredictionServiceError('Timeout al conectar con el servicio de predicción', 'TIMEOUT', 504);
	}

	if (message.includes('fetch failed') || message.includes('ECONNREFUSED') || message.includes('ENOTFOUND')) {
		return new PredictionServiceError('El servicio de predicción no está disponible', 'API_CAIDA', 503, message);
	}

	if (statusCode === 400 || statusCode === 422) {
		return new PredictionServiceError('Datos de entrada inválidos para el modelo', 'VALIDACION', statusCode, message);
	}

	if (statusCode === 404) {
		return new PredictionServiceError('Modelo solicitado no encontrado', 'MODELO_INEXISTENTE', 404, message);
	}

	if (statusCode && statusCode >= 500) {
		return new PredictionServiceError('El servicio de predicción experimentó un fallo interno', 'FALLO_INTERNO', statusCode, message);
	}

	return new PredictionServiceError(message, 'DESCONOCIDO', statusCode);
}

/**
 * Obtener la lista de modelos disponibles desde la API externa.
 */
export async function obtenerModelosDisponibles(): Promise<PredictionModel[]> {
	try {
		const res = await fetchWithTimeout(
			`${PREDICTION_API_URL}/config/models`,
			{
				method: 'GET',
				headers: { Accept: 'application/json' }
			},
			PREDICTION_TIMEOUT_MS
		);

		if (!res.ok) {
			throw clasificarError(new Error(`HTTP ${res.status}`), res.status);
		}

		const data = await res.json();
		// La API puede devolver un array directo o un objeto con propiedad 'modelos'
		const modelos = Array.isArray(data) ? data : (data.modelos || []);
		// Mapear campos de la API a nuestro formato, normalizando slug/id y name/nombre
		return modelos.map((m: any) => ({
			id: m.slug || m.id || 'unknown',
			nombre: m.name || m.nombre || m.id || m.slug || 'Modelo sin nombre',
			descripcion: m.description || m.descripcion || '',
			modelType: m.model_type || m.modelType,
			featuresRequired: m.features_required || m.featuresRequired,
			featuresOptional: m.features_optional || m.featuresOptional,
			minPoints: m.min_points || m.minPoints,
			supportsUncertainty: m.supports_uncertainty ?? m.supportsUncertainty,
			supportsTargetDate: m.supports_target_date ?? m.supportsTargetDate,
			status: m.status
		}));
	} catch (error) {
		throw clasificarError(error);
	}
}

/**
 * Llamar a la API de predicción externa.
 */
export async function llamarApiPrediccion(input: PredictionApiInput): Promise<PredictionApiOutput> {
	try {
		const res = await fetchWithTimeout(
			`${PREDICTION_API_URL}/predict`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify(input)
			},
			PREDICTION_TIMEOUT_MS
		);

		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw clasificarError(new Error(text), res.status);
		}

		const data = await res.json();

		// Normalizar modelo_usado si la API devuelve slug o id
		if (data.modelo_usado && typeof data.modelo_usado === 'object') {
			data.modelo_usado = data.modelo_usado.slug || data.modelo_usado.id || String(data.modelo_usado);
		}

		return data as PredictionApiOutput;
	} catch (error) {
		throw clasificarError(error);
	}
}

/**
 * Validar compatibilidad de datos con el modelo de predicción.
 * Llama al endpoint /predict/validate de la API externa.
 */
export async function validarCompatibilidadPrediccion(input: PredictionApiInput): Promise<{
	compatible: boolean;
	warnings?: string[];
	errors?: string[];
}> {
	try {
		const res = await fetchWithTimeout(
			`${PREDICTION_API_URL}/predict/validate`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json'
				},
				body: JSON.stringify(input)
			},
			PREDICTION_TIMEOUT_MS
		);

		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw clasificarError(new Error(text), res.status);
		}

		const data = await res.json();
		return {
			compatible: data.compatible ?? data.success ?? true,
			warnings: data.warnings || [],
			errors: data.errors || []
		};
	} catch (error) {
		const classified = clasificarError(error);
		return {
			compatible: false,
			errors: [classified.message]
		};
	}
}
