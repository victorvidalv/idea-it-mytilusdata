// @ts-nocheck — Los tipos de ruta generados por SvelteKit crean incompatibilidades en mocks de test
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { json } from '@sveltejs/kit';

const mockValidarAdmin = vi.hoisted(() => vi.fn());
const mockExtraerYTransformar = vi.hoisted(() => vi.fn());
const mockProcesarCiclos = vi.hoisted(() => vi.fn());
const mockFiltrarExitosos = vi.hoisted(() => vi.fn());
const mockCargarBiblioteca = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/biblioteca', () => ({
	extraerYTransformar: mockExtraerYTransformar,
	procesarCiclos: mockProcesarCiclos,
	filtrarExitosos: mockFiltrarExitosos,
	cargarBiblioteca: mockCargarBiblioteca
}));

vi.mock('../../../routes/api/poblar/auth', () => ({
	validarAdmin: mockValidarAdmin
}));

import { GET } from '../../../routes/api/poblar/+server';

function createPoblarRequestEvent(options: { authorization?: string | null } = {}) {
	const headers = new Map<string, string>();
	if (options.authorization !== undefined && options.authorization !== null) {
		headers.set('Authorization', options.authorization);
	}

	return {
		request: {
			headers: {
				get: (key: string) => headers.get(key) ?? null
			}
		} as unknown as Request
	} as never;
}

describe('API /api/poblar', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockValidarAdmin.mockResolvedValue({ userId: 1 });
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('GET', () => {
		describe('Autenticación', () => {
			it('debería retornar 401 si falta el header Authorization', async () => {
				mockValidarAdmin.mockResolvedValue({
					error: json({ error: 'Falta el header Authorization' }, { status: 401 })
				});

				const event = createPoblarRequestEvent({ authorization: null });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(401);
				expect(data.error).toBe('Falta el header Authorization');
			});

			it('debería retornar 401 si la API Key es inválida', async () => {
				mockValidarAdmin.mockResolvedValue({
					error: json({ error: 'API Key inválida' }, { status: 401 })
				});

				const event = createPoblarRequestEvent({ authorization: 'Bearer invalid-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(401);
				expect(data.error).toBe('API Key inválida');
			});

			it('debería retornar 403 si el usuario no es ADMIN', async () => {
				mockValidarAdmin.mockResolvedValue({
					error: json({ error: 'Acceso denegado: se requiere rol ADMIN' }, { status: 403 })
				});

				const event = createPoblarRequestEvent({ authorization: 'Bearer user-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(403);
				expect(data.error).toBe('Acceso denegado: se requiere rol ADMIN');
			});
		});

		describe('Casos exitosos', () => {
			it('debería retornar mensaje cuando no hay mediciones', async () => {
				mockExtraerYTransformar.mockResolvedValue({
					adminId: 1,
					datosPorCiclo: [],
					totalMediciones: 0,
					totalCiclos: 0
				});

				const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

				const event = createPoblarRequestEvent({ authorization: 'Bearer admin-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(200);
				expect(data.success).toBe(true);
				expect(data.message).toBe('No hay mediciones de TALLA_LONGITUD para procesar');
				expect(data.estadisticas).toEqual({
					medicionesEncontradas: 0,
					ciclosProcesados: 0,
					ciclosExitosos: 0,
					registrosInsertados: 0
				});

				expect(mockProcesarCiclos).not.toHaveBeenCalled();
				expect(mockFiltrarExitosos).not.toHaveBeenCalled();
				expect(mockCargarBiblioteca).not.toHaveBeenCalled();

				consoleSpy.mockRestore();
			});

			it('debería retornar estadísticas cuando el ETL es exitoso', async () => {
				const mockDatosPorCiclo = [
					{
						cicloId: 1,
						mediciones: [
							{ dia: 0, talla: 1.5 },
							{ dia: 30, talla: 3.0 }
						]
					},
					{
						cicloId: 2,
						mediciones: [
							{ dia: 0, talla: 2.0 },
							{ dia: 30, talla: 4.0 }
						]
					}
				];

				const mockResultados = [
					{ cicloId: 1, exitoso: true, r2: 0.95 },
					{ cicloId: 2, exitoso: true, r2: 0.92 }
				];

				const mockExitosos = [
					{ cicloId: 1, parametros: { a: 1, b: 2 }, r2: 0.95 },
					{ cicloId: 2, parametros: { a: 3, b: 4 }, r2: 0.92 }
				];

				mockExtraerYTransformar.mockResolvedValue({
					adminId: 1,
					datosPorCiclo: mockDatosPorCiclo,
					totalMediciones: 150,
					totalCiclos: 2
				});
				mockProcesarCiclos.mockReturnValue(mockResultados);
				mockFiltrarExitosos.mockReturnValue(mockExitosos);
				mockCargarBiblioteca.mockResolvedValue({
					exitoso: true,
					registrosInsertados: 2
				});

				const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

				const event = createPoblarRequestEvent({ authorization: 'Bearer admin-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(200);
				expect(data.success).toBe(true);
				expect(data.message).toBe('Biblioteca poblada exitosamente');
				expect(data.estadisticas).toEqual({
					medicionesEncontradas: 150,
					ciclosProcesados: 2,
					ciclosExitosos: 2,
					ciclosDescartados: 0,
					registrosInsertados: 2
				});

				expect(mockProcesarCiclos).toHaveBeenCalledWith(mockDatosPorCiclo);
				expect(mockFiltrarExitosos).toHaveBeenCalledWith(mockResultados);
				expect(mockCargarBiblioteca).toHaveBeenCalledWith(mockExitosos, 1);

				consoleSpy.mockRestore();
			});

			it('debería incluir ciclosDescartados en estadísticas cuando hay ciclos filtrados', async () => {
				const mockDatosPorCiclo = [
					{ cicloId: 1, mediciones: [] },
					{ cicloId: 2, mediciones: [] },
					{ cicloId: 3, mediciones: [] }
				];

				const mockResultados = [
					{ cicloId: 1, exitoso: true, r2: 0.95 },
					{ cicloId: 2, exitoso: false, r2: 0.6 },
					{ cicloId: 3, exitoso: true, r2: 0.9 }
				];

				const mockExitosos = [
					{ cicloId: 1, parametros: { a: 1, b: 2 }, r2: 0.95 },
					{ cicloId: 3, parametros: { a: 5, b: 6 }, r2: 0.9 }
				];

				mockExtraerYTransformar.mockResolvedValue({
					adminId: 1,
					datosPorCiclo: mockDatosPorCiclo,
					totalMediciones: 200,
					totalCiclos: 3
				});
				mockProcesarCiclos.mockReturnValue(mockResultados);
				mockFiltrarExitosos.mockReturnValue(mockExitosos);
				mockCargarBiblioteca.mockResolvedValue({
					exitoso: true,
					registrosInsertados: 2
				});

				const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

				const event = createPoblarRequestEvent({ authorization: 'Bearer admin-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(200);
				expect(data.estadisticas.ciclosExitosos).toBe(2);
				expect(data.estadisticas.ciclosDescartados).toBe(1);
				expect(data.estadisticas.ciclosProcesados).toBe(3);

				consoleSpy.mockRestore();
			});
		});

		describe('Manejo de errores', () => {
			it('debería retornar 500 si extraerYTransformar falla', async () => {
				mockExtraerYTransformar.mockRejectedValue(new Error('Error de conexión a BD'));

				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

				const event = createPoblarRequestEvent({ authorization: 'Bearer admin-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(500);
				expect(data.success).toBe(false);
				expect(data.error).toBe('Error de conexión a BD');

				consoleSpy.mockRestore();
			});

			it('debería retornar 500 si cargarBiblioteca falla (no exitoso)', async () => {
				mockExtraerYTransformar.mockResolvedValue({
					adminId: 1,
					datosPorCiclo: [{ cicloId: 1, mediciones: [] }],
					totalMediciones: 50,
					totalCiclos: 1
				});
				mockProcesarCiclos.mockReturnValue([{ cicloId: 1, exitoso: true, r2: 0.95 }]);
				mockFiltrarExitosos.mockReturnValue([{ cicloId: 1, parametros: {}, r2: 0.95 }]);
				mockCargarBiblioteca.mockResolvedValue({
					exitoso: false,
					error: 'Error al vaciar tabla biblioteca'
				});

				const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

				const event = createPoblarRequestEvent({ authorization: 'Bearer admin-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(500);
				expect(data.success).toBe(false);
				expect(data.error).toBe('Error al vaciar tabla biblioteca');

				consoleSpy.mockRestore();
			});

			it('debería retornar 500 si cargarBiblioteca lanza excepción', async () => {
				mockExtraerYTransformar.mockResolvedValue({
					adminId: 1,
					datosPorCiclo: [{ cicloId: 1, mediciones: [] }],
					totalMediciones: 50,
					totalCiclos: 1
				});
				mockProcesarCiclos.mockReturnValue([{ cicloId: 1, exitoso: true, r2: 0.95 }]);
				mockFiltrarExitosos.mockReturnValue([{ cicloId: 1, parametros: {}, r2: 0.95 }]);
				mockCargarBiblioteca.mockRejectedValue(new Error('Timeout de base de datos'));

				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

				const event = createPoblarRequestEvent({ authorization: 'Bearer admin-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(500);
				expect(data.success).toBe(false);
				expect(data.error).toBe('Timeout de base de datos');

				consoleSpy.mockRestore();
			});

			it('debería retornar 500 con mensaje personalizado desde Error', async () => {
				mockExtraerYTransformar.mockRejectedValue(new Error('Fallo específico del ETL'));

				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

				const event = createPoblarRequestEvent({ authorization: 'Bearer admin-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(500);
				expect(data.success).toBe(false);
				expect(data.error).toBe('Fallo específico del ETL');

				consoleSpy.mockRestore();
			});
		});
	});
});
