import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';

// Crear mocks con vi.hoisted antes de las importaciones
const mockInvalidateSession = vi.hoisted(() => vi.fn());
const mockLogLogout = vi.hoisted(() => vi.fn());

// Mock de @sveltejs/kit
const mockRedirect = vi.hoisted(() =>
	vi.fn((status: number, location: string) => {
		const error = new Error('Redirect');
		(error as { status: number; location: string }).status = status;
		(error as { status: number; location: string }).location = location;
		throw error;
	})
);

vi.mock('@sveltejs/kit', () => ({
	redirect: mockRedirect
}));

// Mock del auth
vi.mock('$lib/server/auth', () => ({
	invalidateSession: mockInvalidateSession
}));

// Mock del audit
vi.mock('$lib/server/audit', () => ({
	logLogout: mockLogLogout
}));

// Tipos para el helper
interface LogoutTestOptions {
	user?: { userId: number; email: string; rol: string; nombre: string; sessionId: number } | null;
	userAgent?: string;
	clientIp?: string;
}

// Helper para crear RequestEvent mock para POST
function createLogoutRequestEvent(overrides: LogoutTestOptions = {}): RequestEvent {
	const event = {
		cookies: {
			get: vi.fn(),
			set: vi.fn(),
			delete: vi.fn(),
			getAll: vi.fn(),
			serialize: vi.fn()
		},
		locals: {
			user: overrides.user ?? undefined
		},
		request: {
			headers: {
				get: (name: string) => (name === 'user-agent' ? (overrides.userAgent ?? 'TestAgent') : null)
			}
		},
		getClientAddress: () => overrides.clientIp ?? '192.168.1.1',
		params: {},
		route: { id: '/auth/logout' },
		url: new URL('http://localhost/auth/logout'),
		isDataRequest: false,
		isSubRequest: false,
		method: 'POST'
	};

	return event as unknown as RequestEvent;
}

// Importar después de configurar los mocks
import { POST } from '../../routes/auth/logout/+server';

describe('Auth Logout', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset mock implementations
		mockInvalidateSession.mockResolvedValue(undefined);
		mockLogLogout.mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('POST - Logout exitoso', () => {
		it('debería invalidar sesión cuando usuario está autenticado', async () => {
			const user = {
				userId: 1,
				email: 'test@example.com',
				rol: 'USUARIO',
				nombre: 'Test User',
				sessionId: 100
			};

			const event = createLogoutRequestEvent({
				user,
				clientIp: '10.20.30.40',
				userAgent: 'Mozilla/5.0 (Test Browser)'
			});

			await expect(POST(event)).rejects.toMatchObject({
				status: 303,
				location: '/auth/login'
			});

			expect(mockInvalidateSession).toHaveBeenCalledWith(100);
		});

		it('debería registrar logout en auditoría', async () => {
			const user = {
				userId: 5,
				email: 'user@example.com',
				rol: 'ADMIN',
				nombre: 'Admin User',
				sessionId: 200
			};

			const event = createLogoutRequestEvent({
				user,
				clientIp: '172.16.0.1',
				userAgent: 'Chrome/120.0'
			});

			await expect(POST(event)).rejects.toMatchObject({
				status: 303
			});

			expect(mockLogLogout).toHaveBeenCalledWith({
				userId: 5,
				ip: '172.16.0.1',
				userAgent: 'Chrome/120.0'
			});
		});

		it('debería borrar cookie de sesión', async () => {
			const user = {
				userId: 1,
				email: 'test@example.com',
				rol: 'USUARIO',
				nombre: 'Test User',
				sessionId: 100
			};

			const event = createLogoutRequestEvent({ user });

			await expect(POST(event)).rejects.toMatchObject({
				status: 303
			});

			expect(event.cookies.delete).toHaveBeenCalledWith('session', { path: '/' });
		});

		it('debería redirigir a login después de logout', async () => {
			const user = {
				userId: 1,
				email: 'test@example.com',
				rol: 'USUARIO',
				nombre: 'Test User',
				sessionId: 100
			};

			const event = createLogoutRequestEvent({ user });

			await expect(POST(event)).rejects.toMatchObject({
				status: 303,
				location: '/auth/login'
			});
		});
	});

	describe('POST - Logout sin sesión', () => {
		it('debería manejar logout sin usuario autenticado', async () => {
			const event = createLogoutRequestEvent({
				user: null
			});

			await expect(POST(event)).rejects.toMatchObject({
				status: 303,
				location: '/auth/login'
			});

			// No debería invalidar sesión si no hay usuario
			expect(mockInvalidateSession).not.toHaveBeenCalled();
			expect(mockLogLogout).not.toHaveBeenCalled();
		});

		it('debería borrar cookie incluso sin usuario autenticado', async () => {
			const event = createLogoutRequestEvent({
				user: null
			});

			await expect(POST(event)).rejects.toMatchObject({
				status: 303
			});

			expect(event.cookies.delete).toHaveBeenCalledWith('session', { path: '/' });
		});

		it('debería redirigir a login cuando no hay usuario', async () => {
			const event = createLogoutRequestEvent({
				user: null
			});

			await expect(POST(event)).rejects.toMatchObject({
				status: 303,
				location: '/auth/login'
			});
		});
	});

	describe('POST - Información de auditoría', () => {
		it('debería pasar IP correcta a logLogout', async () => {
			const user = {
				userId: 1,
				email: 'test@example.com',
				rol: 'USUARIO',
				nombre: 'Test User',
				sessionId: 100
			};

			const event = createLogoutRequestEvent({
				user,
				clientIp: '203.0.113.50'
			});

			await expect(POST(event)).rejects.toMatchObject({
				status: 303
			});

			expect(mockLogLogout).toHaveBeenCalledWith(
				expect.objectContaining({
					ip: '203.0.113.50'
				})
			);
		});

		it('debería pasar user-agent correcto a logLogout', async () => {
			const user = {
				userId: 1,
				email: 'test@example.com',
				rol: 'USUARIO',
				nombre: 'Test User',
				sessionId: 100
			};

			const event = createLogoutRequestEvent({
				user,
				userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			});

			await expect(POST(event)).rejects.toMatchObject({
				status: 303
			});

			expect(mockLogLogout).toHaveBeenCalledWith(
				expect.objectContaining({
					userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
				})
			);
		});

		it('debería pasar userId correcto a logLogout', async () => {
			const user = {
				userId: 42,
				email: 'specific@example.com',
				rol: 'INVESTIGADOR',
				nombre: 'Investigador',
				sessionId: 500
			};

			const event = createLogoutRequestEvent({ user });

			await expect(POST(event)).rejects.toMatchObject({
				status: 303
			});

			expect(mockLogLogout).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 42
				})
			);
		});
	});

	describe('POST - Manejo de user-agent', () => {
		it('debería manejar user-agent undefined', async () => {
			const user = {
				userId: 1,
				email: 'test@example.com',
				rol: 'USUARIO',
				nombre: 'Test User',
				sessionId: 100
			};

			const event = createLogoutRequestEvent({
				user,
				userAgent: ''
			});

			// Modificar para que headers.get retorne null
			event.request.headers.get = () => null;

			await expect(POST(event)).rejects.toMatchObject({
				status: 303
			});

			expect(mockLogLogout).toHaveBeenCalledWith(
				expect.objectContaining({
					userAgent: undefined
				})
			);
		});
	});

	describe('POST - Orden de operaciones', () => {
		it('debería ejecutar invalidación antes de log de auditoría', async () => {
			const user = {
				userId: 1,
				email: 'test@example.com',
				rol: 'USUARIO',
				nombre: 'Test User',
				sessionId: 100
			};

			const event = createLogoutRequestEvent({ user });

			const order: string[] = [];
			mockInvalidateSession.mockImplementation(async () => {
				order.push('invalidate');
			});
			mockLogLogout.mockImplementation(async () => {
				order.push('log');
			});

			await expect(POST(event)).rejects.toMatchObject({
				status: 303
			});

			expect(order).toEqual(['invalidate', 'log']);
		});
	});

	describe('POST - Casos edge', () => {
		it('debería manejar diferentes roles de usuario', async () => {
			const roles = ['USUARIO', 'INVESTIGADOR', 'ADMIN'];

			for (const rol of roles) {
				// Reset mocks pero mantener implementación
				mockInvalidateSession.mockClear();
				mockLogLogout.mockClear();

				const user = {
					userId: 1,
					email: 'test@example.com',
					rol,
					nombre: 'Test User',
					sessionId: 100
				};

				const event = createLogoutRequestEvent({ user });

				await expect(POST(event)).rejects.toMatchObject({
					status: 303,
					location: '/auth/login'
				});

				expect(mockInvalidateSession).toHaveBeenCalledWith(100);
				expect(mockLogLogout).toHaveBeenCalled();
			}
		});

		it('debería borrar cookie con path correcto', async () => {
			const user = {
				userId: 1,
				email: 'test@example.com',
				rol: 'USUARIO',
				nombre: 'Test User',
				sessionId: 100
			};

			const event = createLogoutRequestEvent({ user });

			await expect(POST(event)).rejects.toMatchObject({
				status: 303
			});

			expect(event.cookies.delete).toHaveBeenCalledWith('session', { path: '/' });
		});

		it('debería invalidar la sessionId correcta', async () => {
			const user = {
				userId: 10,
				email: 'user10@example.com',
				rol: 'USUARIO',
				nombre: 'User 10',
				sessionId: 999
			};

			const event = createLogoutRequestEvent({ user });

			await expect(POST(event)).rejects.toMatchObject({
				status: 303
			});

			expect(mockInvalidateSession).toHaveBeenCalledWith(999);
		});
	});

	describe('POST - Verificaciones de seguridad', () => {
		it('no debería invalidar sesión de otro usuario', async () => {
			const user = {
				userId: 1,
				email: 'user1@example.com',
				rol: 'USUARIO',
				nombre: 'User 1',
				sessionId: 100
			};

			const event = createLogoutRequestEvent({ user });

			await expect(POST(event)).rejects.toMatchObject({
				status: 303
			});

			// Verificar que solo se invalidó la sesión del usuario actual
			expect(mockInvalidateSession).toHaveBeenCalledTimes(1);
			expect(mockInvalidateSession).toHaveBeenCalledWith(100);
		});

		it('debería registrar userId correcto en log de logout', async () => {
			const user = {
				userId: 55,
				email: 'user55@example.com',
				rol: 'ADMIN',
				nombre: 'Admin 55',
				sessionId: 550
			};

			const event = createLogoutRequestEvent({ user });

			await expect(POST(event)).rejects.toMatchObject({
				status: 303
			});

			// El log debe contener el userId correcto, no el sessionId
			expect(mockLogLogout).toHaveBeenCalledWith(
				expect.objectContaining({
					userId: 55
				})
			);
		});
	});
});
