// @ts-nocheck — Los tipos de ruta generados por SvelteKit crean incompatibilidades en mocks de test
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockVerificarAutenticacion = vi.hoisted(() => vi.fn());
const mockValidarCamposRequeridos = vi.hoisted(() => vi.fn());
const mockValidarLongitudArrays = vi.hoisted(() => vi.fn());
const mockValidarMinimoPuntos = vi.hoisted(() => vi.fn());
const mockLlamarApiPrediccion = vi.hoisted(() => vi.fn());

vi.mock('../../../routes/api/proyeccion/validation', () => ({
	verificarAutenticacion: mockVerificarAutenticacion,
	validarCamposRequeridos: mockValidarCamposRequeridos,
	validarLongitudArrays: mockValidarLongitudArrays,
	validarMinimoPuntos: mockValidarMinimoPuntos
}));

vi.mock('$lib/server/prediction-service', () => ({
	llamarApiPrediccion: mockLlamarApiPrediccion
}));

import { handlePostProyeccion } from '../../../routes/api/proyeccion/handlers/post';

function createPostEvent(options: {
	user?: { userId: number } | null;
	body?: Record<string, unknown>;
}) {
	return {
		locals: { user: options.user ?? null },
		request: {
			json: () => Promise.resolve(options.body ?? {})
		}
	} as never;
}

describe('POST /api/proyeccion', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockVerificarAutenticacion.mockReturnValue(1);
		mockValidarCamposRequeridos.mockReturnValue({ valido: true });
		mockValidarLongitudArrays.mockReturnValue({ valido: true });
		mockValidarMinimoPuntos.mockReturnValue({ valido: true });
		mockLlamarApiPrediccion.mockResolvedValue({
			success: true,
			modelo_usado: 'gompertz',
			predicciones: [
				{ fecha: '2024-01-02', talla: 10.5 },
				{ fecha: '2024-01-03', talla: 20.3 },
				{ fecha: '2024-01-04', talla: 30.1 }
			],
			parametros_modelo: { L: 100, k: 0.1, x0: 50 },
			metricas: { r_squared: 0.99, rmse: 1.2 },
			incertidumbre: {
				dias: [2, 3, 4],
				mediana: [10.5, 20.3, 30.1],
				limite_inferior: [9, 19, 29],
				limite_superior: [12, 21, 31]
			}
		});
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Autenticación', () => {
		it('debería retornar 401 si el usuario no está autenticado', async () => {
			mockVerificarAutenticacion.mockReturnValue(null);

			const event = createPostEvent({ user: null });
			const response = await handlePostProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(401);
			expect(data.error).toBe('No autorizado');
		});
	});

	describe('Validación del body', () => {
		it('debería retornar 400 si validarCamposRequeridos falla', async () => {
			mockValidarCamposRequeridos.mockReturnValue({
				valido: false,
				error: 'Faltan campos requeridos'
			});

			const event = createPostEvent({ body: {} });
			const response = await handlePostProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Faltan campos requeridos');
		});

		it('debería retornar 400 si validarLongitudArrays falla', async () => {
			mockValidarLongitudArrays.mockReturnValue({
				valido: false,
				error: 'Los arrays tienen diferente longitud'
			});

			const event = createPostEvent({
				body: { dias: [1, 2], tallas: [10] }
			});
			const response = await handlePostProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Los arrays tienen diferente longitud');
		});

		it('debería retornar 400 si validarMinimoPuntos falla', async () => {
			mockValidarMinimoPuntos.mockReturnValue({
				valido: false,
				error: 'Se requieren al menos 3 puntos'
			});

			const event = createPostEvent({
				body: { dias: [1], tallas: [10] }
			});
			const response = await handlePostProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Se requieren al menos 3 puntos');
		});
	});

	describe('Ejecución de proyección', () => {
		it('debería retornar 200 con resultado exitoso', async () => {
			const body = {
				dias: [1, 2, 3],
				tallas: [10, 20, 30],
				tallaObjetivo: 25,
				diasMax: 90
			};

			const event = createPostEvent({ body });
			const response = await handlePostProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.proyeccion).toBeDefined();
			expect(data.proyeccion.length).toBe(3);
			expect(data.curvaUsada).toBeDefined();
			expect(data.curvaUsada.codigoReferencia).toBe('gompertz');
			expect(data.modeloUsado).toBe('gompertz');
			expect(data.metricas.r_squared).toBe(0.99);
		});

		it('debería llamar a la API externa con los parámetros correctos', async () => {
			const body = {
				dias: [1, 2, 3],
				tallas: [10, 20, 30],
				tallaObjetivo: 25,
				diasMax: 90,
				modelo: 'gompertz'
			};

			const event = createPostEvent({ body });
			await handlePostProyeccion(event);

			expect(mockLlamarApiPrediccion).toHaveBeenCalledWith({
				datos: [
					{ fecha: '2024-01-02', talla: 10 },
					{ fecha: '2024-01-03', talla: 20 },
					{ fecha: '2024-01-04', talla: 30 }
				],
				config: { talla_objetivo: 25, horizon: 90 },
				modelo: 'gompertz'
			});
		});

		it('debería retornar 422 si la API externa falla', async () => {
			mockLlamarApiPrediccion.mockResolvedValue({
				success: false,
				warnings: ['Datos insuficientes']
			});

			const event = createPostEvent({
				body: { dias: [1, 2, 3], tallas: [10, 20, 30] }
			});
			const response = await handlePostProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(422);
			expect(data.error).toBe('Datos insuficientes');
		});

		it('debería retornar 422 con mensaje por defecto si no hay warnings', async () => {
			mockLlamarApiPrediccion.mockResolvedValue({
				success: false
			});

			const event = createPostEvent({
				body: { dias: [1, 2, 3], tallas: [10, 20, 30] }
			});
			const response = await handlePostProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(422);
			expect(data.error).toBe('Error al ejecutar la proyección');
		});
	});

	describe('Manejo de errores', () => {
		it('debería retornar 500 si el body no es JSON válido', async () => {
			const event = {
				locals: { user: { userId: 1 } },
				request: {
					json: () => Promise.reject(new SyntaxError('Unexpected token'))
				}
			} as never;

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const response = await handlePostProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.error).toBe('Error interno del servidor');

			consoleSpy.mockRestore();
		});

		it('debería retornar 500 si la API externa lanza una excepción', async () => {
			mockLlamarApiPrediccion.mockRejectedValue(new Error('Timeout de API'));

			const event = createPostEvent({
				body: { dias: [1, 2, 3], tallas: [10, 20, 30] }
			});

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const response = await handlePostProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.error).toBe('Error interno del servidor');

			consoleSpy.mockRestore();
		});
	});
});
