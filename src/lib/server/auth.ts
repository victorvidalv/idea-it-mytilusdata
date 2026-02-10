import { db } from './db';
import { usuarios, magicLinkTokens, sesiones } from './db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import pkg from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { redirect } from '@sveltejs/kit';

// Acceder correctamente a sign/verify desde el paquete CJS
const { sign, verify } = pkg;

// --- Constantes de Roles ---

/** Jerarquía de roles: mayor índice = mayor privilegio */
export const ROLES = {
	USUARIO: 'USUARIO',
	INVESTIGADOR: 'INVESTIGADOR',
	ADMIN: 'ADMIN'
} as const;

export type Rol = (typeof ROLES)[keyof typeof ROLES];

/** Niveles numéricos para comparación jerárquica */
const ROLE_LEVEL: Record<Rol, number> = {
	USUARIO: 0,
	INVESTIGADOR: 1,
	ADMIN: 2
};

/**
 * Verificar si el usuario tiene al menos el rol requerido.
 * Lanza redirect a /dashboard si no tiene permisos.
 */
export function requireRole(userRol: Rol | undefined, minRole: Rol): void {
	if (!userRol || ROLE_LEVEL[userRol] < ROLE_LEVEL[minRole]) {
		throw redirect(303, '/dashboard');
	}
}

/**
 * Verificar si un rol es igual o superior a otro (sin lanzar redirect).
 */
export function hasMinRole(userRol: Rol | undefined, minRole: Rol): boolean {
	if (!userRol) return false;
	return ROLE_LEVEL[userRol] >= ROLE_LEVEL[minRole];
}

// --- Utilidades de Hash ---

/**
 * Genera un hash SHA-256 de un token para almacenamiento seguro.
 */
function hashToken(token: string): string {
	return require('crypto').createHash('sha256').update(token).digest('hex');
}

// --- Gestión de Sesiones ---

/**
 * Crea una nueva sesión en la base de datos.
 * Retorna el ID de la sesión creada.
 */
export async function createSession(
	userId: number,
	userAgent?: string,
	ip?: string
): Promise<{ sessionId: number; sessionToken: string }> {
	// Generar token de sesión único
	const sessionToken = randomBytes(32).toString('hex');
	const tokenHash = hashToken(sessionToken);
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

	const [session] = await db
		.insert(sesiones)
		.values({
			userId,
			tokenHash,
			userAgent,
			ip,
			expiresAt
		})
		.returning();

	if (!session) {
		throw new Error('No se pudo crear la sesión');
	}

	return { sessionId: session.id, sessionToken };
}

/**
 * Invalida una sesión específica (para logout o actividad sospechosa).
 */
export async function invalidateSession(sessionId: number): Promise<void> {
	await db
		.update(sesiones)
		.set({ invalidatedAt: new Date() })
		.where(eq(sesiones.id, sessionId));
}

/**
 * Invalida todas las sesiones de un usuario (para desactivación o cambio de rol).
 */
export async function invalidateAllUserSessions(userId: number): Promise<void> {
	await db
		.update(sesiones)
		.set({ invalidatedAt: new Date() })
		.where(and(eq(sesiones.userId, userId), isNull(sesiones.invalidatedAt)));
}

/**
 * Verifica si una sesión es válida.
 * Retorna la sesión y el usuario si es válida, null si no.
 */
export async function validateSession(sessionId: number, tokenHash: string) {
	const [result] = await db
		.select({
			session: sesiones,
			user: usuarios
		})
		.from(sesiones)
		.innerJoin(usuarios, eq(sesiones.userId, usuarios.id))
		.where(eq(sesiones.id, sessionId))
		.limit(1);

	if (!result) return null;

	const { session, user } = result;

	// Verificar que el hash del token coincide
	if (session.tokenHash !== tokenHash) return null;

	// Verificar que no está invalidada
	if (session.invalidatedAt) return null;

	// Verificar que no está expirada
	if (session.expiresAt < new Date()) return null;

	// Verificar que el usuario sigue activo
	if (!user.activo) return null;

	return { session, user };
}

// --- Autenticación ---

export async function createMagicLink(
	email: string,
	nombre: string,
	origin: string,
	userAgent?: string,
	ip?: string
) {
	const resend = new Resend(env.RESEND_API_KEY);
	console.log('Iniciando creación de Magic Link para:', email);

	// RBAC Dinámico: Todo usuario nuevo comienza como USUARIO
	// Los roles se asignan exclusivamente desde el panel de administración
	const rolInicial = ROLES.USUARIO;

	// Verificar si el usuario existe, si no, crear
	let [user] = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);
	console.log('Usuario encontrado:', user);

	if (!user) {
		console.log('Creando nuevo usuario con rol:', rolInicial);
		const [newUser] = await db
			.insert(usuarios)
			.values({
				email,
				nombre,
				rol: rolInicial,
				activo: true
			})
			.returning();
		user = newUser;
		console.log('Nuevo usuario creado:', user);
	}

	if (!user) throw new Error('No se pudo crear el usuario');

	// Generar un token único
	const token = randomBytes(32).toString('hex');
	const tokenHash = token;
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

	console.log('Insertando token en DB...');
	await db.insert(magicLinkTokens).values({
		tokenHash,
		userId: user.id,
		expiresAt
	});

	const magicUrl = `${origin}/auth/callback?token=${token}`;
	console.log('Enviando email vía Resend a:', email);

	// Enviar correo con Resend
	const resendResult = await resend.emails.send({
		from: env.EMAIL_FROM || 'Plataforma Idea <onboarding@resend.dev>',
		to: email,
		subject: 'Tu enlace de acceso a la Plataforma',
		html: `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff; border-radius: 12px; overflow: hidden;">
			<div style="background: #075E54; padding: 28px 24px; text-align: center;">
				<h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em;">MytilusData</h1>
				<p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Mitilicultura</p>
			</div>
			<div style="padding: 32px 24px;">
				<h2 style="color: #111B21; margin: 0 0 8px; font-size: 18px; font-weight: 600;">Hola ${user.nombre},</h2>
				<p style="color: #54656F; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Haz clic en el siguiente botón para acceder a la plataforma de forma segura:</p>
				<a href="${magicUrl}" style="display: inline-block; background: #25D366; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; letter-spacing: 0.01em;">Acceder a la Plataforma</a>
				<p style="color: #8696A0; font-size: 13px; margin: 24px 0 0; line-height: 1.5;">Este enlace expirará en 15 minutos.</p>
				<p style="color: #8696A0; font-size: 12px; margin: 8px 0 0;">Si no solicitaste este acceso, puedes ignorar este correo.</p>
			</div>
			<div style="border-top: 1px solid #E9EDEF; padding: 16px 24px; text-align: center;">
				<p style="color: #8696A0; font-size: 11px; margin: 0;">© 2025 Plataforma Idea · Mitilicultura</p>
			</div>
		</div>`
	});

	if (resendResult.error) {
		console.error('Error de Resend:', JSON.stringify(resendResult.error));
		throw new Error(`Error de email: ${resendResult.error.message}`);
	}

	console.log('Magic Link enviado exitosamente. ID:', resendResult.data?.id);
	return true;
}

export async function verifyTokenAndGetSession(
	token: string,
	userAgent?: string,
	ip?: string
) {
	const [result] = await db
		.select({ token: magicLinkTokens, user: usuarios })
		.from(magicLinkTokens)
		.innerJoin(usuarios, eq(magicLinkTokens.userId, usuarios.id))
		.where(eq(magicLinkTokens.tokenHash, token))
		.limit(1);

	if (!result) return null;

	const { token: dbToken, user } = result;

	// Verificar expiración
	if (dbToken.expiresAt < new Date()) {
		return null;
	}

	// Verificar si ya se usó
	if (dbToken.usedAt) {
		return null;
	}

	// Verificar que el usuario está activo
	if (!user.activo) {
		return null;
	}

	// Marcar el magic link como usado
	await db
		.update(magicLinkTokens)
		.set({ usedAt: new Date() })
		.where(eq(magicLinkTokens.id, dbToken.id));

	// Crear sesión en la base de datos
	const { sessionId, sessionToken } = await createSession(user.id, userAgent, ip);

	// Generar JWT con sessionId (no solo userId)
	const jwtToken = sign(
		{
			sessionId,
			sessionTokenHash: hashToken(sessionToken),
			userId: user.id,
			email: user.email,
			rol: user.rol,
			nombre: user.nombre
		},
		env.JWT_SECRET,
		{ expiresIn: '7d' }
	);

	return jwtToken;
}

/**
 * AuthGuard mejorado: Valida el JWT Y la sesión en base de datos.
 * Verifica:
 * 1. JWT válido
 * 2. Sesión existe en BD
 * 3. Sesión no está invalidada
 * 4. Usuario sigue activo
 * 5. Rol coincide con el actual en BD
 */
export async function authGuard(
	cookies: import('@sveltejs/kit').Cookies
): Promise<{
	userId: number;
	email: string;
	rol: Rol;
	nombre: string;
	sessionId: number;
} | null> {
	const token = cookies.get('session');
	if (!token) return null;

	try {
		const decoded = verify(token, env.JWT_SECRET) as {
			sessionId: number;
			sessionTokenHash: string;
			userId: number;
			email: string;
			rol: Rol;
			nombre: string;
		};

		// Validar sesión en base de datos
		const sessionResult = await validateSession(decoded.sessionId, decoded.sessionTokenHash);

		if (!sessionResult) {
			// Sesión inválida: eliminar cookie
			cookies.delete('session', { path: '/' });
			return null;
		}

		const { user } = sessionResult;

		// Verificar que el rol en JWT coincide con rol actual en BD
		if (decoded.rol !== user.rol) {
			// Rol cambió: invalidar sesión y eliminar cookie
			await invalidateSession(decoded.sessionId);
			cookies.delete('session', { path: '/' });
			return null;
		}

		return {
			userId: user.id,
			email: user.email,
			rol: user.rol as Rol,
			nombre: user.nombre,
			sessionId: decoded.sessionId
		};
	} catch {
		cookies.delete('session', { path: '/' });
		return null;
	}
}
