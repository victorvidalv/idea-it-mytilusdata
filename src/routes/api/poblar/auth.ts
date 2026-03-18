/**
 * Validación de autenticación para el endpoint /api/poblar.
 * Verifica API Key y rol ADMIN.
 */

import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { usuarios, apiKeys } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth/roles';

/**
 * Resultado de validación exitosa con userId.
 */
export type AdminAuthSuccess = { userId: number };

/**
 * Resultado de validación fallida con Response de error.
 */
export type AdminAuthError = { error: Response };

/**
 * Valida API Key y verifica que el usuario tenga rol ADMIN.
 * 
 * @param authHeader - Header Authorization de la request
 * @returns userId si la validación es exitosa, o Response de error si falla
 */
export async function validarAdmin(authHeader: string | null): Promise<AdminAuthSuccess | AdminAuthError> {
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return { error: json({ error: 'Falta la API Key en el header Authorization' }, { status: 401 }) };
	}

	const key = authHeader.split(' ')[1];

	const [apiKeyRecord] = await db
		.select()
		.from(apiKeys)
		.where(eq(apiKeys.key, key))
		.limit(1);

	if (!apiKeyRecord) {
		return { error: json({ error: 'API Key inválida' }, { status: 401 }) };
	}

	const [user] = await db
		.select({ id: usuarios.id, rol: usuarios.rol })
		.from(usuarios)
		.where(eq(usuarios.id, apiKeyRecord.userId))
		.limit(1);

	if (!user) {
		return { error: json({ error: 'Usuario no encontrado' }, { status: 401 }) };
	}

	if (!hasMinRole(user.rol as Rol, ROLES.ADMIN)) {
		return { error: json({ error: 'Acceso denegado. Se requiere rol ADMIN' }, { status: 403 }) };
	}

	return { userId: user.id };
}