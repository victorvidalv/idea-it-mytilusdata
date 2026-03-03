import { describe, it, expect, vi, beforeEach } from 'vitest';

// Create mock functions with vi.hoisted
const mockAuthGuard = vi.hoisted(() => vi.fn());
const mockSelect = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => vi.fn());
const mockWhere = vi.hoisted(() => vi.fn());
const mockLimit = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/auth', () => ({
	authGuard: mockAuthGuard
}));

vi.mock('$lib/server/db', () => ({
	db: {
		select: mockSelect
	}
}));

vi.mock('$lib/server/db/schema', () => ({
	apiKeys: { symbol: Symbol('apiKeys') }
}));

vi.mock('drizzle-orm', () => ({
	eq: vi.fn((_, value) => ({ eq: value }))
}));

// Import handle after mocks
const { handle } = await import('../../../hooks.server');

/**
 * Helper to create a minimal RequestEvent for testing hooks
 */
function createHookRequestEvent(options: {
	pathname: string;
	authorization?: string | null;
	user?: { userId: number; email: string; nombre: string; rol: string; sessionId: number } | null;
}): {
	event: Parameters<typeof handle>[0]['event'];
	resolve: ReturnType<typeof vi.fn>;
} {
	const headers = new Map<string, string>();
	if (options.authorization !== undefined && options.authorization !== null) {
		headers.set('Authorization', options.authorization);
	}

	const event = {
		cookies: {
			get: vi.fn(),
			set: vi.fn(),
			delete: vi.fn(),
			getAll: vi.fn(),
			serialize: vi.fn()
		},
		locals: {
			user: options.user ?? null,
			apiUserId: undefined
		} as App.Locals,
		request: {
			headers: {
				get: (key: string) => headers.get(key) ?? null
			}
		} as unknown as Request,
		url: new URL(`http://localhost${options.pathname}`),
		route: { id: options.pathname },
		getClientAddress: () => '127.0.0.1',
		params: {},
		isDataRequest: false,
		isSubRequest: false,
		method: 'GET'
	} as unknown as Parameters<typeof handle>[0]['event'];

	const resolve = vi.fn().mockResolvedValue(new Response('OK', { status: 200 }));

	return { event, resolve };
}

describe('hooks.server.ts - API Authentication', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Default: no authenticated user
		mockAuthGuard.mockResolvedValue(null);
	});

	describe('Rutas /api/ - Protección de autenticación', () => {
		it('debería rechazar solicitudes sin autenticación (401)', async () => {
			const { event, resolve } = createHookRequestEvent({
				pathname: '/api/centros'
			});

			const response = await handle({ event, resolve });

			expect(response.status).toBe(401);
			const data = await response.json();
			expect(data.error).toBe('Se requiere autenticación');
			// resolve should NOT be called since we return early
			expect(resolve).not.toHaveBeenCalled();
		});

		it('debería rechazar solicitudes con header Authorization mal formateado (401)', async () => {
			const { event, resolve } = createHookRequestEvent({
				pathname: '/api/centros',
				authorization: 'InvalidFormat'
			});

			const response = await handle({ event, resolve });

			expect(response.status).toBe(401);
			const data = await response.json();
			expect(data.error).toBe('Se requiere autenticación');
		});

		it('debería rechazar solicitudes con API Key inválida (401)', async () => {
			// Mock API key query returning empty
			mockLimit.mockResolvedValue([]);
			mockWhere.mockReturnValue({ limit: mockLimit });
			mockFrom.mockReturnValue({ where: mockWhere });
			mockSelect.mockReturnValue({ from: mockFrom });

			const { event, resolve } = createHookRequestEvent({
				pathname: '/api/centros',
				authorization: 'Bearer invalid-key'
			});

			const response = await handle({ event, resolve });

			expect(response.status).toBe(401);
			const data = await response.json();
			expect(data.error).toBe('Se requiere autenticación');
		});

		it('debería permitir acceso con sesión de usuario válida', async () => {
			const mockUser = {
				userId: 1,
				email: 'test@example.com',
				nombre: 'Test User',
				rol: 'USUARIO',
				sessionId: 100
			};
			mockAuthGuard.mockResolvedValue(mockUser);

			const { event, resolve } = createHookRequestEvent({
				pathname: '/api/export-data',
				user: mockUser
			});

			await handle({ event, resolve });

			// resolve should be called since user is authenticated
			expect(resolve).toHaveBeenCalled();
			// locals.user should be set
			expect(event.locals.user).toEqual(mockUser);
		});

		it('debería permitir acceso con API Key válida e inyectar apiUserId', async () => {
			// Mock API key query returning valid key
			mockLimit.mockResolvedValue([{ userId: 42, key: 'valid-api-key' }]);
			mockWhere.mockReturnValue({ limit: mockLimit });
			mockFrom.mockReturnValue({ where: mockWhere });
			mockSelect.mockReturnValue({ from: mockFrom });

			const { event, resolve } = createHookRequestEvent({
				pathname: '/api/centros',
				authorization: 'Bearer valid-api-key'
			});

			await handle({ event, resolve });

			// resolve should be called since API key is valid
			expect(resolve).toHaveBeenCalled();
			// apiUserId should be set in locals
			expect(event.locals.apiUserId).toBe(42);
		});

		it('debería priorizar sesión de usuario sobre API Key si ambas están presentes', async () => {
			const mockUser = {
				userId: 1,
				email: 'test@example.com',
				nombre: 'Test User',
				rol: 'USUARIO',
				sessionId: 100
			};
			mockAuthGuard.mockResolvedValue(mockUser);

			const { event, resolve } = createHookRequestEvent({
				pathname: '/api/centros',
				authorization: 'Bearer some-api-key',
				user: mockUser
			});

			await handle({ event, resolve });

			// resolve should be called
			expect(resolve).toHaveBeenCalled();
			// locals.user should be set
			expect(event.locals.user).toEqual(mockUser);
			// apiUserId should NOT be set since session was used
			expect(event.locals.apiUserId).toBeUndefined();
		});
	});

	describe('Rutas no-API - Sin protección de API auth', () => {
		it('no debería aplicar protección API a rutas de UI públicas', async () => {
			const { event, resolve } = createHookRequestEvent({
				pathname: '/acerca-de'
			});

			await handle({ event, resolve });

			// resolve should be called (no API auth blocking)
			expect(resolve).toHaveBeenCalled();
		});

		it('no debería aplicar protección API a rutas públicas de auth', async () => {
			const { event, resolve } = createHookRequestEvent({
				pathname: '/auth/login'
			});

			await handle({ event, resolve });

			// resolve should be called (no API auth blocking)
			expect(resolve).toHaveBeenCalled();
		});
	});

	describe('Validación de API Key contra BD', () => {
		it('debería consultar la base de datos para validar API Key', async () => {
			// Mock API key query
			const mockLimitFn = vi.fn().mockResolvedValue([{ userId: 99, key: 'test-key' }]);
			const mockWhereFn = vi.fn().mockReturnValue({ limit: mockLimitFn });
			const mockFromFn = vi.fn().mockReturnValue({ where: mockWhereFn });
			mockSelect.mockReturnValue({ from: mockFromFn });

			const { event, resolve } = createHookRequestEvent({
				pathname: '/api/ciclos',
				authorization: 'Bearer test-key'
			});

			await handle({ event, resolve });

			// Verify DB was queried
			expect(mockSelect).toHaveBeenCalled();
			expect(mockFromFn).toHaveBeenCalled();
			expect(mockWhereFn).toHaveBeenCalled();
			expect(mockLimitFn).toHaveBeenCalled();
		});
	});
});
