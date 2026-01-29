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
		html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
			<h2>Hola ${user.nombre},</h2>
			<p>Haz clic en el siguiente enlace para acceder a la plataforma:</p>
			<a href="${magicUrl}" style="display: inline-block; background: #0f172a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">Acceder a la Plataforma</a>
			<p style="color: #64748b; font-size: 14px;">Este enlace expirará en 15 minutos.</p>
			<p style="color: #94a3b8; font-size: 12px;">Si no solicitaste este acceso, ignora este correo.</p>
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
