import { db } from '../db';
import { usuarios, magicLinkTokens } from '../db/schema';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import { env } from '$env/dynamic/private';
import { randomBytes } from 'crypto';
import {
	checkRateLimit,
	logRateLimitAttempt,
	checkEmailCooldown,
	updateEmailCooldown
} from '../rate-limiter';
import { ROLES } from './roles';
import { hashToken, createSession } from './sessions';
import pkg from 'jsonwebtoken';

// Acceder correctamente a sign desde el paquete CJS
const { sign } = pkg;

// --- Constantes ---

/** Tiempo de expiración del Magic Link en milisegundos (15 minutos) */
export const MAGIC_LINK_EXPIRATION_MS = 15 * 60 * 1000;

// --- Tipos ---

/** Resultado de createMagicLink con validaciones defensivas */
export type MagicLinkResult = { success: true } | { success: false; error: string; status: number };

// --- Funciones privadas ---

/**
 * Validar rate limits defensivos antes de enviar un Magic Link.
 * Protege contra abuso económico (envío masivo de emails vía Resend).
 * Retorna objeto de error o null si todo está dentro de los límites.
 */
async function validateMagicLinkRateLimits(
	email: string,
	clientIp?: string
): Promise<MagicLinkResult | null> {
	const emailCheck = await checkRateLimit(email.toLowerCase(), 'EMAIL');
	if (!emailCheck.allowed) {
		return { success: false, error: emailCheck.message || 'Demasiados intentos para este correo', status: 429 };
	}

	if (clientIp) {
		const ipCheck = await checkRateLimit(clientIp, 'IP');
		if (!ipCheck.allowed) {
			return { success: false, error: ipCheck.message || 'Demasiados intentos desde esta dirección', status: 429 };
		}
	}

	const cooldown = await checkEmailCooldown(email);
	if (!cooldown.allowed) {
		return { success: false, error: cooldown.message || 'Por favor espera antes de solicitar otro enlace', status: 429 };
	}

	return null;
}

/** Construir el HTML del email de Magic Link */
function buildMagicLinkEmailHtml(nombre: string, magicUrl: string): string {
	return `<div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #ffffff; border-radius: 12px; overflow: hidden;">
		<div style="background: #075E54; padding: 28px 24px; text-align: center;">
			<h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em;">MytilusData</h1>
			<p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em;">Mitilicultura</p>
		</div>
		<div style="padding: 32px 24px;">
			<h2 style="color: #111B21; margin: 0 0 8px; font-size: 18px; font-weight: 600;">Hola ${nombre},</h2>
			<p style="color: #54656F; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">Haz clic en el siguiente botón para acceder a la plataforma de forma segura:</p>
			<a href="${magicUrl}" style="display: inline-block; background: #25D366; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600; letter-spacing: 0.01em;">Acceder a la Plataforma</a>
			<p style="color: #8696A0; font-size: 13px; margin: 24px 0 0; line-height: 1.5;">Este enlace expirará en 15 minutos.</p>
			<p style="color: #8696A0; font-size: 12px; margin: 8px 0 0;">Si no solicitaste este acceso, puedes ignorar este correo.</p>
		</div>
		<div style="border-top: 1px solid #E9EDEF; padding: 16px 24px; text-align: center;">
			<p style="color: #8696A0; font-size: 11px; margin: 0;">© 2026 MytilusData · Mitilicultura</p>
		</div>
	</div>`;
}

// --- Funciones públicas ---

/**
 * Crear y enviar un Magic Link al email especificado.
 *
 * Incluye validaciones defensivas de rate limiting (defense in depth)
 * para proteger contra abuso económico de envío masivo de emails.
 */
export async function createMagicLink(
	email: string,
	nombre: string,
	origin: string,
	userAgent?: string,
	clientIp?: string
): Promise<MagicLinkResult> {
	// Validaciones defensivas obligatorias
	const rateLimitError = await validateMagicLinkRateLimits(email, clientIp);
	if (rateLimitError) return rateLimitError;

	// Registrar intentos para rate limiting
	await logRateLimitAttempt(email.toLowerCase(), 'EMAIL');
	if (clientIp) {
		await logRateLimitAttempt(clientIp, 'IP');
	}
	await updateEmailCooldown(email);

	// Crear/obtener usuario
	const resend = new Resend(env.RESEND_API_KEY);
	const rolInicial = ROLES.USUARIO;

	let [user] = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);

	if (!user) {
		const [newUser] = await db
			.insert(usuarios)
			.values({ email, nombre, rol: rolInicial, activo: true })
			.returning();
		user = newUser;
	}

	if (!user) {
		return { success: false, error: 'No se pudo crear el usuario', status: 500 };
	}

	// Generar token y almacenar hash seguro
	const token = randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRATION_MS);

	await db.insert(magicLinkTokens).values({
		tokenHash: hashToken(token),
		userId: user.id,
		expiresAt
	});

	// Enviar correo con Resend
	const magicUrl = `${origin}/auth/callback?token=${token}`;
	const resendResult = await resend.emails.send({
		from: env.EMAIL_FROM || 'MytilusData <onboarding@resend.dev>',
		to: email,
		subject: 'Tu enlace de acceso a la Plataforma',
		html: buildMagicLinkEmailHtml(user.nombre, magicUrl)
	});

	if (resendResult.error) {
		console.error('Error de Resend:', JSON.stringify(resendResult.error));
		return { success: false, error: `Error de email: ${resendResult.error.message}`, status: 500 };
	}

	return { success: true };
}

/**
 * Verificar un token de Magic Link y crear una sesión.
 * Retorna un JWT si el token es válido, null en caso contrario.
 */
export async function verifyTokenAndGetSession(token: string, userAgent?: string, ip?: string) {
	// Hashear el token recibido para buscar en la base de datos
	const tokenHash = hashToken(token);

	const [result] = await db
		.select({ token: magicLinkTokens, user: usuarios })
		.from(magicLinkTokens)
		.innerJoin(usuarios, eq(magicLinkTokens.userId, usuarios.id))
		.where(eq(magicLinkTokens.tokenHash, tokenHash))
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