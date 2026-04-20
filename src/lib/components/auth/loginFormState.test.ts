import { describe, it, expect } from 'vitest';
import {
	isSuccess,
	requiresRegistration,
	isRateLimited,
	hasFormError,
	type LoginFormState
} from './loginFormState';

describe('loginFormState', () => {
	describe('isSuccess', () => {
		describe('Casos exitosos', () => {
			it('retorna true cuando form.success es true', () => {
				const form: LoginFormState = { success: true };
				expect(isSuccess(form)).toBe(true);
			});
		});

		describe('Casos borde', () => {
			it('retorna false cuando form es null', () => {
				expect(isSuccess(null)).toBe(false);
			});

			it('retorna false cuando form es undefined', () => {
				expect(isSuccess(undefined)).toBe(false);
			});

			it('retorna false cuando form.success es false', () => {
				const form: LoginFormState = { success: false };
				expect(isSuccess(form)).toBe(false);
			});

			it('retorna false cuando form.success no existe', () => {
				const form: LoginFormState = { error: true };
				expect(isSuccess(form)).toBe(false);
			});

			it('retorna false cuando form es objeto vacío', () => {
				const form: LoginFormState = {};
				expect(isSuccess(form)).toBe(false);
			});
		});
	});

	describe('requiresRegistration', () => {
		describe('Casos exitosos', () => {
			it('retorna true cuando form.requiresRegistration es true', () => {
				const form: LoginFormState = { requiresRegistration: true };
				expect(requiresRegistration(form)).toBe(true);
			});
		});

		describe('Casos borde', () => {
			it('retorna false cuando form es null', () => {
				expect(requiresRegistration(null)).toBe(false);
			});

			it('retorna false cuando form es undefined', () => {
				expect(requiresRegistration(undefined)).toBe(false);
			});

			it('retorna false cuando form.requiresRegistration es false', () => {
				const form: LoginFormState = { requiresRegistration: false };
				expect(requiresRegistration(form)).toBe(false);
			});

			it('retorna false cuando form.requiresRegistration no existe', () => {
				const form: LoginFormState = { success: true };
				expect(requiresRegistration(form)).toBe(false);
			});

			it('retorna false cuando form es objeto vacío', () => {
				const form: LoginFormState = {};
				expect(requiresRegistration(form)).toBe(false);
			});
		});
	});

	describe('isRateLimited', () => {
		describe('Casos exitosos', () => {
			it('retorna true cuando form.rateLimited es true', () => {
				const form: LoginFormState = { rateLimited: true };
				expect(isRateLimited(form)).toBe(true);
			});

			it('retorna true cuando form.cooldownActive es true', () => {
				const form: LoginFormState = { cooldownActive: true };
				expect(isRateLimited(form)).toBe(true);
			});

			it('retorna true cuando ambos rateLimited y cooldownActive son true', () => {
				const form: LoginFormState = { rateLimited: true, cooldownActive: true };
				expect(isRateLimited(form)).toBe(true);
			});
		});

		describe('Casos borde', () => {
			it('retorna false cuando form es null', () => {
				expect(isRateLimited(null)).toBe(false);
			});

			it('retorna false cuando form es undefined', () => {
				expect(isRateLimited(undefined)).toBe(false);
			});

			it('retorna false cuando ninguno es true', () => {
				const form: LoginFormState = { rateLimited: false, cooldownActive: false };
				expect(isRateLimited(form)).toBe(false);
			});

			it('retorna false cuando las propiedades no existen', () => {
				const form: LoginFormState = { success: true };
				expect(isRateLimited(form)).toBe(false);
			});

			it('retorna false cuando form es objeto vacío', () => {
				const form: LoginFormState = {};
				expect(isRateLimited(form)).toBe(false);
			});
		});
	});

	describe('hasFormError', () => {
		describe('Casos con error', () => {
			it('retorna true cuando form.error es true', () => {
				const form: LoginFormState = { error: true };
				expect(hasFormError(form)).toBe(true);
			});

			it('retorna true cuando form.missing es true', () => {
				const form: LoginFormState = { missing: true };
				expect(hasFormError(form)).toBe(true);
			});

			it('retorna true cuando form.captchaError es true', () => {
				const form: LoginFormState = { captchaError: true };
				expect(hasFormError(form)).toBe(true);
			});

			it('retorna true cuando isRateLimited(form) es true por rateLimited', () => {
				const form: LoginFormState = { rateLimited: true };
				expect(hasFormError(form)).toBe(true);
			});

			it('retorna true cuando isRateLimited(form) es true por cooldownActive', () => {
				const form: LoginFormState = { cooldownActive: true };
				expect(hasFormError(form)).toBe(true);
			});

			it('retorna true cuando múltiples errores están presentes', () => {
				const form: LoginFormState = { error: true, missing: true, captchaError: true };
				expect(hasFormError(form)).toBe(true);
			});
		});

		describe('Casos sin error', () => {
			it('retorna false cuando form es null', () => {
				expect(hasFormError(null)).toBe(false);
			});

			it('retorna false cuando form es undefined', () => {
				expect(hasFormError(undefined)).toBe(false);
			});

			it('retorna false cuando no hay errores', () => {
				const form: LoginFormState = { success: true };
				expect(hasFormError(form)).toBe(false);
			});

			it('retorna false cuando form es objeto vacío', () => {
				const form: LoginFormState = {};
				expect(hasFormError(form)).toBe(false);
			});

			it('retorna false cuando todas las propiedades de error son false', () => {
				const form: LoginFormState = {
					error: false,
					missing: false,
					captchaError: false,
					rateLimited: false,
					cooldownActive: false
				};
				expect(hasFormError(form)).toBe(false);
			});
		});
	});
});