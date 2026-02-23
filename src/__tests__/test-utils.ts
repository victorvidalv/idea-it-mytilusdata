import type { RequestEvent } from '@sveltejs/kit';
import { vi } from 'vitest';

// Tipos parciales para mocks
export type PartialRequestEvent = Partial<RequestEvent>;

// Factory function para crear RequestEvent mockeado
export function createMockRequestEvent(overrides: PartialRequestEvent = {}): RequestEvent {
	return {
		cookies: {
			get: vi.fn(),
			set: vi.fn(),
			delete: vi.fn(),
			getAll: vi.fn(),
			serialize: vi.fn()
		},
		getClientAddress: vi.fn(() => '127.0.0.1'),
		locals: {
			user: null,
			session: null
		},
		params: {},
		request: new Request('http://localhost/test'),
		route: { id: '/test' },
		url: new URL('http://localhost/test'),
		isDataRequest: false,
		isSubRequest: false,
		method: 'GET',
		...overrides
	} as RequestEvent;
}

// Mock de usuario autenticado
export function createMockUser(overrides: Record<string, unknown> = {}) {
	return {
		id: 1,
		email: 'test@example.com',
		nombre: 'Test User',
		rol: 'USUARIO',
		activo: true,
		createdAt: new Date(),
		...overrides
	};
}

// Mock de sesión
export function createMockSession(overrides: Record<string, unknown> = {}) {
	return {
		id: 'session-id',
		userId: 1,
		expiresAt: new Date(Date.now() + 86400000),
		...overrides
	};
}

// Helper para esperar en tests async
export function flushPromises(): Promise<unknown> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

// Opciones para crear RequestEvent de API
interface ApiRequestEventOptions {
	authorization?: string | null;
	clientAddress?: string;
	userAgent?: string;
	user?: { userId: number; rol: string } | null;
}

// Helper para crear RequestEvent mock para endpoints de API con autenticación por API Key
export function createApiRequestEvent(options: ApiRequestEventOptions = {}): RequestEvent {
	const headers = new Map<string, string>();
	if (options.authorization !== undefined && options.authorization !== null) {
		headers.set('Authorization', options.authorization);
	}
	if (options.userAgent) {
		headers.set('user-agent', options.userAgent);
	}

	const event = {
		request: {
			headers: {
				get: (key: string) => headers.get(key) ?? null
			}
		},
		getClientAddress: () => options.clientAddress ?? '127.0.0.1',
		locals: {
			user: options.user ?? null
		},
		cookies: {
			get: vi.fn(),
			set: vi.fn(),
			delete: vi.fn(),
			getAll: vi.fn(),
			serialize: vi.fn()
		},
		params: {},
		route: { id: '/api/test' },
		url: new URL('http://localhost/api/test'),
		isDataRequest: false,
		isSubRequest: false,
		method: 'GET'
	};

	return event as unknown as RequestEvent;
}
