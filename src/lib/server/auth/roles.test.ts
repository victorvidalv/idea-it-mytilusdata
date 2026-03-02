import { describe, it, expect, vi } from 'vitest';

vi.mock('@sveltejs/kit', () => ({
	redirect: vi.fn((status: number, url: string) => {
		throw { status, location: url };
	})
}));

import { ROLES, requireRole, hasMinRole } from './roles';
import type { Rol } from './roles';

describe('Auth Roles Module', () => {
	describe('ROLES constant', () => {
		it('debería definir los 3 roles del sistema', () => {
			expect(ROLES.USUARIO).toBe('USUARIO');
			expect(ROLES.INVESTIGADOR).toBe('INVESTIGADOR');
			expect(ROLES.ADMIN).toBe('ADMIN');
		});

		it('debería tener exactamente 3 roles', () => {
			expect(Object.keys(ROLES)).toHaveLength(3);
		});
	});

	describe('hasMinRole', () => {
		it('debería retornar true para rol exacto', () => {
			expect(hasMinRole('USUARIO', ROLES.USUARIO)).toBe(true);
			expect(hasMinRole('INVESTIGADOR', ROLES.INVESTIGADOR)).toBe(true);
			expect(hasMinRole('ADMIN', ROLES.ADMIN)).toBe(true);
		});

		it('debería retornar true para rol superior', () => {
			expect(hasMinRole('ADMIN', ROLES.USUARIO)).toBe(true);
			expect(hasMinRole('ADMIN', ROLES.INVESTIGADOR)).toBe(true);
			expect(hasMinRole('INVESTIGADOR', ROLES.USUARIO)).toBe(true);
		});

		it('debería retornar false para rol inferior', () => {
			expect(hasMinRole('USUARIO', ROLES.INVESTIGADOR)).toBe(false);
			expect(hasMinRole('USUARIO', ROLES.ADMIN)).toBe(false);
			expect(hasMinRole('INVESTIGADOR', ROLES.ADMIN)).toBe(false);
		});

		it('debería retornar false para undefined (fail-closed)', () => {
			expect(hasMinRole(undefined, ROLES.USUARIO)).toBe(false);
			expect(hasMinRole(undefined, ROLES.ADMIN)).toBe(false);
		});

		it('debería retornar false para roles no reconocidos (fail-closed)', () => {
			expect(hasMinRole('HACKER' as Rol, ROLES.USUARIO)).toBe(false);
			expect(hasMinRole('SUPERADMIN' as Rol, ROLES.ADMIN)).toBe(false);
			expect(hasMinRole('' as Rol, ROLES.USUARIO)).toBe(false);
		});

		it('debería verificar jerarquía completa USUARIO < INVESTIGADOR < ADMIN', () => {
			// USUARIO es el nivel más bajo
			expect(hasMinRole('USUARIO', ROLES.USUARIO)).toBe(true);
			expect(hasMinRole('USUARIO', ROLES.INVESTIGADOR)).toBe(false);

			// INVESTIGADOR es nivel medio
			expect(hasMinRole('INVESTIGADOR', ROLES.USUARIO)).toBe(true);
			expect(hasMinRole('INVESTIGADOR', ROLES.ADMIN)).toBe(false);

			// ADMIN es el nivel más alto
			expect(hasMinRole('ADMIN', ROLES.USUARIO)).toBe(true);
			expect(hasMinRole('ADMIN', ROLES.ADMIN)).toBe(true);
		});
	});

	describe('requireRole', () => {
		it('no debería lanzar excepción con rol exacto', () => {
			expect(() => requireRole('ADMIN', ROLES.ADMIN)).not.toThrow();
			expect(() => requireRole('USUARIO', ROLES.USUARIO)).not.toThrow();
		});

		it('no debería lanzar excepción con rol superior', () => {
			expect(() => requireRole('ADMIN', ROLES.USUARIO)).not.toThrow();
			expect(() => requireRole('ADMIN', ROLES.INVESTIGADOR)).not.toThrow();
			expect(() => requireRole('INVESTIGADOR', ROLES.USUARIO)).not.toThrow();
		});

		it('debería lanzar redirect con rol inferior', () => {
			expect(() => requireRole('USUARIO', ROLES.ADMIN)).toThrow();
			expect(() => requireRole('USUARIO', ROLES.INVESTIGADOR)).toThrow();
			expect(() => requireRole('INVESTIGADOR', ROLES.ADMIN)).toThrow();
		});

		it('debería redirigir a /dashboard cuando el rol es insuficiente', () => {
			try {
				requireRole('USUARIO', ROLES.ADMIN);
			} catch (e) {
				const error = e as { status: number; location: string };
				expect(error.status).toBe(303);
				expect(error.location).toBe('/dashboard');
			}
		});

		it('debería lanzar redirect para undefined (fail-closed)', () => {
			expect(() => requireRole(undefined, ROLES.USUARIO)).toThrow();
		});

		it('debería lanzar redirect para roles no reconocidos (fail-closed)', () => {
			expect(() => requireRole('HACKER' as Rol, ROLES.USUARIO)).toThrow();
			expect(() => requireRole('SUPERADMIN' as Rol, ROLES.ADMIN)).toThrow();
		});
	});
});
