import { db } from './db';
import { usuarios, magicLinkTokens } from './db/schema';
import { eq } from 'drizzle-orm';
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

// --- Autenticación ---

export async function createMagicLink(email: string, nombre: string, origin: string) {
	const resend = new Resend(env.RESEND_API_KEY);
	console.log('Iniciando creación de Magic Link para:', email);

	// Determinar rol inicial: ADMIN si coincide con ADMIN_EMAIL
	const isAdminEmail = env.ADMIN_EMAIL && email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
	const rolInicial = isAdminEmail ? ROLES.ADMIN : ROLES.USUARIO;

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

	// Si es admin y su rol actual no es ADMIN, promover automáticamente
	if (isAdminEmail && user.rol !== ROLES.ADMIN) {
		await db.update(usuarios).set({ rol: ROLES.ADMIN }).where(eq(usuarios.id, user.id));
		user = { ...user, rol: ROLES.ADMIN };
		console.log('Usuario promovido a ADMIN automáticamente');
	}

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

export async function verifyTokenAndGetSession(token: string) {
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

	// Marcar como usado
	await db
		.update(magicLinkTokens)
		.set({ usedAt: new Date() })
		.where(eq(magicLinkTokens.id, dbToken.id));

	// Generar JWT con rol actualizado
	const sessionToken = sign(
		{ userId: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
		env.JWT_SECRET,
		{ expiresIn: '7d' }
	);

	return sessionToken;
}

export function authGuard(cookies: import('@sveltejs/kit').Cookies) {
	const token = cookies.get('session');
	if (!token) return null;

	try {
		return verify(token, env.JWT_SECRET) as {
			userId: number;
			email: string;
			rol: Rol;
			nombre: string;
		};
	} catch {
		return null;
	}
}
