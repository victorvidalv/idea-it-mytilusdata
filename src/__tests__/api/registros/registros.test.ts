// @ts-nocheck — Los tipos de ruta generados por SvelteKit crean incompatibilidades en mocks de test
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';


// Create all mock functions with vi.hoisted
const mockSelect = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => vi.fn());
const mockWhere = vi.hoisted(() => vi.fn());
const mockLimit = vi.hoisted(() => vi.fn());

const mockCheckApiRateLimit = vi.hoisted(() => vi.fn());
const mockLogApiRateLimit = vi.hoisted(() => vi.fn());
const mockGetApiRateLimitIdentifier = vi.hoisted(() => vi.fn());
const mockLogApiAccess = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/db', () => ({
	db: {
		select: mockSelect
	}
}));

vi.mock('$lib/server/db/schema', () => ({
	apiKeys: { symbol: Symbol('apiKeys') },
	mediciones: { symbol: Symbol('mediciones') }
}));

vi.mock('drizzle-orm', () => ({
	eq: vi.fn((_, value) => ({ eq: value }))
}));

vi.mock('$lib/server/apiRateLimiter', () => ({
	checkApiRateLimit: mockCheckApiRateLimit,
	logApiRateLimit: mockLogApiRateLimit,
	getApiRateLimitIdentifier: mockGetApiRateLimitIdentifier
}));

vi.mock('$lib/server/audit', () => ({
	logApiAccess: mockLogApiAccess
}));

// Import after mocks are set up
import { GET } from '../../../routes/api/registros/+server';

/**
 * Helper para crear RequestEvent mock para endpoints de API
 */
function createApiRequestEvent(options: {
	authorization?: string | null;
	clientAddress?: string;
	userAgent?: string;
}) {
	const headers = new Map<string, string>();
	if (options.authorization !== undefined && options.authorization !== null) {
		headers.set('Authorization', options.authorization);
	}
	if (options.userAgent) {
		headers.set('user-agent', options.userAgent);
	}

	return {
		request: {
			headers: {
				get: (key: string) => headers.get(key) ?? null
			}
		} as unknown as Request,
		getClientAddress: () => options.clientAddress ?? '127.0.0.1',
		locals: {
			user: null
		},
		cookies: {
			get: vi.fn(),
			set: vi.fn(),
			delete: vi.fn(),
			getAll: vi.fn(),
			serialize: vi.fn()
		},
		params: {},
		route: { id: '/api/registros' },
		url: new URL('http://localhost/api/registros'),
		isDataRequest: false,
		isSubRequest: false,
		method: 'GET'
	} as never;
}

describe('API /api/registros', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCheckApiRateLimit.mockResolvedValue({
			allowed: true,
			remaining: 100,
			limit: 100,
			resetIn: 60000
		});
		mockGetApiRateLimitIdentifier.mockReturnValue('test-identifier');
		mockLogApiAccess.mockResolvedValue(undefined);
		mockLogApiRateLimit.mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('GET', () => {
		describe('Autenticación', () => {
			it('debería retornar 401 si falta el header Authorization', async () => {
				const event = createApiRequestEvent({ authorization: null });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(401);
				expect(data.error).toBe('Falta la API Key en el header Authorization');
			});

			it('debería retornar 401 si el header Authorization no tiene formato Bearer', async () => {
				const event = createApiRequestEvent({ authorization: 'InvalidFormat' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(401);
				expect(data.error).toBe('Falta la API Key en el header Authorization');
			});

			it('debería retornar 401 si la API Key es inválida', async () => {
				// Setup: db.select().from(apiKeys).where(...).limit(1) returns []
				mockLimit.mockResolvedValue([]);
				mockWhere.mockReturnValue({ limit: mockLimit });
				mockFrom.mockReturnValue({ where: mockWhere });
				mockSelect.mockReturnValue({ from: mockFrom });

				const event = createApiRequestEvent({ authorization: 'Bearer invalid-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(401);
				expect(data.error).toBe('API Key inválida');
			});
		});

		describe('Rate Limiting', () => {
			it('debería retornar 429 si se excede el límite de solicitudes', async () => {
				mockCheckApiRateLimit.mockResolvedValue({
					allowed: false,
					remaining: 0,
					limit: 100,
					resetIn: 30000
				});

				// Setup API key query to return valid key
				mockLimit.mockResolvedValue([{ userId: 1, key: 'test-key' }]);
				mockWhere.mockReturnValue({ limit: mockLimit });
				mockFrom.mockReturnValue({ where: mockWhere });
				mockSelect.mockReturnValue({ from: mockFrom });

				const event = createApiRequestEvent({ authorization: 'Bearer test-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(429);
				expect(data.error).toBe('Límite de solicitudes excedido');
				expect(data.retryAfter).toBe(30000);
				expect(response.headers.get('Retry-After')).toBe('30');
				expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
				expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
			});

			it('debería llamar a checkApiRateLimit con el identificador correcto', async () => {
				// First call: API key query
				const limitMock1 = vi.fn().mockResolvedValue([{ userId: 1, key: 'test-key' }]);
				const whereMock1 = vi.fn().mockReturnValue({ limit: limitMock1 });
				const fromMock1 = vi.fn().mockReturnValue({ where: whereMock1 });

				// Second call: registros query
				const whereMock2 = vi.fn().mockResolvedValue([]);
				const fromMock2 = vi.fn().mockReturnValue({ where: whereMock2 });

				mockSelect
					.mockReturnValueOnce({ from: fromMock1 })
					.mockReturnValueOnce({ from: fromMock2 });

				const event = createApiRequestEvent({
					authorization: 'Bearer test-key',
					clientAddress: '192.168.1.1'
				});

				await GET(event);

				expect(mockGetApiRateLimitIdentifier).toHaveBeenCalledWith('test-key', '192.168.1.1');
				expect(mockCheckApiRateLimit).toHaveBeenCalledWith('test-identifier', 'DEFAULT');
			});

			it('debería registrar la solicitud en el rate limiter', async () => {
				// First call: API key query
				const limitMock1 = vi.fn().mockResolvedValue([{ userId: 1, key: 'test-key' }]);
				const whereMock1 = vi.fn().mockReturnValue({ limit: limitMock1 });
				const fromMock1 = vi.fn().mockReturnValue({ where: whereMock1 });

				// Second call: registros query
				const whereMock2 = vi.fn().mockResolvedValue([]);
				const fromMock2 = vi.fn().mockReturnValue({ where: whereMock2 });

				mockSelect
					.mockReturnValueOnce({ from: fromMock1 })
					.mockReturnValueOnce({ from: fromMock2 });

				const event = createApiRequestEvent({ authorization: 'Bearer test-key' });

				await GET(event);

				expect(mockLogApiRateLimit).toHaveBeenCalledWith('test-identifier');
			});
		});

		describe('Casos exitosos', () => {
			it('debería retornar lista de registros vacía si no hay registros', async () => {
				// First call: API key query
				const limitMock1 = vi.fn().mockResolvedValue([{ userId: 1, key: 'test-key' }]);
				const whereMock1 = vi.fn().mockReturnValue({ limit: limitMock1 });
				const fromMock1 = vi.fn().mockReturnValue({ where: whereMock1 });

				// Second call: registros query
				const whereMock2 = vi.fn().mockResolvedValue([]);
				const fromMock2 = vi.fn().mockReturnValue({ where: whereMock2 });

				mockSelect
					.mockReturnValueOnce({ from: fromMock1 })
					.mockReturnValueOnce({ from: fromMock2 });

				const event = createApiRequestEvent({ authorization: 'Bearer test-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(200);
				expect(data.data).toEqual([]);
			});

			it('debería retornar lista de registros del usuario', async () => {
				const mockRegistros = [
					{
						id: 1,
						fecha: new Date('2024-01-15'),
						cicloId: 1,
						tipoId: 1,
						valor: 25.5,
						notas: 'Registro 1'
					},
					{
						id: 2,
						fecha: new Date('2024-01-16'),
						cicloId: 1,
						tipoId: 1,
						valor: 26.0,
						notas: 'Registro 2'
					}
				];

				// First call: API key query
				const limitMock1 = vi.fn().mockResolvedValue([{ userId: 1, key: 'test-key' }]);
				const whereMock1 = vi.fn().mockReturnValue({ limit: limitMock1 });
				const fromMock1 = vi.fn().mockReturnValue({ where: whereMock1 });

				// Second call: registros query
				const whereMock2 = vi.fn().mockResolvedValue(mockRegistros);
				const fromMock2 = vi.fn().mockReturnValue({ where: whereMock2 });

				mockSelect
					.mockReturnValueOnce({ from: fromMock1 })
					.mockReturnValueOnce({ from: fromMock2 });

				const event = createApiRequestEvent({ authorization: 'Bearer test-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(200);
				expect(data.data).toHaveLength(2);
			});

			it('debería incluir headers de rate limit en la respuesta exitosa', async () => {
				// First call: API key query
				const limitMock1 = vi.fn().mockResolvedValue([{ userId: 1, key: 'test-key' }]);
				const whereMock1 = vi.fn().mockReturnValue({ limit: limitMock1 });
				const fromMock1 = vi.fn().mockReturnValue({ where: whereMock1 });

				// Second call: registros query
				const whereMock2 = vi.fn().mockResolvedValue([]);
				const fromMock2 = vi.fn().mockReturnValue({ where: whereMock2 });

				mockSelect
					.mockReturnValueOnce({ from: fromMock1 })
					.mockReturnValueOnce({ from: fromMock2 });

				const event = createApiRequestEvent({ authorization: 'Bearer test-key' });

				const response = await GET(event);

				expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
				expect(response.headers.get('X-RateLimit-Remaining')).toBe('99');
				expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
			});

			it('debería registrar acceso en auditoría', async () => {
				// First call: API key query
				const limitMock1 = vi.fn().mockResolvedValue([{ userId: 1, key: 'test-key' }]);
				const whereMock1 = vi.fn().mockReturnValue({ limit: limitMock1 });
				const fromMock1 = vi.fn().mockReturnValue({ where: whereMock1 });

				// Second call: registros query
				const whereMock2 = vi.fn().mockResolvedValue([]);
				const fromMock2 = vi.fn().mockReturnValue({ where: whereMock2 });

				mockSelect
					.mockReturnValueOnce({ from: fromMock1 })
					.mockReturnValueOnce({ from: fromMock2 });

				const event = createApiRequestEvent({
					authorization: 'Bearer test-key',
					clientAddress: '10.0.0.1',
					userAgent: 'TestAgent/1.0'
				});

				await GET(event);

				expect(mockLogApiAccess).toHaveBeenCalledWith({
					userId: 1,
					endpoint: '/api/registros',
					method: 'GET',
					ip: '10.0.0.1',
					userAgent: 'TestAgent/1.0'
				});
			});
		});

		describe('Manejo de errores', () => {
			it('debería retornar 500 si hay error de base de datos', async () => {
				// First call: API key query succeeds
				const limitMock1 = vi.fn().mockResolvedValue([{ userId: 1, key: 'test-key' }]);
				const whereMock1 = vi.fn().mockReturnValue({ limit: limitMock1 });
				const fromMock1 = vi.fn().mockReturnValue({ where: whereMock1 });

				// Second call: registros query fails
				const whereMock2 = vi.fn().mockRejectedValue(new Error('DB connection error'));
				const fromMock2 = vi.fn().mockReturnValue({ where: whereMock2 });

				mockSelect
					.mockReturnValueOnce({ from: fromMock1 })
					.mockReturnValueOnce({ from: fromMock2 });

				const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

				const event = createApiRequestEvent({ authorization: 'Bearer test-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(500);
				expect(data.error).toBe('Error interno del servidor');

				consoleSpy.mockRestore();
			});
		});
	});
});
