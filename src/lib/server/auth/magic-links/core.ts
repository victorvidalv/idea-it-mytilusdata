import { db } from '../../db';
import { magicLinkTokens, usuarios } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { randomBytes } from 'crypto';
import { logRateLimitAttempt, updateEmailCooldown } from '../../rate-limiter';
import { hashToken, createSession } from '../sessions';
import pkg from 'jsonwebtoken';
import { MAGIC_LINK_EXPIRATION_MS, type MagicLinkResult } from './types';
import { validateMagicLinkRateLimits } from './validation';
import { getOrCreateUser } from './users';
import { sendMagicLinkEmail } from './email';

// Acceder correctamente a sign desde el paquete CJS
const { sign } = pkg;

/**
 * Verificar que un token almacenado es válido.
 */
function isTokenValid(
	dbToken: typeof magicLinkTokens.$inferSelect,
	user: typeof usuarios.$inferSelect
): boolean {
	// Verificar expiración
	if (dbToken.expiresAt < new Date()) {
		return false;
	}

	// Verificar si ya se usó
	if (dbToken.usedAt) {
		return false;
	}

	// Verificar que el usuario está activo
	if (!user.activo) {
		return false;
	}

	return true;
}

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
	const userResult = await getOrCreateUser(email, nombre);
	if ('success' in userResult) {
		return userResult;
	}
	const user = userResult.user;

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
	return sendMagicLinkEmail(email, user.nombre, magicUrl);
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

	// Validar el token
	if (!isTokenValid(dbToken, user)) {
		return null;
	}

	// Marcar el magic link como usado
	await db
		.update(magicLinkTokens)
		.set({ usedAt: new Date() })
		.where(eq(magicLinkTokens.id, dbToken.id));

	// Crear sesión en la base de datos
	const { sessionId, sessionToken } = await createSession(user.id, userAgent, ip);

	// Generar JWT con sessionId
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