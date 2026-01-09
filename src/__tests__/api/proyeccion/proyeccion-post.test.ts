// @ts-nocheck — Los tipos de ruta generados por SvelteKit crean incompatibilidades en mocks de test
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockVerificarAutenticacion = vi.hoisted(() => vi.fn());
const mockValidarCamposRequeridos = vi.hoisted(() => vi.fn());
const mockValidarLongitudArrays = vi.hoisted(() => vi.fn());
const mockValidarMinimoPuntos = vi.hoisted(() => vi.fn());
const mockEjecutarProyeccion = vi.hoisted(() => vi.fn());

vi.mock('../../../routes/api/proyeccion/validation', () => ({
	verificarAutenticacion: mockVerificarAutenticacion,
	validarCamposRequeridos: mockValidarCamposRequeridos,
	validarLongitudArrays: mockValidarLongitudArrays,
	validarMinimoPuntos: mockValidarMinimoPuntos
}));

vi.mock('$lib/server/biblioteca/similitud', () => ({
	ejecutarProyeccion: mockEjecutarProyeccion
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
		mockEjecutarProyeccion.mockResolvedValue({
			success: true,
			proyeccion: [10, 20, 30],
			curvaUsada: 'curva-1',
			curvaReferencia: [5, 15, 25],
			metadatos: { tipo: 'test' }
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
			expect(data.proyeccion).toEqual([10, 20, 30]);
			expect(data.curvaUsada).toBe('curva-1');
			expect(data.curvaReferencia).toEqual([5, 15, 25]);
			expect(data.metadatos).toEqual({ tipo: 'test' });
		});

		it('debería llamar a ejecutarProyeccion con los parámetros correctos', async () => {
			const body = {
				dias: [1, 2, 3],
				tallas: [10, 20, 30],
				tallaObjetivo: 25,
				diasMax: 90
			};

			const event = createPostEvent({ body });
			await handlePostProyeccion(event);

			expect(mockEjecutarProyeccion).toHaveBeenCalledWith(
				{ dias: [1, 2, 3], tallas: [10, 20, 30] },
				{ tallaObjetivo: 25, diasMax: 90 }
			);
		});

		it('debería retornar 422 si la proyección falla', async () => {
			mockEjecutarProyeccion.mockResolvedValue({
				success: false,
				error: 'No se pudo calcular la proyección'
			});

			const event = createPostEvent({
				body: { dias: [1, 2, 3], tallas: [10, 20, 30] }
			});
			const response = await handlePostProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(422);
			expect(data.error).toBe('No se pudo calcular la proyección');
		});

		it('debería retornar 422 con metadatos cuando la proyección falla', async () => {
			mockEjecutarProyeccion.mockResolvedValue({
				success: false,
				error: 'Datos insuficientes',
				metadatos: { puntos: 2, minimo: 3 }
			});

			const event = createPostEvent({
				body: { dias: [1, 2], tallas: [10, 20] }
			});
			const response = await handlePostProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(422);
			expect(data.error).toBe('Datos insuficientes');
			expect(data.metadatos).toEqual({ puntos: 2, minimo: 3 });
		});

		it('debería retornar 422 con mensaje por defecto si no hay error', async () => {
			mockEjecutarProyeccion.mockResolvedValue({
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

		it('debería retornar 500 si ejecutarProyeccion lanza una excepción', async () => {
			mockEjecutarProyeccion.mockRejectedValue(new Error('Error inesperado'));

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
