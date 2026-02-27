// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: {
				userId: number;
				email: string;
				nombre: string;
				rol: 'ADMIN' | 'INVESTIGADOR' | 'USUARIO';
				sessionId: number;
			} | null;
			// API Key authentication - userId from valid API key
			apiUserId?: number;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
