// @ts-nocheck — Mocks complejos de SvelteKit RequestEvent para tests unitarios de hooks
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockAuthGuard = vi.hoisted(() => vi.fn());
const mockValidateApiKey = vi.hoisted(() => vi.fn());
const mockRedirect = vi.hoisted(() => vi.fn());
const mockJson = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/auth', () => ({
	authGuard: mockAuthGuard
}));

vi.mock('$lib/server/apiAuth', () => ({
	validateApiKey: mockValidateApiKey
}));

vi.mock('@sveltejs/kit', () => ({
	redirect: mockRedirect.mockImplementation((status: number, url: string) => {
		throw { status, location: url };
	}),
	json: mockJson.mockImplementation((data: unknown, init: { status: number }) => {
		return new Response(JSON.stringify(data), { status: init?.status || 200 });
	})
}));

import { handle } from '../../hooks.server';

describe('Hooks Server', () => {
	let mockResolve: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockResolve = vi.fn().mockResolvedValue(new Response('OK', { headers: new Headers() }));
	});

	function createEvent(pathname: string, user: unknown = null, authHeader: string | null = null) {
		return {
			url: { pathname },
			cookies: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
			locals: { user: null, apiUserId: null } as { user: unknown; apiUserId: unknown },
			request: {
				headers: {
					get: vi.fn((key: string) => (key === 'Authorization' ? authHeader : null))
				}
			},
			getClientAddress: vi.fn(() => '127.0.0.1'),
			_mockUser: user
		};
	}

	describe('Autenticación', () => {
		it('debería inyectar usuario en locals cuando authGuard retorna usuario', async () => {
			const userData = { userId: 1, email: 'test@example.com', rol: 'USUARIO', nombre: 'Test' };
			mockAuthGuard.mockResolvedValue(userData);

			const event = createEvent('/');
			await handle({ event, resolve: mockResolve } as never);

			expect(event.locals.user).toEqual(userData);
		});

		it('debería dejar user como null cuando authGuard retorna null', async () => {
			mockAuthGuard.mockResolvedValue(null);

			const event = createEvent('/');
			await handle({ event, resolve: mockResolve } as never);

			expect(event.locals.user).toBeNull();
		});
	});

	describe('Protección de rutas /api/', () => {
		it('debería rechazar acceso a /api/ sin autenticación', async () => {
			mockAuthGuard.mockResolvedValue(null);
			mockValidateApiKey.mockResolvedValue({ valid: false });

			const event = createEvent('/api/centros');
			const response = await handle({ event, resolve: mockResolve } as never);

			expect(response.status).toBe(401);
		});

		it('debería permitir acceso a /api/ con sesión de usuario', async () => {
			const userData = { userId: 1, email: 'test@test.com', rol: 'USUARIO', nombre: 'Test' };
			mockAuthGuard.mockResolvedValue(userData);

			const event = createEvent('/api/centros');
			await handle({ event, resolve: mockResolve } as never);

			expect(mockResolve).toHaveBeenCalled();
		});

		it('debería permitir acceso a /api/ con API Key válida', async () => {
			mockAuthGuard.mockResolvedValue(null);
			mockValidateApiKey.mockResolvedValue({ valid: true, userId: 5 });

			const event = createEvent('/api/centros', null, 'Bearer test-key');
			await handle({ event, resolve: mockResolve } as never);

			expect(event.locals.apiUserId).toBe(5);
			expect(mockResolve).toHaveBeenCalled();
		});
	});

	describe('Protección de rutas protegidas', () => {
		const rutasProtegidas = ['/dashboard', '/centros', '/ciclos', '/registros', '/graficos', '/admin', '/investigador', '/perfil'];

		rutasProtegidas.forEach((ruta) => {
			it(`debería redirigir a /auth/login en ${ruta} sin usuario`, async () => {
				mockAuthGuard.mockResolvedValue(null);

				const event = createEvent(ruta);
				await expect(handle({ event, resolve: mockResolve } as never)).rejects.toEqual(
					expect.objectContaining({ status: 303, location: '/auth/login' })
				);
			});
		});
	});

	describe('Protección de rutas /admin', () => {
		it('debería redirigir USUARIO a /dashboard en /admin', async () => {
			mockAuthGuard.mockResolvedValue({ userId: 1, rol: 'USUARIO', nombre: 'Test', email: 'test@test.com' });

			const event = createEvent('/admin/usuarios');
			await expect(handle({ event, resolve: mockResolve } as never)).rejects.toEqual(
				expect.objectContaining({ status: 303, location: '/dashboard' })
			);
		});

		it('debería redirigir INVESTIGADOR a /dashboard en /admin', async () => {
			mockAuthGuard.mockResolvedValue({ userId: 1, rol: 'INVESTIGADOR', nombre: 'Test', email: 'test@test.com' });

			const event = createEvent('/admin/usuarios');
			await expect(handle({ event, resolve: mockResolve } as never)).rejects.toEqual(
				expect.objectContaining({ status: 303, location: '/dashboard' })
			);
		});

		it('debería permitir ADMIN en /admin', async () => {
			mockAuthGuard.mockResolvedValue({ userId: 1, rol: 'ADMIN', nombre: 'Admin', email: 'admin@test.com' });

			const event = createEvent('/admin/usuarios');
			await handle({ event, resolve: mockResolve } as never);

			expect(mockResolve).toHaveBeenCalled();
		});
	});

	describe('Protección de rutas /investigador', () => {
		it('debería redirigir USUARIO a /dashboard en /investigador', async () => {
			mockAuthGuard.mockResolvedValue({ userId: 1, rol: 'USUARIO', nombre: 'Test', email: 'test@test.com' });

			const event = createEvent('/investigador/dashboard');
			await expect(handle({ event, resolve: mockResolve } as never)).rejects.toEqual(
				expect.objectContaining({ status: 303, location: '/dashboard' })
			);
		});

		it('debería permitir INVESTIGADOR en /investigador', async () => {
			mockAuthGuard.mockResolvedValue({ userId: 1, rol: 'INVESTIGADOR', nombre: 'Test', email: 'test@test.com' });

			const event = createEvent('/investigador/dashboard');
			await handle({ event, resolve: mockResolve } as never);

			expect(mockResolve).toHaveBeenCalled();
		});

		it('debería permitir ADMIN en /investigador', async () => {
			mockAuthGuard.mockResolvedValue({ userId: 1, rol: 'ADMIN', nombre: 'Admin', email: 'admin@test.com' });

			const event = createEvent('/investigador/dashboard');
			await handle({ event, resolve: mockResolve } as never);

			expect(mockResolve).toHaveBeenCalled();
		});
	});

	describe('Redirección de login', () => {
		it('debería redirigir usuario logeado de /auth/login a /dashboard', async () => {
			mockAuthGuard.mockResolvedValue({ userId: 1, rol: 'USUARIO', nombre: 'Test', email: 'test@test.com' });

			const event = createEvent('/auth/login');
			await expect(handle({ event, resolve: mockResolve } as never)).rejects.toEqual(
				expect.objectContaining({ status: 303, location: '/dashboard' })
			);
		});

		it('debería permitir acceso a /auth/login sin sesión', async () => {
			mockAuthGuard.mockResolvedValue(null);

			const event = createEvent('/auth/login');
			await handle({ event, resolve: mockResolve } as never);

			expect(mockResolve).toHaveBeenCalled();
		});
	});

	describe('Headers de seguridad en API', () => {
		it('debería agregar headers de seguridad en respuestas /api/', async () => {
			const userData = { userId: 1, rol: 'USUARIO', nombre: 'Test', email: 'test@test.com' };
			mockAuthGuard.mockResolvedValue(userData);

			const responseHeaders = new Headers();
			const mockResponse = new Response('OK', { headers: responseHeaders });
			mockResolve.mockResolvedValue(mockResponse);

			const event = createEvent('/api/centros');
			const response = await handle({ event, resolve: mockResolve } as never);

			expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
			expect(response.headers.get('X-Frame-Options')).toBe('DENY');
			expect(response.headers.get('Cache-Control')).toContain('no-store');
		});
	});
});