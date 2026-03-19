import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to create mocks before module import
const mockSelect = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => vi.fn());
const mockWhere = vi.hoisted(() => vi.fn());
const mockLimit = vi.hoisted(() => vi.fn());
const mockInsert = vi.hoisted(() => vi.fn());
const mockValues = vi.hoisted(() => vi.fn());
const mockReturning = vi.hoisted(() => vi.fn());
const mockUpdate = vi.hoisted(() => vi.fn());
const mockSet = vi.hoisted(() => vi.fn());
const mockInnerJoin = vi.hoisted(() => vi.fn());

const mockCheckRateLimit = vi.hoisted(() => vi.fn());
const mockLogRateLimitAttempt = vi.hoisted(() => vi.fn());
const mockCheckEmailCooldown = vi.hoisted(() => vi.fn());
const mockUpdateEmailCooldown = vi.hoisted(() => vi.fn());

const mockRedirect = vi.hoisted(() => vi.fn());
const mockVerify = vi.hoisted(() => vi.fn());
const mockSign = vi.hoisted(() => vi.fn());

vi.mock('./db', () => ({
	db: {
		select: mockSelect,
		insert: mockInsert,
		update: mockUpdate
	}
}));

vi.mock('./db/schema', () => ({
	usuarios: { symbol: Symbol('usuarios') },
	magicLinkTokens: { symbol: Symbol('magicLinkTokens') },
	sesiones: { symbol: Symbol('sesiones') },
	rateLimitLogs: { symbol: Symbol('rateLimitLogs') },
	emailCooldowns: { symbol: Symbol('emailCooldowns') }
}));

vi.mock('drizzle-orm', () => ({
	eq: vi.fn((_, value) => ({ eq: value })),
	and: vi.fn((...args) => ({ and: args })),
	isNull: vi.fn(() => ({ isNull: true }))
}));

vi.mock('./rateLimiter', () => ({
	checkRateLimit: mockCheckRateLimit,
	logRateLimitAttempt: mockLogRateLimitAttempt,
	checkEmailCooldown: mockCheckEmailCooldown,
	updateEmailCooldown: mockUpdateEmailCooldown
}));

vi.mock('./rate-limiter', () => ({
	checkRateLimit: mockCheckRateLimit,
	logRateLimitAttempt: mockLogRateLimitAttempt,
	checkEmailCooldown: mockCheckEmailCooldown,
	updateEmailCooldown: mockUpdateEmailCooldown
}));

vi.mock('@sveltejs/kit', () => ({
	redirect: mockRedirect.mockImplementation((status: number, url: string) => {
		throw { status, location: url };
	})
}));

vi.mock('jsonwebtoken', () => ({
	default: {
		sign: mockSign,
		verify: mockVerify
	}
}));

vi.mock('resend', () => ({
	Resend: vi.fn()
}));

vi.mock('$env/dynamic/private', () => ({
	env: {
		JWT_SECRET: 'test-jwt-secret',
		RESEND_API_KEY: 'test-resend-key',
		EMAIL_FROM: 'test@example.com'
	}
}));

// Import after mocks are set up
import {
	ROLES,
	requireRole,
	hasMinRole,
	createSession,
	invalidateSession,
	invalidateAllUserSessions,
	validateSession,
	authGuard,
	createMagicLink
} from './auth';

describe('Auth Module', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('ROLES Constant', () => {
		it('should have correct role values', () => {
			expect(ROLES.USUARIO).toBe('USUARIO');
			expect(ROLES.INVESTIGADOR).toBe('INVESTIGADOR');
			expect(ROLES.ADMIN).toBe('ADMIN');
		});
	});

	describe('hasMinRole', () => {
		it('should return true when user has exact required role', () => {
			expect(hasMinRole('ADMIN', 'ADMIN')).toBe(true);
			expect(hasMinRole('INVESTIGADOR', 'INVESTIGADOR')).toBe(true);
			expect(hasMinRole('USUARIO', 'USUARIO')).toBe(true);
		});

		it('should return true when user has higher role', () => {
			expect(hasMinRole('ADMIN', 'INVESTIGADOR')).toBe(true);
			expect(hasMinRole('ADMIN', 'USUARIO')).toBe(true);
			expect(hasMinRole('INVESTIGADOR', 'USUARIO')).toBe(true);
		});

		it('should return false when user has lower role', () => {
			expect(hasMinRole('USUARIO', 'INVESTIGADOR')).toBe(false);
			expect(hasMinRole('USUARIO', 'ADMIN')).toBe(false);
			expect(hasMinRole('INVESTIGADOR', 'ADMIN')).toBe(false);
		});

		it('should return false when user has no role', () => {
			expect(hasMinRole(undefined, 'USUARIO')).toBe(false);
			expect(hasMinRole(undefined, 'ADMIN')).toBe(false);
		});

		it('should return false when user has an unrecognized role (fail-closed)', () => {
			// @ts-expect-error - Testing runtime behavior with invalid role
			expect(hasMinRole('HACKER', 'USUARIO')).toBe(false);
			// @ts-expect-error - Testing runtime behavior with invalid role
			expect(hasMinRole('INVALID_ROLE', 'ADMIN')).toBe(false);
			// @ts-expect-error - Testing runtime behavior with invalid role
			expect(hasMinRole('SUPERADMIN', 'USUARIO')).toBe(false);
		});
	});

	describe('requireRole', () => {
		it('should not throw when user has exact required role', () => {
			expect(() => requireRole('ADMIN', 'ADMIN')).not.toThrow();
		});

		it('should not throw when user has higher role', () => {
			expect(() => requireRole('ADMIN', 'USUARIO')).not.toThrow();
			expect(() => requireRole('INVESTIGADOR', 'USUARIO')).not.toThrow();
		});

		it('should throw redirect when user has lower role', () => {
			expect(() => requireRole('USUARIO', 'ADMIN')).toThrow();
			expect(() => requireRole('USUARIO', 'INVESTIGADOR')).toThrow();
		});

		it('should throw redirect when user has no role', () => {
			expect(() => requireRole(undefined, 'USUARIO')).toThrow();
		});

		it('should throw redirect when user has an unrecognized role (fail-closed)', () => {
			// @ts-expect-error - Testing runtime behavior with invalid role
			expect(() => requireRole('HACKER', 'USUARIO')).toThrow();
			// @ts-expect-error - Testing runtime behavior with invalid role
			expect(() => requireRole('INVALID_ROLE', 'ADMIN')).toThrow();
			// @ts-expect-error - Testing runtime behavior with invalid role
			expect(() => requireRole('SUPERADMIN', 'USUARIO')).toThrow();
		});
	});

	describe('createSession', () => {
		it('should create a session and return session ID and token', async () => {
			mockInsert.mockReturnValue({
				values: mockValues.mockReturnValue({
					returning: mockReturning.mockResolvedValue([{ id: 1 }])
				})
			});

			const result = await createSession(1, 'TestAgent', '192.168.1.1');

			expect(result.sessionId).toBe(1);
			expect(result.sessionToken).toBeDefined();
			expect(result.sessionToken.length).toBe(64); // 32 bytes hex
		});

		it('should throw when session creation fails', async () => {
			mockInsert.mockReturnValue({
				values: mockValues.mockReturnValue({
					returning: mockReturning.mockResolvedValue([])
				})
			});

			await expect(createSession(1)).rejects.toThrow('No se pudo crear la sesión');
		});
	});

	describe('invalidateSession', () => {
		it('should update session with invalidatedAt', async () => {
			mockUpdate.mockReturnValue({
				set: mockSet.mockReturnValue({
					where: mockWhere.mockResolvedValue(undefined)
				})
			});

			await invalidateSession(1);

			expect(mockUpdate).toHaveBeenCalled();
			expect(mockSet).toHaveBeenCalledWith({ invalidatedAt: expect.any(Date) });
		});
	});

	describe('invalidateAllUserSessions', () => {
		it('should invalidate all user sessions', async () => {
			mockUpdate.mockReturnValue({
				set: mockSet.mockReturnValue({
					where: mockWhere.mockResolvedValue(undefined)
				})
			});

			await invalidateAllUserSessions(1);

			expect(mockUpdate).toHaveBeenCalled();
			expect(mockSet).toHaveBeenCalledWith({ invalidatedAt: expect.any(Date) });
		});
	});

	describe('validateSession', () => {
		it('should return null when session not found', async () => {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					innerJoin: mockInnerJoin.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([])
						})
					})
				})
			});

			const result = await validateSession(1, 'hash');

			expect(result).toBeNull();
		});

		it('should return null when token hash does not match', async () => {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					innerJoin: mockInnerJoin.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([
								{
									session: {
										id: 1,
										tokenHash: 'different-hash',
										invalidatedAt: null,
										expiresAt: new Date(Date.now() + 86400000)
									},
									user: { id: 1, activo: true }
								}
							])
						})
					})
				})
			});

			const result = await validateSession(1, 'hash');

			expect(result).toBeNull();
		});

		it('should return null when session is invalidated', async () => {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					innerJoin: mockInnerJoin.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([
								{
									session: {
										id: 1,
										tokenHash: 'hash',
										invalidatedAt: new Date(),
										expiresAt: new Date(Date.now() + 86400000)
									},
									user: { id: 1, activo: true }
								}
							])
						})
					})
				})
			});

			const result = await validateSession(1, 'hash');

			expect(result).toBeNull();
		});

		it('should return null when session is expired', async () => {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					innerJoin: mockInnerJoin.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([
								{
									session: {
										id: 1,
										tokenHash: 'hash',
										invalidatedAt: null,
										expiresAt: new Date(Date.now() - 86400000)
									},
									user: { id: 1, activo: true }
								}
							])
						})
					})
				})
			});

			const result = await validateSession(1, 'hash');

			expect(result).toBeNull();
		});

		it('should return null when user is inactive', async () => {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					innerJoin: mockInnerJoin.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([
								{
									session: {
										id: 1,
										tokenHash: 'hash',
										invalidatedAt: null,
										expiresAt: new Date(Date.now() + 86400000)
									},
									user: { id: 1, activo: false }
								}
							])
						})
					})
				})
			});

			const result = await validateSession(1, 'hash');

			expect(result).toBeNull();
		});

		it('should return session and user when valid', async () => {
			const mockSession = {
				id: 1,
				tokenHash: 'hash',
				invalidatedAt: null,
				expiresAt: new Date(Date.now() + 86400000)
			};
			const mockUser = { id: 1, activo: true, email: 'test@example.com', rol: 'USUARIO' };

			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					innerJoin: mockInnerJoin.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([
								{
									session: mockSession,
									user: mockUser
								}
							])
						})
					})
				})
			});

			const result = await validateSession(1, 'hash');

			expect(result).not.toBeNull();
			expect(result?.session).toEqual(mockSession);
			expect(result?.user).toEqual(mockUser);
		});
	});

	describe('authGuard - Privilege Escalation Prevention', () => {
		const mockCookies = {
			get: vi.fn(),
			set: vi.fn(),
			delete: vi.fn(),
			getAll: vi.fn()
		};

		it('should reject access when JWT role does not match current DB role (privilege escalation)', async () => {
			// Simular JWT con rol ADMIN (escalado)
			mockVerify.mockReturnValue({
				sessionId: 1,
				sessionTokenHash: 'hash',
				userId: 1,
				email: 'test@example.com',
				rol: 'ADMIN', // Rol en JWT es ADMIN
				nombre: 'Test User'
			});

			// Simular sesión válida pero con rol USUARIO en BD (rol fue degradado)
			const mockSession = {
				id: 1,
				tokenHash: 'hash',
				invalidatedAt: null,
				expiresAt: new Date(Date.now() + 86400000)
			};
			const mockUser = {
				id: 1,
				activo: true,
				email: 'test@example.com',
				rol: 'USUARIO', // Rol en BD es USUARIO (diferente al JWT)
				nombre: 'Test User'
			};

			mockCookies.get.mockReturnValue('valid-jwt-token');
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					innerJoin: mockInnerJoin.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([
								{ session: mockSession, user: mockUser }
							])
						})
					})
				})
			});
			mockUpdate.mockReturnValue({
				set: mockSet.mockReturnValue({
					where: mockWhere.mockResolvedValue(undefined)
				})
			});

			const result = await authGuard(mockCookies as unknown as import('@sveltejs/kit').Cookies);

			// Debe rechazar el acceso (retorna null)
			expect(result).toBeNull();
			// Debe eliminar la cookie de sesión
			expect(mockCookies.delete).toHaveBeenCalledWith('session', { path: '/' });
		});

		it('should reject access when JWT has INVESTIGADOR but DB has USUARIO (downgrade)', async () => {
			mockVerify.mockReturnValue({
				sessionId: 1,
				sessionTokenHash: 'hash',
				userId: 1,
				email: 'test@example.com',
				rol: 'INVESTIGADOR',
				nombre: 'Test User'
			});

			const mockSession = {
				id: 1,
				tokenHash: 'hash',
				invalidatedAt: null,
				expiresAt: new Date(Date.now() + 86400000)
			};
			const mockUser = {
				id: 1,
				activo: true,
				email: 'test@example.com',
				rol: 'USUARIO',
				nombre: 'Test User'
			};

			mockCookies.get.mockReturnValue('valid-jwt-token');
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					innerJoin: mockInnerJoin.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([
								{ session: mockSession, user: mockUser }
							])
						})
					})
				})
			});
			mockUpdate.mockReturnValue({
				set: mockSet.mockReturnValue({
					where: mockWhere.mockResolvedValue(undefined)
				})
			});

			const result = await authGuard(mockCookies as unknown as import('@sveltejs/kit').Cookies);

			expect(result).toBeNull();
			expect(mockCookies.delete).toHaveBeenCalledWith('session', { path: '/' });
		});

		it('should allow access when JWT role matches DB role', async () => {
			mockVerify.mockReturnValue({
				sessionId: 1,
				sessionTokenHash: 'hash',
				userId: 1,
				email: 'test@example.com',
				rol: 'ADMIN',
				nombre: 'Test User'
			});

			const mockSession = {
				id: 1,
				tokenHash: 'hash',
				invalidatedAt: null,
				expiresAt: new Date(Date.now() + 86400000)
			};
			const mockUser = {
				id: 1,
				activo: true,
				email: 'test@example.com',
				rol: 'ADMIN', // Mismo rol en JWT y BD
				nombre: 'Test User'
			};

			mockCookies.get.mockReturnValue('valid-jwt-token');
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					innerJoin: mockInnerJoin.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue([
								{ session: mockSession, user: mockUser }
							])
						})
					})
				})
			});

			const result = await authGuard(mockCookies as unknown as import('@sveltejs/kit').Cookies);

			expect(result).not.toBeNull();
			expect(result?.rol).toBe('ADMIN');
		});
	});

	describe('createMagicLink - Blocked IP', () => {
		it('should reject authentication when IP is blocked by rate limiting', async () => {
			// Simular email rate limit OK
			mockCheckRateLimit.mockResolvedValueOnce({
				allowed: true,
				remainingAttempts: 3
			});

			// Simular IP bloqueada por rate limiting
			mockCheckRateLimit.mockResolvedValueOnce({
				allowed: false,
				remainingAttempts: 0,
				resetIn: 600000,
				message: 'Demasiados intentos desde esta dirección. Intenta nuevamente en 10 minutos.'
			});

			mockCheckEmailCooldown.mockResolvedValue({
				allowed: true,
				remainingSeconds: 0
			});

			const result = await createMagicLink(
				'test@example.com',
				'Test User',
				'http://localhost:5173',
				'Mozilla/5.0',
				'192.168.1.100' // IP bloqueada
			);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.status).toBe(429);
				expect(result.error).toContain('Demasiados intentos desde esta dirección');
			}
		});

		it('should reject authentication when email is blocked by rate limiting', async () => {
			// Simular email bloqueado por rate limiting
			mockCheckRateLimit.mockResolvedValueOnce({
				allowed: false,
				remainingAttempts: 0,
				resetIn: 3600000,
				message: 'Demasiados intentos para este correo. Intenta nuevamente en 1 hora.'
			});

			const result = await createMagicLink(
				'spam@example.com',
				'Spam User',
				'http://localhost:5173',
				'Mozilla/5.0',
				'10.0.0.1'
			);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.status).toBe(429);
				expect(result.error).toContain('Demasiados intentos para este correo');
			}
		});
	});
});
