import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';

// Crear mocks con vi.hoisted antes de las importaciones
const mockDbSelect = vi.hoisted(() => vi.fn());
const mockDbFrom = vi.hoisted(() => vi.fn());
const mockDbWhere = vi.hoisted(() => vi.fn());
const mockDbLimit = vi.hoisted(() => vi.fn());
const mockDbInsert = vi.hoisted(() => vi.fn());

const mockCheckRateLimit = vi.hoisted(() => vi.fn());
const mockCheckEmailCooldown = vi.hoisted(() => vi.fn());
const mockVerifyTurnstile = vi.hoisted(() => vi.fn());
const mockCreateMagicLink = vi.hoisted(() => vi.fn());
const mockLogMagicLinkSent = vi.hoisted(() => vi.fn());
const mockLogLoginFailed = vi.hoisted(() => vi.fn());

// Mock de la base de datos
vi.mock('$lib/server/db', () => ({
	db: {
		select: mockDbSelect,
		insert: mockDbInsert
	}
}));

// Mock del schema
vi.mock('$lib/server/db/schema', () => ({
	usuarios: { symbol: Symbol('usuarios') },
	magicLinkTokens: { symbol: Symbol('magicLinkTokens') },
	sesiones: { symbol: Symbol('sesiones') }
}));

// Mock de drizzle-orm
vi.mock('drizzle-orm', () => ({
	eq: vi.fn((_, value) => ({ eq: value }))
}));

// Mock del rate limiter
vi.mock('$lib/server/rateLimiter', () => ({
	checkRateLimit: mockCheckRateLimit,
	checkEmailCooldown: mockCheckEmailCooldown
}));

// Mock del captcha
vi.mock('$lib/server/captcha', () => ({
	verifyTurnstile: mockVerifyTurnstile
}));

// Mock del auth
vi.mock('$lib/server/auth', () => ({
	createMagicLink: mockCreateMagicLink
}));

// Mock del audit
vi.mock('$lib/server/audit', () => ({
	logMagicLinkSent: mockLogMagicLinkSent,
	logLoginFailed: mockLogLoginFailed
}));

// Tipos para el helper
interface LoginTestOptions {
	email?: string;
	nombre?: string;
	terms?: string;
	turnstileToken?: string;
	clientIp?: string;
	userAgent?: string;
}

// Helper para crear FormData
function createFormData(data: Record<string, string>): FormData {
	const formData = new FormData();
	for (const [key, value] of Object.entries(data)) {
		formData.append(key, value);
	}
	return formData;
}

// Helper para crear RequestEvent mock específico para login
function createLoginRequestEvent(overrides: LoginTestOptions = {}): RequestEvent {
	const formData = createFormData({
		email: overrides.email ?? 'test@example.com',
		...(overrides.nombre ? { nombre: overrides.nombre } : {}),
		...(overrides.terms ? { terms: overrides.terms } : {}),
		...(overrides.turnstileToken ? { 'cf-turnstile-response': overrides.turnstileToken } : {})
	});

	const event = {
		request: {
			formData: () => Promise.resolve(formData),
			headers: {
				get: (name: string) => (name === 'user-agent' ? (overrides.userAgent ?? 'TestAgent') : null)
			}
		},
		url: new URL('http://localhost/auth/login'),
		getClientAddress: () => overrides.clientIp ?? '192.168.1.1',
		cookies: {
			get: vi.fn(),
			set: vi.fn(),
			delete: vi.fn(),
			getAll: vi.fn(),
			serialize: vi.fn()
		},
		locals: {},
		params: {},
		route: { id: '/auth/login' },
		isDataRequest: false,
		isSubRequest: false,
		method: 'POST'
	};

	return event as unknown as RequestEvent;
}

// Importar después de configurar los mocks
import { actions } from '../../routes/auth/login/+page.server';

describe('Auth Login', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		// Configurar respuestas por defecto de rate limiter
		mockCheckRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
		mockCheckEmailCooldown.mockResolvedValue({ allowed: true, remainingSeconds: 0 });

		// Configurar respuesta por defecto de captcha
		mockVerifyTurnstile.mockResolvedValue(true);

		// Configurar respuesta por defecto de createMagicLink
		mockCreateMagicLink.mockResolvedValue({ success: true });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('POST - Validación de email', () => {
		it('debería rechazar email vacío', async () => {
			const event = createLoginRequestEvent({ email: '' });

			const result = (await actions.default(event)) as unknown as {
				status: number;
				data: { email: string; missing: boolean; message: string };
			};

			expect(result).toEqual({
				status: 400,
				data: {
					email: '',
					missing: true,
					message: 'Correo electrónico inválido'
				}
			});
		});

		it('debería rechazar email sin @', async () => {
			const event = createLoginRequestEvent({ email: 'invalidemail' });

			const result = (await actions.default(event)) as unknown as {
				status: number;
				data: { email: string; missing: boolean; message: string };
			};

			expect(result).toEqual({
				status: 400,
				data: {
					email: 'invalidemail',
					missing: true,
					message: 'Correo electrónico inválido'
				}
			});
		});

		it('debería rechazar email que no es string', async () => {
			// Crear un FormData mock que retorna null para email
			const mockFormData = {
				get: (key: string) => (key === 'email' ? null : 'some-value')
			} as unknown as FormData;

			const event = {
				request: {
					formData: () => Promise.resolve(mockFormData),
					headers: { get: () => 'TestAgent' }
				},
				url: new URL('http://localhost/auth/login'),
				getClientAddress: () => '192.168.1.1',
				cookies: {
					get: vi.fn(),
					set: vi.fn(),
					delete: vi.fn(),
					getAll: vi.fn(),
					serialize: vi.fn()
				},
				locals: {},
				params: {},
				route: { id: '/auth/login' },
				isDataRequest: false,
				isSubRequest: false,
				method: 'POST'
			} as unknown as RequestEvent;

			const result = (await actions.default(event)) as unknown as {
				status: number;
				data: { missing: boolean };
			};

			expect(result.status).toBe(400);
			expect(result.data.missing).toBe(true);
		});
	});

	describe('POST - Rate limiting', () => {
		it('debería rechazar cuando rate limit por IP se excede', async () => {
			mockCheckRateLimit.mockResolvedValueOnce({
				allowed: false,
				remainingAttempts: 0,
				resetIn: 900000,
				message: 'Demasiados intentos desde esta dirección'
			});

			const event = createLoginRequestEvent({ email: 'test@example.com' });

			const result = (await actions.default(event)) as unknown as {
				status: number;
				data: {
					email: string;
					rateLimited: boolean;
					message: string;
					resetIn: number;
				};
			};

			expect(result).toEqual({
				status: 429,
				data: {
					email: 'test@example.com',
					rateLimited: true,
					message: 'Demasiados intentos desde esta dirección',
					resetIn: 900000
				}
			});
		});

		it('debería rechazar cuando rate limit por email se excede', async () => {
			mockCheckRateLimit
				.mockResolvedValueOnce({ allowed: true, remainingAttempts: 5 }) // IP rate limit
				.mockResolvedValueOnce({
					allowed: false,
					remainingAttempts: 0,
					resetIn: 3600000,
					message: 'Demasiados intentos para este correo'
				});

			const event = createLoginRequestEvent({ email: 'test@example.com' });

			const result = (await actions.default(event)) as unknown as {
				status: number;
				data: {
					email: string;
					rateLimited: boolean;
					message: string;
					resetIn: number;
				};
			};

			expect(result.status).toBe(429);
			expect(result.data.email).toBe('test@example.com');
			expect(result.data.rateLimited).toBe(true);
			expect(result.data.message).toContain('Demasiados intentos para este correo');
			expect(result.data.resetIn).toBe(3600000);
		});

		it('debería rechazar cuando cooldown de email está activo', async () => {
			mockCheckRateLimit.mockResolvedValue({ allowed: true, remainingAttempts: 5 });
			mockCheckEmailCooldown.mockResolvedValue({
				allowed: false,
				remainingSeconds: 45,
				message: 'Por favor espera 45 segundos'
			});

			const event = createLoginRequestEvent({ email: 'test@example.com' });

			const result = (await actions.default(event)) as unknown as {
				status: number;
				data: {
					email: string;
					cooldownActive: boolean;
					message: string;
					remainingSeconds: number;
				};
			};

			expect(result).toEqual({
				status: 429,
				data: {
					email: 'test@example.com',
					cooldownActive: true,
					message: 'Por favor espera 45 segundos',
					remainingSeconds: 45
				}
			});
		});

		it('debería verificar rate limit con la IP correcta', async () => {
			mockDbSelect.mockReturnValue({
				from: mockDbFrom.mockReturnValue({
					where: mockDbWhere.mockReturnValue({
						limit: mockDbLimit.mockResolvedValue([
							{ id: 1, nombre: 'Usuario Test', email: 'test@example.com' }
						])
					})
				})
			});

			const event = createLoginRequestEvent({
				email: 'test@example.com',
				clientIp: '10.0.0.1'
			});

			await actions.default(event);

			expect(mockCheckRateLimit).toHaveBeenCalledWith('10.0.0.1', 'IP');
		});

		it('debería verificar rate limit con el email correcto', async () => {
			mockDbSelect.mockReturnValue({
				from: mockDbFrom.mockReturnValue({
					where: mockDbWhere.mockReturnValue({
						limit: mockDbLimit.mockResolvedValue([
							{ id: 1, nombre: 'Usuario Test', email: 'test@example.com' }
						])
					})
				})
			});

			const event = createLoginRequestEvent({ email: 'user@domain.com' });

			await actions.default(event);

			expect(mockCheckRateLimit).toHaveBeenCalledWith('user@domain.com', 'EMAIL');
		});
	});

	describe('POST - Usuario existente', () => {
		it('debería enviar magic link a usuario existente', async () => {
			mockDbSelect.mockReturnValue({
				from: mockDbFrom.mockReturnValue({
					where: mockDbWhere.mockReturnValue({
						limit: mockDbLimit.mockResolvedValue([
							{
								id: 1,
								nombre: 'Usuario Existente',
								email: 'existente@example.com',
								activo: true
							}
						])
					})
				})
			});

			const event = createLoginRequestEvent({
				email: 'existente@example.com',
				clientIp: '192.168.1.50',
				userAgent: 'Mozilla/5.0'
			});

			const result = await actions.default(event);

			expect(mockCreateMagicLink).toHaveBeenCalledWith(
				'existente@example.com',
				'Usuario Existente',
				'http://localhost',
				'Mozilla/5.0',
				'192.168.1.50'
			);
			expect(mockLogMagicLinkSent).toHaveBeenCalledWith({
				userId: 1,
				email: 'existente@example.com',
				ip: '192.168.1.50'
			});
			expect(result).toEqual({ success: true });
		});

		it('debería manejar error de createMagicLink para usuario existente', async () => {
			mockDbSelect.mockReturnValue({
				from: mockDbFrom.mockReturnValue({
					where: mockDbWhere.mockReturnValue({
						limit: mockDbLimit.mockResolvedValue([
							{
								id: 1,
								nombre: 'Usuario Existente',
								email: 'existente@example.com'
							}
						])
					})
				})
			});

			mockCreateMagicLink.mockResolvedValue({
				success: false,
				error: 'Error de rate limit defensivo',
				status: 429
			});

			const event = createLoginRequestEvent({ email: 'existente@example.com' });

			const result = (await actions.default(event)) as unknown as {
				status: number;
				data: { email: string; rateLimited: boolean; message: string };
			};

			expect(result).toEqual({
				status: 429,
				data: {
					email: 'existente@example.com',
					rateLimited: true,
					message: 'Error de rate limit defensivo'
				}
			});
			expect(mockLogLoginFailed).toHaveBeenCalledWith(
				expect.objectContaining({
					email: 'existente@example.com',
					reason: 'RATE_LIMITED_DEFENSIVE'
				})
			);
		});
	});

	describe('POST - Usuario nuevo', () => {
		it('debería solicitar nombre para usuario nuevo', async () => {
			mockDbSelect.mockReturnValue({
				from: mockDbFrom.mockReturnValue({
					where: mockDbWhere.mockReturnValue({
						limit: mockDbLimit.mockResolvedValue([])
					})
				})
			});

			const event = createLoginRequestEvent({ email: 'nuevo@example.com' });

			const result = await actions.default(event);

			expect(result).toEqual({
				requiresRegistration: true,
				email: 'nuevo@example.com'
			});
		});

		it('debería rechazar nombre muy corto', async () => {
			mockDbSelect.mockReturnValue({
				from: mockDbFrom.mockReturnValue({
					where: mockDbWhere.mockReturnValue({
						limit: mockDbLimit.mockResolvedValue([])
					})
				})
			});

			const event = createLoginRequestEvent({
				email: 'nuevo@example.com',
				nombre: 'A'
			});

			const result = (await actions.default(event)) as unknown as {
				status: number;
				data: {
					email: string;
					nombre: string;
					requiresRegistration: boolean;
					missing: boolean;
					message: string;
				};
			};

			expect(result).toEqual({
				status: 400,
				data: {
					email: 'nuevo@example.com',
					nombre: 'A',
					requiresRegistration: true,
					missing: true,
					message: 'Nombre es requerido'
				}
			});
		});

		it('debería rechazar cuando términos no aceptados', async () => {
			mockDbSelect.mockReturnValue({
				from: mockDbFrom.mockReturnValue({
					where: mockDbWhere.mockReturnValue({
						limit: mockDbLimit.mockResolvedValue([])
					})
				})
			});

			const event = createLoginRequestEvent({
				email: 'nuevo@example.com',
				nombre: 'Usuario Nuevo',
				terms: 'off'
			});

			const result = (await actions.default(event)) as unknown as {
				status: number;
				data: {
					email: string;
					nombre: string;
					requiresRegistration: boolean;
					missing: boolean;
					message: string;
				};
			};

			expect(result).toEqual({
				status: 400,
				data: {
					email: 'nuevo@example.com',
					nombre: 'Usuario Nuevo',
					requiresRegistration: true,
					missing: true,
					message: 'Debes aceptar las condiciones del servicio'
				}
			});
		});

		it('debería rechazar cuando CAPTCHA falla', async () => {
			mockDbSelect.mockReturnValue({
				from: mockDbFrom.mockReturnValue({
					where: mockDbWhere.mockReturnValue({
						limit: mockDbLimit.mockResolvedValue([])
					})
				})
			});
			mockVerifyTurnstile.mockResolvedValue(false);

			const event = createLoginRequestEvent({
				email: 'nuevo@example.com',
				nombre: 'Usuario Nuevo',
				terms: 'on',
				turnstileToken: 'invalid-token'
			});

			const result = (await actions.default(event)) as unknown as {
				status: number;
				data: {
					email: string;
					nombre: string;
					requiresRegistration: boolean;
					captchaError: boolean;
					message: string;
				};
			};

			expect(result).toEqual({
				status: 400,
				data: {
					email: 'nuevo@example.com',
					nombre: 'Usuario Nuevo',
					requiresRegistration: true,
					captchaError: true,
					message: 'Verificación de seguridad fallida. Por favor, completa el CAPTCHA.'
				}
			});
			expect(mockLogLoginFailed).toHaveBeenCalledWith(
				expect.objectContaining({
					email: 'nuevo@example.com',
					reason: 'CAPTCHA_FAILED'
				})
			);
		});

		it('debería crear usuario nuevo con datos válidos', async () => {
			mockDbSelect.mockReturnValue({
				from: mockDbFrom.mockReturnValue({
					where: mockDbWhere.mockReturnValue({
						limit: mockDbLimit.mockResolvedValue([])
					})
				})
			});

			const event = createLoginRequestEvent({
				email: 'nuevo@example.com',
				nombre: 'Usuario Nuevo',
				terms: 'on',
				turnstileToken: 'valid-token',
				clientIp: '192.168.1.100',
				userAgent: 'Mozilla/5.0 (Test Browser)'
			});

			const result = await actions.default(event);

			expect(mockVerifyTurnstile).toHaveBeenCalledWith('valid-token', '192.168.1.100');
			expect(mockCreateMagicLink).toHaveBeenCalledWith(
				'nuevo@example.com',
				'Usuario Nuevo',
				'http://localhost',
				'Mozilla/5.0 (Test Browser)',
				'192.168.1.100'
			);
			expect(mockLogMagicLinkSent).toHaveBeenCalledWith({
				email: 'nuevo@example.com',
				ip: '192.168.1.100'
			});
			expect(result).toEqual({ success: true });
		});

		it('debería aceptar terms con valor "true"', async () => {
			mockDbSelect.mockReturnValue({
				from: mockDbFrom.mockReturnValue({
					where: mockDbWhere.mockReturnValue({
						limit: mockDbLimit.mockResolvedValue([])
					})
				})
			});

			const event = createLoginRequestEvent({
				email: 'nuevo@example.com',
				nombre: 'Usuario Nuevo',
				terms: 'true',
				turnstileToken: 'valid-token'
			});

			const result = await actions.default(event);

			// No debería fallar por términos
			expect(result).not.toHaveProperty('status', 400);
			expect(result).not.toHaveProperty('data.missing');
		});
	});

	describe('POST - Manejo de errores', () => {
		it('debería manejar errores internos del servidor', async () => {
			mockDbSelect.mockImplementation(() => {
				throw new Error('Database connection error');
			});

			const event = createLoginRequestEvent({ email: 'test@example.com' });

			const result = (await actions.default(event)) as unknown as {
				status: number;
				data: { email: string; error: boolean; message: string };
			};

			expect(result.status).toBe(500);
			expect(result.data.email).toBe('test@example.com');
			expect(result.data.error).toBe(true);
			expect(result.data.message).toBe('No se pudo procesar la solicitud. Inténtalo de nuevo.');
			expect(mockLogLoginFailed).toHaveBeenCalledWith(
				expect.objectContaining({
					email: 'test@example.com',
					reason: 'INTERNAL_ERROR'
				})
			);
		});

		it('debería manejar error de createMagicLink para usuario nuevo', async () => {
			mockDbSelect.mockReturnValue({
				from: mockDbFrom.mockReturnValue({
					where: mockDbWhere.mockReturnValue({
						limit: mockDbLimit.mockResolvedValue([])
					})
				})
			});
			mockCreateMagicLink.mockResolvedValue({
				success: false,
				error: 'Error de envío de email',
				status: 500
			});

			const event = createLoginRequestEvent({
				email: 'nuevo@example.com',
				nombre: 'Usuario Nuevo',
				terms: 'on',
				turnstileToken: 'valid-token'
			});

			const result = (await actions.default(event)) as unknown as {
				status: number;
				data: {
					email: string;
					nombre: string;
					requiresRegistration: boolean;
					rateLimited: boolean;
					message: string;
				};
			};

			expect(result).toEqual({
				status: 500,
				data: {
					email: 'nuevo@example.com',
					nombre: 'Usuario Nuevo',
					requiresRegistration: true,
					rateLimited: true,
					message: 'Error de envío de email'
				}
			});
		});
	});

	describe('POST - Verificaciones de auditoría', () => {
		it('debería registrar log cuando magic link se envía exitosamente', async () => {
			mockDbSelect.mockReturnValue({
				from: mockDbFrom.mockReturnValue({
					where: mockDbWhere.mockReturnValue({
						limit: mockDbLimit.mockResolvedValue([
							{
								id: 5,
								nombre: 'Test User',
								email: 'test@example.com'
							}
						])
					})
				})
			});

			const event = createLoginRequestEvent({
				email: 'test@example.com',
				clientIp: '10.20.30.40'
			});

			await actions.default(event);

			expect(mockLogMagicLinkSent).toHaveBeenCalledWith({
				userId: 5,
				email: 'test@example.com',
				ip: '10.20.30.40'
			});
		});
	});

	describe('POST - Casos edge', () => {
		it('debería manejar user-agent undefined', async () => {
			mockDbSelect.mockReturnValue({
				from: mockDbFrom.mockReturnValue({
					where: mockDbWhere.mockReturnValue({
						limit: mockDbLimit.mockResolvedValue([
							{
								id: 1,
								nombre: 'Test',
								email: 'test@example.com'
							}
						])
					})
				})
			});

			const formData = createFormData({ email: 'test@example.com' });
			const event = {
				request: {
					formData: () => Promise.resolve(formData),
					headers: {
						get: () => null // user-agent es null
					}
				},
				url: new URL('http://localhost/auth/login'),
				getClientAddress: () => '192.168.1.1',
				cookies: {
					get: vi.fn(),
					set: vi.fn(),
					delete: vi.fn(),
					getAll: vi.fn(),
					serialize: vi.fn()
				},
				locals: {},
				params: {},
				route: { id: '/auth/login' },
				isDataRequest: false,
				isSubRequest: false,
				method: 'POST'
			} as unknown as RequestEvent;

			await actions.default(event);

			expect(mockCreateMagicLink).toHaveBeenCalledWith(
				'test@example.com',
				'Test',
				'http://localhost',
				undefined,
				'192.168.1.1'
			);
		});

		it('debería manejar email con mayúsculas y minúsculas', async () => {
			mockDbSelect.mockReturnValue({
				from: mockDbFrom.mockReturnValue({
					where: mockDbWhere.mockReturnValue({
						limit: mockDbLimit.mockResolvedValue([
							{
								id: 1,
								nombre: 'Test',
								email: 'Test@Example.COM'
							}
						])
					})
				})
			});

			const event = createLoginRequestEvent({ email: 'Test@Example.COM' });

			await actions.default(event);

			expect(mockCheckRateLimit).toHaveBeenCalledWith('Test@Example.COM', 'EMAIL');
		});
	});
});
