import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { logLoginFailed } from '$lib/server/audit';
import {
	checkAllRateLimits,
	handleExistingUserLogin,
	handleNewUserRegistration,
	type LoginContext
} from '$lib/server/auth/login';
import type { Actions, RequestEvent } from './$types';

// --- Action principal (orquestador) ---

export const actions = {
	default: async (event: RequestEvent) => {
		const { request, url, getClientAddress } = event;
		const data = await request.formData();
		const email = data.get('email');

		const clientIp = getClientAddress();
		const userAgent = request.headers.get('user-agent') ?? undefined;

		// Validar formato de email
		if (!email || typeof email !== 'string' || !email.includes('@')) {
			return fail(400, { email, missing: true, message: 'Correo electrónico inválido' });
		}

		// Verificar todos los rate limits
		const rateLimitError = await checkAllRateLimits(email, clientIp);
		if (rateLimitError) return rateLimitError;

		const ctx: LoginContext = { email, clientIp, userAgent, origin: url.origin };

		try {
			const [user] = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);

			if (user) {
				return handleExistingUserLogin(user, ctx);
			}

			return handleNewUserRegistration(
				data.get('nombre'),
				data.get('terms'),
				data.get('cf-turnstile-response'),
				ctx
			);
		} catch (error) {
			console.error('Login action error:', error);
			await logLoginFailed({ email, ip: clientIp, userAgent, reason: 'INTERNAL_ERROR' });
			return fail(500, {
				email,
				error: true,
				message: 'No se pudo procesar la solicitud. Inténtalo de nuevo.'
			});
		}
	}
} satisfies Actions;