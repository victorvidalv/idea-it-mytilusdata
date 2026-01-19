/**
 * Servicio de predicción externo.
 * Delega el cálculo de proyecciones a un microservicio Python.
 */

import { env } from '$env/dynamic/private';

const PREDICTION_API_URL = env.PREDICTION_API_URL || 'https://t2g-apipython.v6qptm.easypanel.host';

/** Datos de entrada para la API de predicción */
export interface PredictionApiInput {
	datos: Array<{ fecha: string; talla: number; biomasa?: number; densidad?: number }>;
	config?: {
		horizon?: number;
		talla_objetivo?: number;
	};
	modelo?: string;
}

/** Respuesta de la API de predicción */
export interface PredictionApiOutput {
	success: boolean;
	modelo_usado: string;
	predicciones: Array<{ fecha: string; talla: number }>;
	parametros_modelo?: Record<string, number>;
	metricas?: {
		r_squared?: number;
		rmse?: number;
		mae?: number;
	};
	incertidumbre?: {
		dias: number[];
		mediana: number[];
		limite_inferior: number[];
		limite_superior: number[];
	};
	warnings?: string[];
}

/** Modelo disponible en la API */
export interface PredictionModel {
	id: string;
	nombre: string;
	descripcion: string;
}

/**
 * Obtener la lista de modelos disponibles desde la API externa.
 */
export async function obtenerModelosDisponibles(): Promise<PredictionModel[]> {
	const res = await fetch(`${PREDICTION_API_URL}/config/models`, {
		method: 'GET',
		headers: { Accept: 'application/json' }
	});

	if (!res.ok) {
		throw new Error(`Error al obtener modelos: ${res.status} ${res.statusText}`);
	}

	const data = await res.json();
	// La API puede devolver un array directo o un objeto con propiedad 'modelos'
	const modelos = Array.isArray(data) ? data : (data.modelos || []);
	// Mapear campos de la API a nuestro formato
	return modelos.map((m: any) => ({
		id: m.slug || m.id,
		nombre: m.name || m.nombre,
		descripcion: m.description || m.descripcion
	}));
}

/**
 * Llamar a la API de predicción externa.
 */
export async function llamarApiPrediccion(input: PredictionApiInput): Promise<PredictionApiOutput> {
	const res = await fetch(`${PREDICTION_API_URL}/predict`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: JSON.stringify(input)
	});

	if (!res.ok) {
		const text = await res.text().catch(() => '');
		throw new Error(`Error en API de predicción (${res.status}): ${text}`);
	}

	return await res.json();
}
