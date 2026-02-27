import { db } from '../db';
import { usuarios, sesiones } from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { randomBytes, createHash } from 'crypto';

// --- Utilidades de Hash ---

/**
 * Genera un hash SHA-256 de un token para almacenamiento seguro.
 */
export function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
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
	await db.update(sesiones).set({ invalidatedAt: new Date() }).where(eq(sesiones.id, sessionId));
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
