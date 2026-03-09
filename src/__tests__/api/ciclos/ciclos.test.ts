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
	ciclos: { symbol: Symbol('ciclos') }
}));

vi.mock('drizzle-orm', () => ({
	eq: vi.fn((_, value) => ({ eq: value })),
	sql: vi.fn(),
	desc: vi.fn()
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
import { GET } from '../../../routes/api/ciclos/+server';

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
		route: { id: '/api/ciclos' },
		url: new URL('http://localhost/api/ciclos'),
		isDataRequest: false,
		isSubRequest: false,
		method: 'GET'
	} as never;
}

describe('API /api/ciclos', () => {
	/**
	 * Setup mock for the API key validation query (with .limit())
	 */
	function mockApiKeyQuery(result: { userId: number; key: string } | null) {
		mockLimit.mockResolvedValue(result ? [result] : []);
		mockWhere.mockReturnValue({ limit: mockLimit });
		mockFrom.mockReturnValue({ where: mockWhere });
		mockSelect.mockReturnValue({ from: mockFrom });
	}

	/**
	 * Setup both queries in sequence
	 */
	function mockBothQueries(
		apiKeyResult: { userId: number; key: string } | null,
		ciclosResults: unknown[]
	) {
		// 1st call: API key query (needs .limit())
		const limitMock = vi.fn().mockResolvedValue(apiKeyResult ? [apiKeyResult] : []);
		const whereMockWithLimit = vi.fn().mockReturnValue({ limit: limitMock });
		const fromMockFirst = vi.fn().mockReturnValue({ where: whereMockWithLimit });

		// 2nd call: COUNT query
		const whereMockCount = vi.fn().mockResolvedValue([{ count: ciclosResults.length }]);
		const fromMockCount = vi.fn().mockReturnValue({ where: whereMockCount });

		// 3rd call: data query con paginación (where → orderBy → limit → offset)
		const offsetMock = vi.fn().mockResolvedValue(ciclosResults);
		const dataLimitMock = vi.fn().mockReturnValue({ offset: offsetMock });
		const orderByMock = vi.fn().mockReturnValue({ limit: dataLimitMock });
		const whereMockData = vi.fn().mockReturnValue({ orderBy: orderByMock });
		const fromMockData = vi.fn().mockReturnValue({ where: whereMockData });

		// Encadenar las 3 llamadas
		mockSelect
			.mockReturnValueOnce({ from: fromMockFirst })
			.mockReturnValueOnce({ from: fromMockCount })
			.mockReturnValueOnce({ from: fromMockData });
	}

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
				mockApiKeyQuery(null);

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

				mockApiKeyQuery({ userId: 1, key: 'test-key' });

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
				mockBothQueries({ userId: 1, key: 'test-key' }, []);

				const event = createApiRequestEvent({
					authorization: 'Bearer test-key',
					clientAddress: '192.168.1.1'
				});

				await GET(event);

				expect(mockGetApiRateLimitIdentifier).toHaveBeenCalledWith('test-key', '192.168.1.1');
				expect(mockCheckApiRateLimit).toHaveBeenCalledWith('test-identifier', 'DEFAULT');
			});

			it('debería registrar la solicitud en el rate limiter', async () => {
				mockBothQueries({ userId: 1, key: 'test-key' }, []);

				const event = createApiRequestEvent({ authorization: 'Bearer test-key' });

				await GET(event);

				expect(mockLogApiRateLimit).toHaveBeenCalledWith('test-identifier');
			});
		});

		describe('Casos exitosos', () => {
			it('debería retornar lista de ciclos vacía si no hay ciclos', async () => {
				mockBothQueries({ userId: 1, key: 'test-key' }, []);

				const event = createApiRequestEvent({ authorization: 'Bearer test-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(200);
				expect(data.data).toEqual([]);
			});

			it('debería retornar lista de ciclos del usuario', async () => {
				const mockCiclos = [
					{
						id: 1,
						nombre: 'Ciclo 2024',
						fechaInicio: new Date('2024-01-01'),
						fechaFin: new Date('2024-12-31'),
						lugarId: 1,
						userId: 1
					},
					{
						id: 2,
						nombre: 'Ciclo 2023',
						fechaInicio: new Date('2023-01-01'),
						fechaFin: new Date('2023-12-31'),
						lugarId: 1,
						userId: 1
					}
				];

				mockBothQueries({ userId: 1, key: 'test-key' }, mockCiclos);

				const event = createApiRequestEvent({ authorization: 'Bearer test-key' });

				const response = await GET(event);
				const data = await response.json();

				expect(response.status).toBe(200);
				expect(data.data).toHaveLength(2);
				expect(data.data[0].nombre).toBe('Ciclo 2024');
				expect(data.data[1].nombre).toBe('Ciclo 2023');
			});

			it('debería incluir headers de rate limit en la respuesta exitosa', async () => {
				mockBothQueries({ userId: 1, key: 'test-key' }, []);

				const event = createApiRequestEvent({ authorization: 'Bearer test-key' });

				const response = await GET(event);

				expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
				expect(response.headers.get('X-RateLimit-Remaining')).toBe('99');
				expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
			});

			it('debería registrar acceso en auditoría', async () => {
				mockBothQueries({ userId: 1, key: 'test-key' }, []);

				const event = createApiRequestEvent({
					authorization: 'Bearer test-key',
					clientAddress: '10.0.0.1',
					userAgent: 'TestAgent/1.0'
				});

				await GET(event);

				expect(mockLogApiAccess).toHaveBeenCalledWith({
					userId: 1,
					endpoint: '/api/ciclos',
					method: 'GET',
					ip: '10.0.0.1',
					userAgent: 'TestAgent/1.0'
				});
			});
		});

		describe('Manejo de errores', () => {
			it('debería retornar 500 si hay error de base de datos', async () => {
				// 1st call: API key query succeeds
				const limitMock = vi.fn().mockResolvedValue([{ userId: 1, key: 'test-key' }]);
				const whereMockWithLimit = vi.fn().mockReturnValue({ limit: limitMock });
				const fromMockFirst = vi.fn().mockReturnValue({ where: whereMockWithLimit });

				// 2nd call: COUNT query fails
				const whereMockError = vi.fn().mockRejectedValue(new Error('DB connection error'));
				const fromMockSecond = vi.fn().mockReturnValue({ where: whereMockError });

				mockSelect
					.mockReturnValueOnce({ from: fromMockFirst })
					.mockReturnValueOnce({ from: fromMockSecond });

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
