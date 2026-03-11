/**
 * Funciones auxiliares internas para el módulo de rate limiting de API.
 */
import { db } from '../db';
import { rateLimitLogs } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';

/**
 * Calcula el inicio de la ventana de tiempo.
 * @param windowMs - Duración de la ventana en milisegundos
 * @returns Fecha de inicio de la ventana
 */
export function getWindowStart(windowMs: number): Date {
	return new Date(Date.now() - windowMs);
}

/**
 * Cuenta los intentos en la ventana de tiempo.
 * @param identifier - El identificador a verificar
 * @param windowStart - Fecha de inicio de la ventana
 * @returns Lista de intentos dentro de la ventana
 */
export async function countAttemptsInWindow(
	identifier: string,
	windowStart: Date
): Promise<typeof rateLimitLogs.$inferSelect[]> {
	return db
		.select()
		.from(rateLimitLogs)
		.where(
			and(
				eq(rateLimitLogs.identifier, identifier),
				eq(rateLimitLogs.tipo, 'IP'),
				gt(rateLimitLogs.createdAt, windowStart)
			)
		);
}