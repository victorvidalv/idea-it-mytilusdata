// @ts-nocheck — Los tipos de ruta generados por SvelteKit crean incompatibilidades en mocks de test
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockVerificarAutenticacion = vi.hoisted(() => vi.fn());
const mockValidarCicloIdParam = vi.hoisted(() => vi.fn());
const mockObtenerCicloId = vi.hoisted(() => vi.fn());
const mockObtenerCiclo = vi.hoisted(() => vi.fn());
const mockObtenerMedicionesTalla = vi.hoisted(() => vi.fn());
const mockConvertirMedicionesADias = vi.hoisted(() => vi.fn());

vi.mock('../../../routes/api/proyeccion/validation', () => ({
	verificarAutenticacion: mockVerificarAutenticacion,
	validarCicloIdParam: mockValidarCicloIdParam,
	obtenerCicloId: mockObtenerCicloId
}));

vi.mock('../../../routes/api/proyeccion/queries', () => ({
	obtenerCiclo: mockObtenerCiclo,
	obtenerMedicionesTalla: mockObtenerMedicionesTalla,
	convertirMedicionesADias: mockConvertirMedicionesADias
}));

import { handleGetProyeccion } from '../../../routes/api/proyeccion/handlers/get';

function createProyeccionEvent(options: {
	user?: { userId: number } | null;
	cicloId?: string | null;
}) {
	const url = new URL('http://localhost/api/proyeccion');
	if (options.cicloId !== undefined && options.cicloId !== null) {
		url.searchParams.set('cicloId', options.cicloId);
	}
	return {
		locals: { user: options.user ?? null },
		url
	} as never;
}

describe('GET /api/proyeccion', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Autenticación', () => {
		it('debería retornar 401 si el usuario no está autenticado', async () => {
			mockVerificarAutenticacion.mockReturnValue(null);

			const event = createProyeccionEvent({ user: null });
			const response = await handleGetProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(401);
			expect(data.error).toBe('No autorizado');
		});
	});

	describe('Validación de parámetros', () => {
		it('debería retornar 400 si falta el parámetro cicloId', async () => {
			mockVerificarAutenticacion.mockReturnValue(1);
			mockValidarCicloIdParam.mockReturnValue({
				valido: false,
				error: 'El parámetro cicloId es obligatorio'
			});

			const event = createProyeccionEvent({ user: { userId: 1 }, cicloId: null });
			const response = await handleGetProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('El parámetro cicloId es obligatorio');
		});

		it('debería retornar 400 si cicloId no es un número válido', async () => {
			mockVerificarAutenticacion.mockReturnValue(1);
			mockValidarCicloIdParam.mockReturnValue({ valido: true });
			mockObtenerCicloId.mockReturnValue(null);

			const event = createProyeccionEvent({ user: { userId: 1 }, cicloId: 'abc' });
			const response = await handleGetProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(400);
			expect(data.error).toBe('Parámetro cicloId inválido');
		});
	});

	describe('Consulta de ciclo', () => {
		it('debería retornar 404 si el ciclo no existe o no pertenece al usuario', async () => {
			mockVerificarAutenticacion.mockReturnValue(1);
			mockValidarCicloIdParam.mockReturnValue({ valido: true });
			mockObtenerCicloId.mockReturnValue(999);
			mockObtenerCiclo.mockResolvedValue(null);

			const event = createProyeccionEvent({ user: { userId: 1 }, cicloId: '999' });
			const response = await handleGetProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(404);
			expect(data.error).toBe('Ciclo no encontrado o no pertenece al usuario');
		});
	});

	describe('Mediciones insuficientes', () => {
		it('debería retornar 422 si hay menos de 3 mediciones', async () => {
			mockVerificarAutenticacion.mockReturnValue(1);
			mockValidarCicloIdParam.mockReturnValue({ valido: true });
			mockObtenerCicloId.mockReturnValue(1);
			mockObtenerCiclo.mockResolvedValue({
				id: 1,
				nombre: 'Ciclo Test',
				fechaSiembra: '2024-01-01'
			});
			mockObtenerMedicionesTalla.mockResolvedValue([
				{ valor: 10, fechaMedicion: '2024-02-01' },
				{ valor: 15, fechaMedicion: '2024-03-01' }
			]);
			mockConvertirMedicionesADias.mockReturnValue([
				{ dia: 31, talla: 10 },
				{ dia: 60, talla: 15 }
			]);

			const event = createProyeccionEvent({ user: { userId: 1 }, cicloId: '1' });
			const response = await handleGetProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(422);
			expect(data.error).toBe('Se requieren al menos 3 mediciones de talla para proyectar');
			expect(data.totalMediciones).toBe(2);
		});
	});

	describe('Caso exitoso', () => {
		it('debería retornar 200 con datos del ciclo y mediciones', async () => {
			const mockCiclo = {
				id: 1,
				nombre: 'Ciclo 2024',
				fechaSiembra: '2024-01-01'
			};
			const mockMediciones = [
				{ dia: 30, talla: 10 },
				{ dia: 60, talla: 15 },
				{ dia: 90, talla: 20 }
			];

			mockVerificarAutenticacion.mockReturnValue(1);
			mockValidarCicloIdParam.mockReturnValue({ valido: true });
			mockObtenerCicloId.mockReturnValue(1);
			mockObtenerCiclo.mockResolvedValue(mockCiclo);
			mockObtenerMedicionesTalla.mockResolvedValue([
				{ valor: 10, fechaMedicion: '2024-01-31' },
				{ valor: 15, fechaMedicion: '2024-03-01' },
				{ valor: 20, fechaMedicion: '2024-03-31' }
			]);
			mockConvertirMedicionesADias.mockReturnValue(mockMediciones);

			const event = createProyeccionEvent({ user: { userId: 1 }, cicloId: '1' });
			const response = await handleGetProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(200);
			expect(data.success).toBe(true);
			expect(data.ciclo).toEqual({ id: 1, nombre: 'Ciclo 2024', fechaSiembra: '2024-01-01' });
			expect(data.mediciones).toEqual(mockMediciones);
			expect(data.mediciones).toHaveLength(3);
		});
	});

	describe('Manejo de errores', () => {
		it('debería retornar 500 si hay error interno', async () => {
			mockVerificarAutenticacion.mockReturnValue(1);
			mockValidarCicloIdParam.mockReturnValue({ valido: true });
			mockObtenerCicloId.mockReturnValue(1);
			mockObtenerCiclo.mockRejectedValue(new Error('Error de base de datos'));

			const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

			const event = createProyeccionEvent({ user: { userId: 1 }, cicloId: '1' });
			const response = await handleGetProyeccion(event);
			const data = await response.json();

			expect(response.status).toBe(500);
			expect(data.error).toBe('Error interno del servidor');

			consoleSpy.mockRestore();
		});
	});
});
