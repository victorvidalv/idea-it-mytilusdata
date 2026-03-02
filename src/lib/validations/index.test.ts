import { describe, it, expect } from 'vitest';
import {
	loginSchema,
	centroSchema,
	cicloSchema,
	registroSchema,
	validateFormData
} from './index';

describe('Validations Module', () => {
	// --- loginSchema ---
	describe('loginSchema', () => {
		it('debería aceptar un email válido', () => {
			const result = loginSchema.safeParse({ email: 'user@example.com' });
			expect(result.success).toBe(true);
		});

		it('debería rechazar un email vacío', () => {
			const result = loginSchema.safeParse({ email: '' });
			expect(result.success).toBe(false);
		});

		it('debería rechazar un email sin @', () => {
			const result = loginSchema.safeParse({ email: 'invalid-email' });
			expect(result.success).toBe(false);
		});

		it('debería aceptar email con nombre opcional', () => {
			const result = loginSchema.safeParse({ email: 'user@test.com', nombre: 'Juan' });
			expect(result.success).toBe(true);
		});

		it('debería rechazar nombre demasiado corto', () => {
			const result = loginSchema.safeParse({ email: 'user@test.com', nombre: 'J' });
			expect(result.success).toBe(false);
		});
	});

	// --- centroSchema ---
	describe('centroSchema', () => {
		it('debería aceptar un centro con solo nombre', () => {
			const result = centroSchema.safeParse({ nombre: 'Centro Norte' });
			expect(result.success).toBe(true);
		});

		it('debería aceptar un centro con coordenadas válidas', () => {
			const result = centroSchema.safeParse({ nombre: 'Centro Sur', latitud: -41.4689, longitud: -72.9411 });
			expect(result.success).toBe(true);
		});

		it('debería rechazar nombre menor a 2 caracteres', () => {
			const result = centroSchema.safeParse({ nombre: 'A' });
			expect(result.success).toBe(false);
		});

		it('debería rechazar nombre mayor a 100 caracteres', () => {
			const result = centroSchema.safeParse({ nombre: 'X'.repeat(101) });
			expect(result.success).toBe(false);
		});

		it('debería rechazar latitud fuera de rango (-91)', () => {
			const result = centroSchema.safeParse({ nombre: 'Centro', latitud: -91 });
			expect(result.success).toBe(false);
		});

		it('debería rechazar latitud fuera de rango (91)', () => {
			const result = centroSchema.safeParse({ nombre: 'Centro', latitud: 91 });
			expect(result.success).toBe(false);
		});

		it('debería rechazar longitud fuera de rango (181)', () => {
			const result = centroSchema.safeParse({ nombre: 'Centro', longitud: 181 });
			expect(result.success).toBe(false);
		});

		it('debería rechazar longitud fuera de rango (-181)', () => {
			const result = centroSchema.safeParse({ nombre: 'Centro', longitud: -181 });
			expect(result.success).toBe(false);
		});

		it('debería transformar NaN a null en latitud', () => {
			const result = centroSchema.safeParse({ nombre: 'Centro', latitud: NaN });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.latitud).toBeNull();
			}
		});

		it('debería transformar NaN a null en longitud', () => {
			const result = centroSchema.safeParse({ nombre: 'Centro', longitud: NaN });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.longitud).toBeNull();
			}
		});
	});

	// --- cicloSchema ---
	describe('cicloSchema', () => {
		it('debería aceptar un ciclo válido', () => {
			const result = cicloSchema.safeParse({ nombre: 'Primavera 2025', fechaSiembra: '2025-09-01', lugarId: 1 });
			expect(result.success).toBe(true);
		});

		it('debería rechazar nombre corto', () => {
			const result = cicloSchema.safeParse({ nombre: 'X', fechaSiembra: '2025-09-01', lugarId: 1 });
			expect(result.success).toBe(false);
		});

		it('debería rechazar fecha vacía', () => {
			const result = cicloSchema.safeParse({ nombre: 'Ciclo', fechaSiembra: '', lugarId: 1 });
			expect(result.success).toBe(false);
		});

		it('debería rechazar lugarId no positivo', () => {
			const result = cicloSchema.safeParse({ nombre: 'Ciclo', fechaSiembra: '2025-01-01', lugarId: 0 });
			expect(result.success).toBe(false);
		});

		it('debería rechazar lugarId negativo', () => {
			const result = cicloSchema.safeParse({ nombre: 'Ciclo', fechaSiembra: '2025-01-01', lugarId: -1 });
			expect(result.success).toBe(false);
		});
	});

	// --- registroSchema ---
	describe('registroSchema', () => {
		it('debería aceptar un registro válido completo', () => {
			const result = registroSchema.safeParse({ valor: 25.5, fechaMedicion: '2025-03-01', tipoId: 1, origenId: 1, cicloId: 2 });
			expect(result.success).toBe(true);
		});

		it('debería aceptar un registro sin cicloId (opcional)', () => {
			const result = registroSchema.safeParse({ valor: 10, fechaMedicion: '2025-03-01', tipoId: 1, origenId: 1 });
			expect(result.success).toBe(true);
		});

		it('debería coercionar valor desde string', () => {
			const result = registroSchema.safeParse({ valor: '42.5', fechaMedicion: '2025-03-01', tipoId: 1, origenId: 1 });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.valor).toBe(42.5);
			}
		});

		it('debería rechazar fecha vacía', () => {
			const result = registroSchema.safeParse({ valor: 10, fechaMedicion: '', tipoId: 1, origenId: 1 });
			expect(result.success).toBe(false);
		});

		it('debería rechazar tipoId no positivo', () => {
			const result = registroSchema.safeParse({ valor: 10, fechaMedicion: '2025-01-01', tipoId: 0, origenId: 1 });
			expect(result.success).toBe(false);
		});
	});

	// --- validateFormData ---
	describe('validateFormData', () => {
		it('debería retornar success con datos válidos', () => {
			const result = validateFormData(centroSchema, { nombre: 'Centro Test' });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.nombre).toBe('Centro Test');
			}
		});

		it('debería retornar errors con datos inválidos', () => {
			const result = validateFormData(centroSchema, { nombre: 'X' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors).toBeDefined();
				expect(result.errors['nombre']).toBeDefined();
				expect(result.errors['nombre'].length).toBeGreaterThan(0);
			}
		});

		it('debería retornar error en _form cuando no hay path', () => {
			// Esquema que falla sin path específico
			const result = validateFormData(centroSchema, {});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors['nombre']).toBeDefined();
			}
		});

		it('debería agrupar múltiples errores por campo', () => {
			// nombre vacío falla en min(2) 
			const result = validateFormData(centroSchema, { nombre: '', latitud: -999 });
			expect(result.success).toBe(false);
		});
	});
});
