import { db } from '../../db';
import { usuarios } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { ROLES } from '../roles';
import type { MagicLinkResult } from './types';

/**
 * Obtener o crear un usuario por email.
 * Retorna el usuario o un resultado de error.
 */
export async function getOrCreateUser(
	email: string, 
	nombre: string
): Promise<{ user: typeof usuarios.$inferSelect } | MagicLinkResult> {
	const [existingUser] = await db
		.select()
		.from(usuarios)
		.where(eq(usuarios.email, email))
		.limit(1);

	if (existingUser) {
		return { user: existingUser };
	}

	// Crear nuevo usuario con rol inicial
	const [newUser] = await db
		.insert(usuarios)
		.values({ email, nombre, rol: ROLES.USUARIO, activo: true })
		.returning();

	if (!newUser) {
		return { success: false, error: 'No se pudo crear el usuario', status: 500 };
	}

	return { user: newUser };
}