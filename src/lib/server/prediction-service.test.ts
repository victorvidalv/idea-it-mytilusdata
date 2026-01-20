import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	obtenerModelosDisponibles,
	llamarApiPrediccion,
	validarCompatibilidadPrediccion,
	PredictionServiceError,
	type PredictionApiInput,
} from './prediction-service';

// Mock de env
vi.mock('$env/dynamic/private', () => ({
	env: {
		PREDICTION_API_URL: 'http://localhost:8000',
	},
}));

/**
 * Helper para crear respuestas mock de fetch.
 * fetchWithTimeout usa .finally() sobre la Promise de fetch,
 * asi que necesitamos retornar una Promise real.
 */
function createMockResponse(overrides: Partial<Response> & { json?: () => Promise<any>; text?: () => Promise<string> }): Response {
	return {
		ok: true,
		status: 200,
		json: async () => ({}),
		text: async () => '',
		headers: new Headers(),
		...overrides,
	} as Response;
}

const mockImpl = vi.fn();
const mockFetch = ((...args: any[]) => {
	return Promise.resolve(mockImpl(...args));
}) as typeof fetch;

global.fetch = mockFetch;

describe('prediction-service', () => {
	beforeEach(() => {
		mockImpl.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// ============================================================
	// obtenerModelosDisponibles
	// ============================================================

	describe('obtenerModelosDisponibles', () => {
		it('normaliza slug/id y name/nombre desde array directo', async () => {
			mockImpl.mockReturnValueOnce(
				createMockResponse({
					json: async () => [
						{ slug: 'logistic_growth', name: 'Crecimiento Logistico', description: 'desc' },
						{ id: 'gompertz', nombre: 'Gompertz', descripcion: 'desc2' },
						{ slug: 'linear_baseline', name: '', description: '' },
					],
				})
			);

			const modelos = await obtenerModelosDisponibles();

			expect(modelos).toHaveLength(3);
			expect(modelos[0]).toEqual({
				id: 'logistic_growth',
				nombre: 'Crecimiento Logistico',
				descripcion: 'desc',
			});
			expect(modelos[1]).toEqual({
				id: 'gompertz',
				nombre: 'Gompertz',
				descripcion: 'desc2',
			});
			// Cuando name es vacio, debe fallback a slug
			expect(modelos[2]).toEqual({
				id: 'linear_baseline',
				nombre: 'linear_baseline',
				descripcion: '',
			});
		});

		it('normaliza desde objeto con propiedad modelos', async () => {
			mockImpl.mockReturnValueOnce(
				createMockResponse({
					json: async () => ({
						modelos: [{ slug: 'von_bertalanffy', name: 'Von Bertalanffy' }],
					}),
				})
			);

			const modelos = await obtenerModelosDisponibles();

			expect(modelos).toHaveLength(1);
			expect(modelos[0].id).toBe('von_bertalanffy');
			expect(modelos[0].nombre).toBe('Von Bertalanffy');
		});

		it('retorna array vacio si la respuesta no tiene modelos', async () => {
			mockImpl.mockReturnValueOnce(createMockResponse({ json: async () => ({}) }));

			const modelos = await obtenerModelosDisponibles();

			expect(modelos).toEqual([]);
		});

		it('lanza PredictionServiceError cuando la API responde con error', async () => {
			mockImpl.mockReturnValueOnce(createMockResponse({ ok: false, status: 500 }));

			await expect(obtenerModelosDisponibles()).rejects.toSatisfy((err: any) => {
				return (
					err instanceof PredictionServiceError &&
					err.message.includes('fallo interno') &&
					err.code === 'FALLO_INTERNO'
				);
			});
		});

		it('lanza PredictionServiceError cuando hay timeout', async () => {
			mockImpl.mockRejectedValueOnce(new Error('fetch failed'));

			await expect(obtenerModelosDisponibles()).rejects.toSatisfy((err: any) => {
				return (
					err instanceof PredictionServiceError &&
					err.message.includes('no está disponible') &&
					err.code === 'API_CAIDA'
				);
			});
		});
	});

	// ============================================================
	// llamarApiPrediccion
	// ============================================================

	describe('llamarApiPrediccion', () => {
		const inputBase: PredictionApiInput = {
			datos: [
				{ fecha: '2024-01-01', talla: 10.0 },
				{ fecha: '2024-01-15', talla: 12.5 },
			],
			config: { horizon: 10 },
		};

		it('acepta metadata extra en el input', async () => {
			const inputWithMetadata: PredictionApiInput = {
				...inputBase,
				metadata: { request_id: 'test-123', user_id: 42 },
			};

			mockImpl.mockReturnValueOnce(
				createMockResponse({
					json: async () => ({
						success: true,
						modelo_usado: 'logistic_growth',
						predicciones: [{ fecha: '2024-03-01', talla: 20.0 }],
					}),
				})
			);

			const result = await llamarApiPrediccion(inputWithMetadata);

			expect(result.success).toBe(true);
			expect(result.modelo_usado).toBe('logistic_growth');
			// Verificar que se envio la metadata
			const requestBody = JSON.parse(mockImpl.mock.calls[0][1].body);
			expect(requestBody.metadata).toEqual({ request_id: 'test-123', user_id: 42 });
		});

		it('normaliza modelo_usado si es objeto', async () => {
			mockImpl.mockReturnValueOnce(
				createMockResponse({
					json: async () => ({
						success: true,
						modelo_usado: { slug: 'gompertz', id: 'gompertz_model' },
						predicciones: [],
					}),
				})
			);

			const result = await llamarApiPrediccion(inputBase);

			expect(result.modelo_usado).toBe('gompertz');
		});

		it('retorna datos de la API correctamente', async () => {
			mockImpl.mockReturnValueOnce(
				createMockResponse({
					json: async () => ({
						success: true,
						modelo_usado: 'logistic_growth',
						predicciones: [
							{ fecha: '2024-03-01', talla: 20.0 },
							{ fecha: '2024-03-02', talla: 21.0 },
						],
						parametros_modelo: { L: 100, k: 0.02 },
						metricas: { r_squared: 0.98, rmse: 0.5 },
						warnings: [],
					}),
				})
			);

			const result = await llamarApiPrediccion(inputBase);

			expect(result.success).toBe(true);
			expect(result.predicciones).toHaveLength(2);
			expect(result.parametros_modelo).toEqual({ L: 100, k: 0.02 });
			expect(result.metricas?.r_squared).toBe(0.98);
		});

		it('maneja error de validacion (422)', async () => {
			mockImpl.mockReturnValueOnce(
				createMockResponse({
					ok: false,
					status: 422,
					text: async () => 'Datos invalidos',
				})
			);

			await expect(llamarApiPrediccion(inputBase)).rejects.toSatisfy((err: any) => {
				return (
					err instanceof PredictionServiceError &&
					err.message.includes('inválidos') &&
					err.code === 'VALIDACION'
				);
			});
		});

		it('maneja error de modelo no encontrado (404)', async () => {
			mockImpl.mockReturnValueOnce(
				createMockResponse({
					ok: false,
					status: 404,
					text: async () => 'Not found',
				})
			);

			await expect(llamarApiPrediccion(inputBase)).rejects.toSatisfy((err: any) => {
				return (
					err instanceof PredictionServiceError &&
					err.message.includes('no encontrado') &&
					err.code === 'MODELO_INEXISTENTE'
				);
			});
		});

		it('maneja error de API caida (fetch failed)', async () => {
			mockImpl.mockRejectedValueOnce(new Error('fetch failed'));

			await expect(llamarApiPrediccion(inputBase)).rejects.toSatisfy((err: any) => {
				return (
					err instanceof PredictionServiceError &&
					err.message.includes('no está disponible') &&
					err.code === 'API_CAIDA'
				);
			});
		});

		it('maneja timeout (AbortError)', async () => {
			const abortError = new Error('Timeout');
			abortError.name = 'AbortError';
			mockImpl.mockRejectedValueOnce(abortError);

			await expect(llamarApiPrediccion(inputBase)).rejects.toSatisfy((err: any) => {
				return (
					err instanceof PredictionServiceError &&
					err.message.includes('Timeout') &&
					err.code === 'TIMEOUT'
				);
			});
		});

		it('maneja error interno del servidor (500)', async () => {
			mockImpl.mockReturnValueOnce(
				createMockResponse({
					ok: false,
					status: 500,
					text: async () => 'Internal Server Error',
				})
			);

			await expect(llamarApiPrediccion(inputBase)).rejects.toSatisfy((err: any) => {
				return (
					err instanceof PredictionServiceError &&
					err.message.includes('fallo interno') &&
					err.code === 'FALLO_INTERNO'
				);
			});
		});
	});

	// ============================================================
	// validarCompatibilidadPrediccion
	// ============================================================

	describe('validarCompatibilidadPrediccion', () => {
		const inputBase: PredictionApiInput = {
			datos: [
				{ fecha: '2024-01-01', talla: 10.0 },
				{ fecha: '2024-01-15', talla: 12.5 },
			],
		};

		it('funciona correctamente con payload compatible', async () => {
			mockImpl.mockReturnValueOnce(
				createMockResponse({
					json: async () => ({
						compatible: true,
						modelo: 'logistic_growth',
						recommended_model: 'logistic_growth',
						warnings: [],
						errors: [],
					}),
				})
			);

			const result = await validarCompatibilidadPrediccion(inputBase);

			expect(result.compatible).toBe(true);
			expect(result.warnings).toEqual([]);
			expect(result.errors).toEqual([]);
		});

		it('detecta incompatibilidad y retorna errores', async () => {
			mockImpl.mockReturnValueOnce(
				createMockResponse({
					json: async () => ({
						compatible: false,
						modelo: 'logistic_growth',
						recommended_model: 'linear_baseline',
						warnings: ['Pocos datos'],
						errors: ['Faltan features requeridas'],
					}),
				})
			);

			const result = await validarCompatibilidadPrediccion(inputBase);

			expect(result.compatible).toBe(false);
			expect(result.warnings).toContain('Pocos datos');
			expect(result.errors).toContain('Faltan features requeridas');
		});

		it('retorna compatible=false cuando la API responde con error', async () => {
			mockImpl.mockReturnValueOnce(
				createMockResponse({
					ok: false,
					status: 500,
					text: async () => 'Server error',
				})
			);

			const result = await validarCompatibilidadPrediccion(inputBase);

			expect(result.compatible).toBe(false);
			expect(result.errors?.length).toBeGreaterThan(0);
		});

		it('retorna compatible=false cuando la API esta caida', async () => {
			mockImpl.mockRejectedValueOnce(new Error('fetch failed'));

			const result = await validarCompatibilidadPrediccion(inputBase);

			expect(result.compatible).toBe(false);
			expect(result.errors?.length).toBeGreaterThan(0);
			expect(result.errors?.[0]).toContain('no está disponible');
		});

		it('retorna compatible=false en timeout', async () => {
			const abortError = new Error('Timeout');
			abortError.name = 'AbortError';
			mockImpl.mockRejectedValueOnce(abortError);

			const result = await validarCompatibilidadPrediccion(inputBase);

			expect(result.compatible).toBe(false);
			expect(result.errors?.length).toBeGreaterThan(0);
			expect(result.errors?.[0]).toContain('Timeout');
		});

		it('usa success como fallback para compatible', async () => {
			mockImpl.mockReturnValueOnce(
				createMockResponse({
					json: async () => ({
						success: true,
						warnings: [],
						errors: [],
					}),
				})
			);

			const result = await validarCompatibilidadPrediccion(inputBase);

			// Cuando no hay 'compatible', usa 'success' como fallback
			expect(result.compatible).toBe(true);
		});
	});

	// ============================================================
	// Manejo de errores tipificados
	// ============================================================

	describe('clasificacion de errores', () => {
		it('clasifica ECONNREFUSED como API_CAIDA', async () => {
			mockImpl.mockRejectedValueOnce(new Error('ECONNREFUSED'));

			try {
				await llamarApiPrediccion({ datos: [{ fecha: '2024-01-01', talla: 10.0 }] });
				expect.fail('Deberia haber lanzado error');
			} catch (error) {
				expect(error).toBeInstanceOf(PredictionServiceError);
				expect((error as PredictionServiceError).code).toBe('API_CAIDA');
				expect((error as PredictionServiceError).statusCode).toBe(503);
			}
		});

		it('clasifica ENOTFOUND como API_CAIDA', async () => {
			mockImpl.mockRejectedValueOnce(new Error('ENOTFOUND'));

			try {
				await llamarApiPrediccion({ datos: [{ fecha: '2024-01-01', talla: 10.0 }] });
				expect.fail('Deberia haber lanzado error');
			} catch (error) {
				expect(error).toBeInstanceOf(PredictionServiceError);
				expect((error as PredictionServiceError).code).toBe('API_CAIDA');
			}
		});

		it('clasifica 400 como VALIDACION', async () => {
			mockImpl.mockReturnValueOnce(
				createMockResponse({
					ok: false,
					status: 400,
					text: async () => 'Bad request',
				})
			);

			try {
				await llamarApiPrediccion({ datos: [{ fecha: '2024-01-01', talla: 10.0 }] });
				expect.fail('Deberia haber lanzado error');
			} catch (error) {
				expect(error).toBeInstanceOf(PredictionServiceError);
				expect((error as PredictionServiceError).code).toBe('VALIDACION');
				expect((error as PredictionServiceError).statusCode).toBe(400);
			}
		});
	});
});
