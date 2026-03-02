import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks con vi.hoisted
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

vi.mock('../db', () => ({
	db: {
		select: mockSelect,
		insert: mockInsert,
		update: mockUpdate
	}
}));

vi.mock('../db/schema', () => ({
	usuarios: { symbol: Symbol('usuarios') },
	sesiones: { symbol: Symbol('sesiones') }
}));

vi.mock('drizzle-orm', () => ({
	eq: vi.fn((_, value) => ({ eq: value })),
	and: vi.fn((...args) => ({ and: args })),
	isNull: vi.fn(() => ({ isNull: true }))
}));

import { hashToken, createSession, invalidateSession, invalidateAllUserSessions, validateSession } from './sessions';

describe('Auth Sessions Module', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('hashToken', () => {
		it('debería producir un hash SHA-256 de 64 caracteres hex', () => {
			const hash = hashToken('test-token');
			expect(hash).toHaveLength(64);
			expect(hash).toMatch(/^[a-f0-9]{64}$/);
		});

		it('debería producir hash consistente (mismo input = mismo output)', () => {
			const hash1 = hashToken('my-token');
			const hash2 = hashToken('my-token');
			expect(hash1).toBe(hash2);
		});

		it('debería producir hashes diferentes para tokens diferentes', () => {
			const hash1 = hashToken('token-a');
			const hash2 = hashToken('token-b');
			expect(hash1).not.toBe(hash2);
		});

		it('debería manejar string vacío', () => {
			const hash = hashToken('');
			expect(hash).toHaveLength(64);
		});

		it('debería manejar caracteres especiales', () => {
			const hash = hashToken('tøkén-wíth-spëcial-çhars!@#$%');
			expect(hash).toHaveLength(64);
		});
	});

	describe('createSession', () => {
		it('debería crear una sesión y retornar sessionId y sessionToken', async () => {
			mockInsert.mockReturnValue({
				values: mockValues.mockReturnValue({
					returning: mockReturning.mockResolvedValue([{ id: 42 }])
				})
			});

			const result = await createSession(1, 'Mozilla/5.0', '192.168.1.1');

			expect(result.sessionId).toBe(42);
			expect(result.sessionToken).toBeDefined();
			expect(result.sessionToken).toHaveLength(64); // 32 bytes hex
		});

		it('debería funcionar sin userAgent ni IP (opcionales)', async () => {
			mockInsert.mockReturnValue({
				values: mockValues.mockReturnValue({
					returning: mockReturning.mockResolvedValue([{ id: 1 }])
				})
			});

			const result = await createSession(1);

			expect(result.sessionId).toBe(1);
			expect(result.sessionToken).toBeDefined();
		});

		it('debería lanzar error cuando la inserción falla', async () => {
			mockInsert.mockReturnValue({
				values: mockValues.mockReturnValue({
					returning: mockReturning.mockResolvedValue([])
				})
			});

			await expect(createSession(1)).rejects.toThrow('No se pudo crear la sesión');
		});

		it('debería generar tokens únicos en cada invocación', async () => {
			mockInsert.mockReturnValue({
				values: mockValues.mockReturnValue({
					returning: mockReturning.mockResolvedValue([{ id: 1 }])
				})
			});

			const result1 = await createSession(1);
			const result2 = await createSession(1);

			expect(result1.sessionToken).not.toBe(result2.sessionToken);
		});
	});

	describe('invalidateSession', () => {
		it('debería actualizar la sesión con invalidatedAt', async () => {
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
		it('debería invalidar todas las sesiones activas del usuario', async () => {
			mockUpdate.mockReturnValue({
				set: mockSet.mockReturnValue({
					where: mockWhere.mockResolvedValue(undefined)
				})
			});

			await invalidateAllUserSessions(5);

			expect(mockUpdate).toHaveBeenCalled();
			expect(mockSet).toHaveBeenCalledWith({ invalidatedAt: expect.any(Date) });
		});
	});

	describe('validateSession', () => {
		const validSession = {
			id: 1,
			tokenHash: 'valid-hash',
			invalidatedAt: null,
			expiresAt: new Date(Date.now() + 86400000) // +1 día
		};
		const activeUser = { id: 1, activo: true, email: 'test@example.com', rol: 'USUARIO' };

		function setupSessionMock(session: unknown, user: unknown) {
			mockSelect.mockReturnValue({
				from: mockFrom.mockReturnValue({
					innerJoin: mockInnerJoin.mockReturnValue({
						where: mockWhere.mockReturnValue({
							limit: mockLimit.mockResolvedValue(
								session ? [{ session, user }] : []
							)
						})
					})
				})
			});
		}

		it('debería retornar null cuando la sesión no existe', async () => {
			setupSessionMock(null, null);
			const result = await validateSession(999, 'hash');
			expect(result).toBeNull();
		});

		it('debería retornar null cuando el tokenHash no coincide', async () => {
			setupSessionMock({ ...validSession, tokenHash: 'different-hash' }, activeUser);
			const result = await validateSession(1, 'valid-hash');
			expect(result).toBeNull();
		});

		it('debería retornar null cuando la sesión está invalidada', async () => {
			setupSessionMock({ ...validSession, invalidatedAt: new Date() }, activeUser);
			const result = await validateSession(1, 'valid-hash');
			expect(result).toBeNull();
		});

		it('debería retornar null cuando la sesión está expirada', async () => {
			setupSessionMock({ ...validSession, expiresAt: new Date(Date.now() - 86400000) }, activeUser);
			const result = await validateSession(1, 'valid-hash');
			expect(result).toBeNull();
		});

		it('debería retornar null cuando el usuario está inactivo', async () => {
			setupSessionMock(validSession, { ...activeUser, activo: false });
			const result = await validateSession(1, 'valid-hash');
			expect(result).toBeNull();
		});

		it('debería retornar sesión y usuario cuando todo es válido', async () => {
			setupSessionMock(validSession, activeUser);
			const result = await validateSession(1, 'valid-hash');
			expect(result).not.toBeNull();
			expect(result?.session).toEqual(validSession);
			expect(result?.user).toEqual(activeUser);
		});
	});
});
