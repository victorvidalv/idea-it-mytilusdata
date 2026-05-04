import { redirect } from '@sveltejs/kit';
import { logLogout } from '$lib/server/audit';
import { invalidateSession } from '$lib/server/auth';
import type { RequestHandler } from './$types';

// GET: Mostrar página de confirmación de logout
export const GET: RequestHandler = async ({ locals }) => {
	// Si el usuario ya está logueado, mostrar página de confirmación
	if (locals.user) {
		return new Response(
			`<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Cerrar Sesión | MytilusData</title>
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			font-family: system-ui, -apple-system, sans-serif;
			background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
			min-h-screen: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 1rem;
		}
		.card {
			background: rgba(30, 41, 59, 0.8);
			border: 1px solid rgba(148, 163, 184, 0.2);
			border-radius: 1rem;
			padding: 2rem;
			max-width: 400px;
			width: 100%;
			backdrop-filter: blur(12px);
			text-align: center;
		}
		.icon {
			width: 64px;
			height: 64px;
			margin: 0 auto 1.5rem;
			background: rgba(14, 165, 233, 0.1);
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		.icon svg {
			width: 32px;
			height: 32px;
			color: #0ea5e9;
		}
		h1 {
			color: #f8fafc;
			font-size: 1.5rem;
			margin-bottom: 0.75rem;
		}
		p {
			color: #94a3b8;
			margin-bottom: 1.5rem;
			line-height: 1.6;
		}
		.form {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;
		}
		.btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			padding: 0.75rem 1.5rem;
			border-radius: 0.5rem;
			font-weight: 500;
			text-decoration: none;
			transition: all 0.2s;
			cursor: pointer;
			border: none;
			font-size: 1rem;
		}
		.btn-primary {
			background: #0ea5e9;
			color: white;
		}
		.btn-primary:hover {
			background: #0284c7;
		}
		.btn-secondary {
			background: transparent;
			color: #94a3b8;
			border: 1px solid rgba(148, 163, 184, 0.3);
		}
		.btn-secondary:hover {
			background: rgba(148, 163, 184, 0.1);
			color: #f8fafc;
		}
	</style>
</head>
<body>
	<div class="card">
		<div class="icon">
			<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
			</svg>
		</div>
		<h1>¿Cerrar sesión?</h1>
		<p>Tu sesión se cerrará y tendrás que iniciar nuevamente para acceder a la plataforma.</p>
		<form method="POST" class="form">
			<button type="submit" class="btn btn-primary">Sí, cerrar sesión</button>
			<a href="/dashboard" class="btn btn-secondary">Cancelar</a>
		</form>
	</div>
</body>
</html>`,
			{
				headers: { 'Content-Type': 'text/html' }
			}
		);
	}
	// Si no hay usuario logueado, redirigir al login
	throw redirect(303, '/auth/login');
};

// POST: Realizar el logout
export const POST: RequestHandler = async ({ cookies, locals, request, getClientAddress }) => {
	// Obtener información del usuario antes de cerrar sesión
	const user = locals.user;
	const clientIp = getClientAddress();
	const userAgent = request.headers.get('user-agent') ?? undefined;

	// Invalidar sesión en base de datos y registrar en auditoría
	if (user) {
		// Invalidar la sesión específica en la base de datos
		await invalidateSession(user.sessionId);

		await logLogout({
			userId: user.userId,
			ip: clientIp,
			userAgent
		});
	}

	// Borrar la cookie de sesión
	cookies.delete('session', { path: '/' });
	throw redirect(303, '/auth/login');
};
