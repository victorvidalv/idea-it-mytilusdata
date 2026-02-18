import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock de fetch global
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock de variables de entorno
const mockEnv: Record<string, string | undefined> = {};

vi.mock('$env/dynamic/private', () => ({
	get env() {
		return mockEnv;
	}
}));

// Importar después de los mocks
import { verifyTurnstile, isTurnstileConfigured } from './captcha';

describe('Captcha Module', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		// Reset env
		delete mockEnv.TURNSTILE_SECRET_KEY;
	});

	describe('isTurnstileConfigured', () => {
		it('debe retornar false si TURNSTILE_SECRET_KEY no está configurada', () => {
			mockEnv.TURNSTILE_SECRET_KEY = undefined;

			expect(isTurnstileConfigured()).toBe(false);
		});

		it('debe retornar true si TURNSTILE_SECRET_KEY está configurada', () => {
			mockEnv.TURNSTILE_SECRET_KEY = 'test-secret-key';

			expect(isTurnstileConfigured()).toBe(true);
		});

		it('debe retornar false si TURNSTILE_SECRET_KEY es string vacío', () => {
			mockEnv.TURNSTILE_SECRET_KEY = '';

			expect(isTurnstileConfigured()).toBe(false);
		});
	});

	describe('verifyTurnstile', () => {
		it('debe retornar true si TURNSTILE_SECRET_KEY no está configurada (modo desarrollo)', async () => {
			mockEnv.TURNSTILE_SECRET_KEY = undefined;

			const result = await verifyTurnstile('test-token');

			expect(result).toBe(true);
			expect(console.warn).toHaveBeenCalledWith(
				'TURNSTILE_SECRET_KEY no configurada. Omitiendo verificación CAPTCHA.'
			);
		});

		it('debe retornar false si no hay token', async () => {
			mockEnv.TURNSTILE_SECRET_KEY = 'test-secret-key';

			const result = await verifyTurnstile('');

			expect(result).toBe(false);
			expect(console.warn).toHaveBeenCalledWith('Token de Turnstile no proporcionado.');
		});

		it('debe retornar false si token es null/undefined', async () => {
			mockEnv.TURNSTILE_SECRET_KEY = 'test-secret-key';

			const result = await verifyTurnstile(null as any);

			expect(result).toBe(false);
		});

		it('debe retornar true si la verificación es exitosa', async () => {
			mockEnv.TURNSTILE_SECRET_KEY = 'test-secret-key';

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ success: true })
			});

			const result = await verifyTurnstile('valid-token');

			expect(result).toBe(true);
			expect(mockFetch).toHaveBeenCalledWith(
				'https://challenges.cloudflare.com/turnstile/v0/siteverify',
				expect.objectContaining({
					method: 'POST',
					body: expect.any(URLSearchParams)
				})
			);
		});

		it('debe retornar false si la verificación falla', async () => {
			mockEnv.TURNSTILE_SECRET_KEY = 'test-secret-key';

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({
					success: false,
					error_codes: ['invalid-input-response']
				})
			});

			const result = await verifyTurnstile('invalid-token');

			expect(result).toBe(false);
			expect(console.warn).toHaveBeenCalledWith(
				'Verificación de Turnstile fallida:',
				['invalid-input-response']
			);
		});

		it('debe retornar false si la respuesta HTTP no es ok', async () => {
			mockEnv.TURNSTILE_SECRET_KEY = 'test-secret-key';

			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500
			});

			const result = await verifyTurnstile('test-token');

			expect(result).toBe(false);
			expect(console.error).toHaveBeenCalledWith(
				'Error en la respuesta de Turnstile:',
				500
			);
		});

		it('debe retornar true en caso de error de red (para no bloquear usuarios)', async () => {
			mockEnv.TURNSTILE_SECRET_KEY = 'test-secret-key';

			mockFetch.mockRejectedValueOnce(new Error('Network error'));

			const result = await verifyTurnstile('test-token');

			// En caso de error de red, permite el intento
			expect(result).toBe(true);
			expect(console.error).toHaveBeenCalledWith(
				'Error al verificar Turnstile:',
				expect.any(Error)
			);
		});

		it('debe enviar la IP del cliente si se proporciona', async () => {
			mockEnv.TURNSTILE_SECRET_KEY = 'test-secret-key';

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ success: true })
			});

			await verifyTurnstile('valid-token', '192.168.1.1');

			const callArgs = mockFetch.mock.calls[0];
			const body = callArgs[1].body as URLSearchParams;

			expect(body.get('remoteip')).toBe('192.168.1.1');
		});

		it('debe no enviar IP si no se proporciona', async () => {
			mockEnv.TURNSTILE_SECRET_KEY = 'test-secret-key';

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ success: true })
			});

			await verifyTurnstile('valid-token');

			const callArgs = mockFetch.mock.calls[0];
			const body = callArgs[1].body as URLSearchParams;

			expect(body.get('remoteip')).toBeNull();
		});

		it('debe enviar el secret y response correctamente', async () => {
			mockEnv.TURNSTILE_SECRET_KEY = 'my-secret-key';

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ success: true })
			});

			await verifyTurnstile('my-token');

			const callArgs = mockFetch.mock.calls[0];
			const body = callArgs[1].body as URLSearchParams;

			expect(body.get('secret')).toBe('my-secret-key');
			expect(body.get('response')).toBe('my-token');
		});

		it('debe enviar Content-Type correcto', async () => {
			mockEnv.TURNSTILE_SECRET_KEY = 'test-secret-key';

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ success: true })
			});

			await verifyTurnstile('valid-token');

			const callArgs = mockFetch.mock.calls[0];
			expect(callArgs[1].headers['Content-Type']).toBe('application/x-www-form-urlencoded');
		});
	});

	describe('Casos de integración', () => {
		it('debe manejar un flujo completo de verificación exitosa', async () => {
			mockEnv.TURNSTILE_SECRET_KEY = 'production-secret';

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({
					success: true,
					challenge_ts: '2024-01-01T12:00:00Z',
					hostname: 'example.com',
					action: 'login'
				})
			});

			const result = await verifyTurnstile('user-provided-token', '192.168.1.1');

			expect(result).toBe(true);
		});

		it('debe manejar múltiples errores de Turnstile', async () => {
			mockEnv.TURNSTILE_SECRET_KEY = 'test-secret-key';

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({
					success: false,
					error_codes: [
						'invalid-input-response',
						'timeout-or-duplicate'
					]
				})
			});

			const result = await verifyTurnstile('expired-token');

			expect(result).toBe(false);
		});
	});
});

describe('TurnstileVerifyResponse Interface', () => {
	it('debe manejar respuestas con todos los campos opcionales', async () => {
		mockEnv.TURNSTILE_SECRET_KEY = 'test-secret-key';

		const fullResponse = {
			success: true,
			challenge_ts: '2024-01-01T12:00:00Z',
			hostname: 'example.com',
			error_codes: undefined,
			action: 'submit',
			cdata: 'custom-data'
		};

		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: () => Promise.resolve(fullResponse)
		});

		const result = await verifyTurnstile('test-token');

		expect(result).toBe(true);
	});
});
