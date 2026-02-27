import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Tipo para el resultado del mock de json() ---
interface MockJsonResponse {
	data: Record<string, unknown>;
	options?: { status: number; headers?: Record<string, string> };
}

// Crear mocks con vi.hoisted antes de la importación del módulo
const mockSelect = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => vi.fn());
const mockWhere = vi.hoisted(() => vi.fn());
const mockLimit = vi.hoisted(() => vi.fn());

const mockCheckApiRateLimit = vi.hoisted(() => vi.fn());
const mockLogApiRateLimit = vi.hoisted(() => vi.fn());
const mockGetApiRateLimitIdentifier = vi.hoisted(() => vi.fn());
const mockLogApiAccess = vi.hoisted(() => vi.fn());

// Mock de la base de datos
vi.mock('$lib/server/db', () => ({
	db: {
		select: mockSelect
	}
}));

// Mock del schema
vi.mock('$lib/server/db/schema', () => ({
	apiKeys: { symbol: Symbol('apiKeys') }
}));

// Mock de drizzle-orm
vi.mock('drizzle-orm', () => ({
	eq: vi.fn((_, value) => ({ eq: value }))
}));

// Mock del rate limiter de API
vi.mock('$lib/server/apiRateLimiter', () => ({
	checkApiRateLimit: mockCheckApiRateLimit,
	logApiRateLimit: mockLogApiRateLimit,
	getApiRateLimitIdentifier: mockGetApiRateLimitIdentifier
}));

// Mock del módulo de auditoría
vi.mock('$lib/server/audit', () => ({
	logApiAccess: mockLogApiAccess.mockResolvedValue(undefined)
}));

// Mock de @sveltejs/kit — retorna un objeto plano para facilitar assertions
vi.mock('@sveltejs/kit', () => ({
	json: vi.fn((data, options) => ({ data, options }))
}));

// Importar después de configurar los mocks
import { validateApiKey, validateApiKeyAndRateLimit } from './apiAuth';

describe('apiAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Configurar comportamiento por defecto de rate limiting
		mockCheckApiRateLimit.mockResolvedValue({
			allowed: true,
			remaining: 100,
			resetIn: 60000,
			limit: 100
		});
		mockGetApiRateLimitIdentifier.mockReturnValue('apikey:test1234...');
	});

	describe('validateApiKeyAndRateLimit', () => {
		// --- Happy Paths ---

		describe('Happy Paths', () => {
			it('debe retornar userId cuando la API key es válida', async () => {
				// Arrange
				const mockApiKeyRecord = {
					id: 1,
					key: 'valid-api-key-12345',
					userId: 42,
					createdAt: new Date()
				};

				mockSelect.mockReturnValue({
					from: mockFrom.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([mockApiKeyRecord])
						})
					})
				});

				const request = {
					headers: {
						get: vi.fn((key: string) => {
							if (key === 'Authorization') return 'Bearer valid-api-key-12345';
							if (key === 'user-agent') return 'TestAgent/1.0';
							return null;
						})
					}
				};

				const getClientAddress = () => '192.168.1.1';

				// Act
				const result = await validateApiKeyAndRateLimit(
					request as unknown as Request,
					getClientAddress,
					'/api/test',
					'GET',
					'DEFAULT'
				);

				// Assert
				expect(result).not.toHaveProperty('errorResponse');
				if ('userId' in result) {
					expect(result.userId).toBe(42);
					const rateLimitResult = (result as { rateLimitResult: { allowed: boolean } }).rateLimitResult;
					expect(rateLimitResult.allowed).toBe(true);
				}
				expect(mockLogApiRateLimit).toHaveBeenCalledWith('apikey:test1234...');
				expect(mockLogApiAccess).toHaveBeenCalledWith(
					expect.objectContaining({
						userId: 42,
						endpoint: '/api/test',
						method: 'GET',
						ip: '192.168.1.1',
						userAgent: 'TestAgent/1.0'
					})
				);
			});

			it('debe funcionar sin user-agent', async () => {
				// Arrange
				const mockApiKeyRecord = {
					id: 1,
					key: 'valid-api-key',
					userId: 10,
					createdAt: new Date()
				};

				mockSelect.mockReturnValue({
					from: mockFrom.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([mockApiKeyRecord])
						})
					})
				});

				const request = {
					headers: {
						get: vi.fn((key: string) => {
							if (key === 'Authorization') return 'Bearer valid-api-key';
							return null;
						})
					}
				};

				const getClientAddress = () => '10.0.0.1';

				// Act
				const result = await validateApiKeyAndRateLimit(
					request as unknown as Request,
					getClientAddress,
					'/api/data',
					'POST',
					'DEFAULT'
				);

				// Assert
				expect(result).not.toHaveProperty('errorResponse');
				if ('userId' in result) {
					expect(result.userId).toBe(10);
				}
				expect(mockLogApiAccess).toHaveBeenCalledWith(
					expect.objectContaining({
						userId: 10,
						userAgent: undefined
					})
				);
			});

			it('debe usar valores por defecto para method y rateLimitType', async () => {
				// Arrange
				const mockApiKeyRecord = {
					id: 1,
					key: 'key',
					userId: 1,
					createdAt: new Date()
				};

				mockSelect.mockReturnValue({
					from: mockFrom.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([mockApiKeyRecord])
						})
					})
				});

				const request = {
					headers: {
						get: vi.fn(() => 'Bearer key')
					}
				};

				// Act - llamar sin method ni rateLimitType (usar defaults)
				const result = await validateApiKeyAndRateLimit(
					request as unknown as Request,
					() => '127.0.0.1',
					'/api/test'
				);

				// Assert
				expect(result).not.toHaveProperty('errorResponse');
				expect(mockLogApiAccess).toHaveBeenCalledWith(
					expect.objectContaining({
						method: 'GET'
					})
				);
				expect(mockCheckApiRateLimit).toHaveBeenCalledWith('apikey:test1234...', 'DEFAULT');
			});
		});

		// --- Sad Paths ---

		describe('Sad Paths - Header Authorization', () => {
			it('debe rechazar request sin header Authorization', async () => {
				// Arrange
				const request = {
					headers: {
						get: vi.fn(() => null)
					}
				};

				// Act
				const result = await validateApiKeyAndRateLimit(
					request as unknown as Request,
					() => '127.0.0.1',
					'/api/test'
				);

				// Assert
				expect(result).toHaveProperty('errorResponse');
				if ('errorResponse' in result) {
					const errorResp = result.errorResponse as unknown as MockJsonResponse;
					expect(errorResp.data.error).toBe(
						'Falta la API Key en el header Authorization'
					);
					expect(errorResp.options?.status).toBe(401);
				}
				expect(mockSelect).not.toHaveBeenCalled();
			});

			it('debe rechazar header Authorization que no empieza con "Bearer "', async () => {
				// Arrange
				const request = {
					headers: {
						get: vi.fn(() => 'Basic credentials')
					}
				};

				// Act
				const result = await validateApiKeyAndRateLimit(
					request as unknown as Request,
					() => '127.0.0.1',
					'/api/test'
				);

				// Assert
				expect(result).toHaveProperty('errorResponse');
				if ('errorResponse' in result) {
					const errorResp = result.errorResponse as unknown as MockJsonResponse;
					expect(errorResp.data.error).toBe(
						'Falta la API Key en el header Authorization'
					);
					expect(errorResp.options?.status).toBe(401);
				}
			});

			it('debe rechazar header Authorization que es solo "Bearer" sin token', async () => {
				// Arrange
				const request = {
					headers: {
						get: vi.fn(() => 'Bearer')
					}
				};

				// Act
				const result = await validateApiKeyAndRateLimit(
					request as unknown as Request,
					() => '127.0.0.1',
					'/api/test'
				);

				// Assert - "Bearer" sin espacio no cumple startsWith('Bearer ')
				expect(result).toHaveProperty('errorResponse');
				if ('errorResponse' in result) {
					const errorResp = result.errorResponse as unknown as MockJsonResponse;
					expect(errorResp.data.error).toBe(
						'Falta la API Key en el header Authorization'
					);
				}
			});

			it('debe rechazar header Authorization vacío después de "Bearer "', async () => {
				// Arrange - "Bearer " con espacio pero sin token
				const request = {
					headers: {
						get: vi.fn(() => 'Bearer ')
					}
				};

				// El código actual extrae "" como key y busca en BD
				mockSelect.mockReturnValue({
					from: mockFrom.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([])
						})
					})
				});

				// Act
				const result = await validateApiKeyAndRateLimit(
					request as unknown as Request,
					() => '127.0.0.1',
					'/api/test'
				);

				// Assert - llegará a la BD y no encontrará la key vacía
				expect(result).toHaveProperty('errorResponse');
				if ('errorResponse' in result) {
					const errorResp = result.errorResponse as unknown as MockJsonResponse;
					expect(errorResp.data.error).toBe('API Key inválida');
				}
			});
		});

		describe('Sad Paths - API Key inválida', () => {
			it('debe rechazar API key que no existe en la base de datos', async () => {
				// Arrange
				mockSelect.mockReturnValue({
					from: mockFrom.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([])
						})
					})
				});

				const request = {
					headers: {
						get: vi.fn(() => 'Bearer non-existent-key')
					}
				};

				// Act
				const result = await validateApiKeyAndRateLimit(
					request as unknown as Request,
					() => '127.0.0.1',
					'/api/test'
				);

				// Assert
				expect(result).toHaveProperty('errorResponse');
				if ('errorResponse' in result) {
					const errorResp = result.errorResponse as unknown as MockJsonResponse;
					expect(errorResp.data.error).toBe('API Key inválida');
					expect(errorResp.options?.status).toBe(401);
				}
				expect(mockCheckApiRateLimit).not.toHaveBeenCalled();
			});
		});

		describe('Sad Paths - Rate Limiting', () => {
			it('debe rechazar cuando se excede el límite de solicitudes', async () => {
				// Arrange
				const mockApiKeyRecord = {
					id: 1,
					key: 'valid-key',
					userId: 1,
					createdAt: new Date()
				};

				mockSelect.mockReturnValue({
					from: mockFrom.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([mockApiKeyRecord])
						})
					})
				});

				mockCheckApiRateLimit.mockResolvedValue({
					allowed: false,
					remaining: 0,
					resetIn: 30000,
					limit: 100
				});

				const request = {
					headers: {
						get: vi.fn(() => 'Bearer valid-key')
					}
				};

				// Act
				const result = await validateApiKeyAndRateLimit(
					request as unknown as Request,
					() => '127.0.0.1',
					'/api/test'
				);

				// Assert
				expect(result).toHaveProperty('errorResponse');
				if ('errorResponse' in result) {
					const errorResp = result.errorResponse as unknown as MockJsonResponse;
					expect(errorResp.data.error).toBe('Límite de solicitudes excedido');
					expect(errorResp.data.retryAfter).toBe(30000);
					expect(errorResp.options?.status).toBe(429);
					expect(errorResp.options?.headers).toHaveProperty('Retry-After');
					expect(errorResp.options?.headers).toHaveProperty('X-RateLimit-Limit');
					expect(errorResp.options?.headers).toHaveProperty('X-RateLimit-Remaining', '0');
				}
				// No debe registrar el acceso ni el rate limit
				expect(mockLogApiRateLimit).not.toHaveBeenCalled();
				expect(mockLogApiAccess).not.toHaveBeenCalled();
			});

			it('debe incluir headers de rate limit correctos en error 429', async () => {
				// Arrange
				const mockApiKeyRecord = {
					id: 1,
					key: 'key',
					userId: 1,
					createdAt: new Date()
				};

				mockSelect.mockReturnValue({
					from: mockFrom.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([mockApiKeyRecord])
						})
					})
				});

				const resetInMs = 45000;
				mockCheckApiRateLimit.mockResolvedValue({
					allowed: false,
					remaining: 0,
					resetIn: resetInMs,
					limit: 100
				});

				const request = {
					headers: {
						get: vi.fn(() => 'Bearer key')
					}
				};

				// Act
				const result = await validateApiKeyAndRateLimit(
					request as unknown as Request,
					() => '127.0.0.1',
					'/api/test'
				);

				// Assert
				if ('errorResponse' in result) {
					const errorResp = result.errorResponse as unknown as MockJsonResponse;
					const headers = errorResp.options?.headers;
					expect(headers).toBeDefined();
					if (headers) {
						expect(headers['Retry-After']).toBe('45'); // 45000ms / 1000 = 45s
						expect(headers['X-RateLimit-Limit']).toBe('100');
						expect(headers['X-RateLimit-Remaining']).toBe('0');
						// X-RateLimit-Reset debe ser un timestamp futuro
						const resetTimestamp = parseInt(headers['X-RateLimit-Reset'] as string);
						expect(resetTimestamp).toBeGreaterThan(Date.now());
					}
				}
			});
		});

		describe('Integración con audit y rate limiter', () => {
			it('debe obtener el identificador de rate limit con la API key', async () => {
				// Arrange
				const mockApiKeyRecord = {
					id: 1,
					key: 'my-secret-api-key-12345',
					userId: 1,
					createdAt: new Date()
				};

				mockSelect.mockReturnValue({
					from: mockFrom.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([mockApiKeyRecord])
						})
					})
				});

				const request = {
					headers: {
						get: vi.fn(() => 'Bearer my-secret-api-key-12345')
					}
				};
				const clientIp = '203.0.113.42';

				// Act
				await validateApiKeyAndRateLimit(
					request as unknown as Request,
					() => clientIp,
					'/api/test'
				);

				// Assert
				expect(mockGetApiRateLimitIdentifier).toHaveBeenCalledWith(
					'my-secret-api-key-12345',
					clientIp
				);
			});

			it('debe pasar el tipo de rate limit correcto', async () => {
				// Arrange
				const mockApiKeyRecord = {
					id: 1,
					key: 'key',
					userId: 1,
					createdAt: new Date()
				};

				mockSelect.mockReturnValue({
					from: mockFrom.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([mockApiKeyRecord])
						})
					})
				});

				const request = {
					headers: {
						get: vi.fn(() => 'Bearer key')
					}
				};

				// Act
				await validateApiKeyAndRateLimit(
					request as unknown as Request,
					() => '127.0.0.1',
					'/api/export',
					'GET',
					'EXPORT'
				);

				// Assert
				expect(mockCheckApiRateLimit).toHaveBeenCalledWith('apikey:test1234...', 'EXPORT');
			});
		});
	});

	// Tests para validateApiKey (versión simplificada para hooks)
	describe('validateApiKey', () => {
		describe('Happy Paths', () => {
			it('debe retornar valid=true y userId cuando la API key es válida', async () => {
				// Arrange
				const mockApiKeyRecord = {
					id: 1,
					key: 'valid-api-key-12345',
					userId: 42,
					createdAt: new Date()
				};

				mockSelect.mockReturnValue({
					from: mockFrom.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([mockApiKeyRecord])
						})
					})
				});

				// Act
				const result = await validateApiKey('Bearer valid-api-key-12345');

				// Assert
				expect(result.valid).toBe(true);
				expect(result.userId).toBe(42);
			});

			it('debe funcionar con diferentes formatos de API key', async () => {
				// Arrange
				const mockApiKeyRecord = {
					id: 1,
					key: 'sk_test_abc123xyz',
					userId: 99,
					createdAt: new Date()
				};

				mockSelect.mockReturnValue({
					from: mockFrom.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([mockApiKeyRecord])
						})
					})
				});

				// Act
				const result = await validateApiKey('Bearer sk_test_abc123xyz');

				// Assert
				expect(result.valid).toBe(true);
				expect(result.userId).toBe(99);
			});
		});

		describe('Sad Paths - Header inválido', () => {
			it('debe retornar valid=false cuando el header es null', async () => {
				// Act
				const result = await validateApiKey(null);

				// Assert
				expect(result.valid).toBe(false);
				expect(result.userId).toBeUndefined();
				expect(mockSelect).not.toHaveBeenCalled();
			});

			it('debe retornar valid=false cuando el header no empieza con "Bearer "', async () => {
				// Act
				const result = await validateApiKey('Basic credentials');

				// Assert
				expect(result.valid).toBe(false);
				expect(mockSelect).not.toHaveBeenCalled();
			});

			it('debe retornar valid=false cuando el header es "Bearer" sin espacio', async () => {
				// Act
				const result = await validateApiKey('Bearer');

				// Assert
				expect(result.valid).toBe(false);
				expect(mockSelect).not.toHaveBeenCalled();
			});

			it('debe retornar valid=false cuando el header es string vacío', async () => {
				// Act
				const result = await validateApiKey('');

				// Assert
				expect(result.valid).toBe(false);
				expect(mockSelect).not.toHaveBeenCalled();
			});
		});

		describe('Sad Paths - API Key inválida', () => {
			it('debe retornar valid=false cuando la API key no existe en BD', async () => {
				// Arrange
				mockSelect.mockReturnValue({
					from: mockFrom.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([])
						})
					})
				});

				// Act
				const result = await validateApiKey('Bearer non-existent-key');

				// Assert
				expect(result.valid).toBe(false);
				expect(result.userId).toBeUndefined();
			});

			it('debe retornar valid=false para "Bearer " con token vacío', async () => {
				// Arrange
				mockSelect.mockReturnValue({
					from: mockFrom.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([])
						})
					})
				});

				// Act
				const result = await validateApiKey('Bearer ');

				// Assert
				expect(result.valid).toBe(false);
			});
		});
	});
});