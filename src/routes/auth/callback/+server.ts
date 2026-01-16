import { verifyTokenAndGetSession } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		throw redirect(303, '/auth/login?error=invalid_link');
	}

	const sessionToken = await verifyTokenAndGetSession(token);

	if (!sessionToken) {
		throw redirect(303, '/auth/login?error=expired_link');
	}

	// Establecer cookie HttpOnly
	cookies.set('session', sessionToken, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 60 * 60 * 24 * 7 // 7 días
	});

	throw redirect(303, '/dashboard');
};
