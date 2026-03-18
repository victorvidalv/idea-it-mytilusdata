/**
 * Servicio de consultas para la biblioteca de parámetros sigmoidales.
 */

import { db } from '$lib/server/db';
import { biblioteca } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import type { Rol } from '$lib/server/auth';
import { hasMinRole, ROLES } from '$lib/server/auth/roles';

/**
 * Tipo para un registro de biblioteca con sus campos.
 */
export type BibliotecaRecord = {
	id: number;
	codigoReferencia: string;
	cicloId: number;
	puntosJson: Record<string, number>;
	parametrosCalculados: {
		L: number;
		k: number;
		x0: number;
		r2: number;
	};
	formulaTipo: string;
	metadatos: { origen?: string; [key: string]: unknown } | null;
	userId: number;
	createdAt: Date;
	updatedAt: Date;
};

/**
 * Verifica si el usuario puede gestionar la biblioteca (solo ADMIN).
 */
export function canManageBiblioteca(userRol: Rol | undefined): boolean {
	return hasMinRole(userRol, ROLES.ADMIN);
}

/**
 * Obtiene todos los registros de la biblioteca.
 */
export async function getBibliotecaRecords(): Promise<BibliotecaRecord[]> {
	const records = await db
		.select()
		.from(biblioteca)
		.orderBy(desc(biblioteca.createdAt));

	return records as BibliotecaRecord[];
}

/**
 * Obtiene un registro por su ID.
 */
export async function getBibliotecaRecordById(id: number): Promise<BibliotecaRecord | undefined> {
	const [record] = await db
		.select()
		.from(biblioteca)
		.where(eq(biblioteca.id, id))
		.limit(1);

	return record as BibliotecaRecord | undefined;
}

/**
 * Elimina un registro de la biblioteca.
 */
export async function deleteBibliotecaRecord(id: number): Promise<boolean> {
	const result = await db
		.delete(biblioteca)
		.where(eq(biblioteca.id, id))
		.returning({ id: biblioteca.id });

	return result.length > 0;
}

/**
 * Elimina todos los registros de la biblioteca.
 */
export async function deleteAllBibliotecaRecords(): Promise<number> {
	const result = await db
		.delete(biblioteca)
		.returning({ id: biblioteca.id });

	return result.length;
}