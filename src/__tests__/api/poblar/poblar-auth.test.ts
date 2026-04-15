// @ts-nocheck — Los tipos de ruta generados por SvelteKit crean incompatibilidades en mocks de test
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSelect = vi.hoisted(() => vi.fn());
const mockFrom = vi.hoisted(() => vi.fn());
const mockWhere = vi.hoisted(() => vi.fn());
const mockLimit = vi.hoisted(() => vi.fn());
const mockHasMinRole = vi.hoisted(() => vi.fn());

vi.mock('$lib/server/db', () => ({ db: { select: mockSelect } }));
vi.mock('$lib/server/db/schema', () => ({
	apiKeys: { key: 'key', userId: 'userId', symbol: Symbol('apiKeys') },
	usuarios: { id: 'id', rol: 'rol', symbol: Symbol('usuarios') }
}));
vi.mock('drizzle-orm', () => ({ eq: vi.fn((col, val) => ({ col, val })) }));
vi.mock('$lib/server/auth/roles', () => ({
	hasMinRole: mockHasMinRole,
	ROLES: { USUARIO: 'USUARIO', INVESTIGADOR: 'INVESTIGADOR', ADMIN: 'ADMIN' }
}));

import { validarAdmin } from '../../../routes/api/poblar/auth';

function mockDbQuery(results: Array<Record<string, unknown>[]>) {
	let callIndex = 0;
	mockSelect.mockImplementation(() => {
		const result = results[callIndex++] ?? [];
		const limitMock = vi.fn().mockResolvedValue(result);
		const whereMock = vi.fn().mockReturnValue({ limit: limitMock });
		const fromMock = vi.fn().mockReturnValue({ where: whereMock });
		return { from: fromMock };
	});
}

describe('validarAdmin', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Autenticación', () => {
		it('retorna error 401 si falta el header Authorization', async () => {
			const result = await validarAdmin(null);

			expect(result.error).toBeDefined();
			const response = result.error;
			expect(response.status).toBe(401);
			const data = await response.json();
			expect(data.error).toBe('Falta la API Key en el header Authorization');
		});

		it('retorna error 401 si el header no tiene formato Bearer', async () => {
			const result = await validarAdmin('InvalidFormat');

			expect(result.error).toBeDefined();
			const response = result.error;
			expect(response.status).toBe(401);
			const data = await response.json();
			expect(data.error).toBe('Falta la API Key en el header Authorization');
		});

		it('retorna error 401 si la API Key no existe', async () => {
			mockDbQuery([[]]);

			const result = await validarAdmin('Bearer non-existent-key');

			expect(result.error).toBeDefined();
			const response = result.error;
			expect(response.status).toBe(401);
			const data = await response.json();
			expect(data.error).toBe('API Key inválida');
		});

		it('retorna error 401 si el usuario no existe', async () => {
			mockDbQuery([[{ userId: 99, key: 'some-key' }], []]);

			const result = await validarAdmin('Bearer some-key');

			expect(result.error).toBeDefined();
			const response = result.error;
			expect(response.status).toBe(401);
			const data = await response.json();
			expect(data.error).toBe('Usuario no encontrado');
		});

		it('retorna error 403 si el usuario no es ADMIN', async () => {
			mockDbQuery([[{ userId: 1, key: 'user-key' }], [{ id: 1, rol: 'USUARIO' }]]);
			mockHasMinRole.mockReturnValue(false);

			const result = await validarAdmin('Bearer user-key');

			expect(result.error).toBeDefined();
			const response = result.error;
			expect(response.status).toBe(403);
			const data = await response.json();
			expect(data.error).toBe('Acceso denegado. Se requiere rol ADMIN');
		});

		it('retorna userId si la validación es exitosa', async () => {
			mockDbQuery([[{ userId: 5, key: 'admin-key' }], [{ id: 5, rol: 'ADMIN' }]]);
			mockHasMinRole.mockReturnValue(true);

			const result = await validarAdmin('Bearer admin-key');

			expect(result.userId).toBe(5);
			expect(result.error).toBeUndefined();
		});
	});

	describe('Edge cases', () => {
		it('maneja correctamente diferentes roles', async () => {
			const roles = [
				{ rol: 'INVESTIGADOR', expectedStatus: 403 },
				{ rol: 'USUARIO', expectedStatus: 403 }
			];

			for (const { rol, expectedStatus } of roles) {
				vi.clearAllMocks();
				mockDbQuery([[{ userId: 1, key: `${rol.toLowerCase()}-key` }], [{ id: 1, rol }]]);
				mockHasMinRole.mockReturnValue(false);

				const result = await validarAdmin(`Bearer ${rol.toLowerCase()}-key`);

				expect(result.error).toBeDefined();
				const response = result.error;
				expect(response.status).toBe(expectedStatus);
				const data = await response.json();
				expect(data.error).toBe('Acceso denegado. Se requiere rol ADMIN');
			}
		});

		it('retorna el userId correcto del usuario ADMIN', async () => {
			const userIds = [1, 42, 999];

			for (const expectedId of userIds) {
				vi.clearAllMocks();
				mockDbQuery([
					[{ userId: expectedId, key: `key-${expectedId}` }],
					[{ id: expectedId, rol: 'ADMIN' }]
				]);
				mockHasMinRole.mockReturnValue(true);

				const result = await validarAdmin(`Bearer key-${expectedId}`);

				expect(result.userId).toBe(expectedId);
			}
		});
	});
});
