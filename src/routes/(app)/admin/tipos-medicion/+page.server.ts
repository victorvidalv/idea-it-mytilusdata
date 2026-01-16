import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { tiposRegistro } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';

/** Cargar tipos de medición, asegurando que existen los básicos si la tabla está vacía */
export const load: PageServerLoad = async ({ locals }) => {
	const userRol = locals.user?.rol as Rol;
	// Solo admins pueden configurar tipos de medición
	if (!hasMinRole(userRol, ROLES.ADMIN)) {
		return { authorized: false, tipos: [] };
	}

	let tipos = await db.select().from(tiposRegistro).all();

	// Semillas iniciales si la tabla está vacía
	if (tipos.length === 0) {
		await db.insert(tiposRegistro).values([
			{ codigo: 'TALLA_LONGITUD', unidadBase: 'mm' },
			{ codigo: 'PESO_VIVO', unidadBase: 'g' },
			{ codigo: 'TEMPERATURA_AGUA', unidadBase: 'C' },
			{ codigo: 'SALINIDAD', unidadBase: 'psu' },
			{ codigo: 'OXIGENO_DISUELTO', unidadBase: 'mg/L' },
			{ codigo: 'CLOROFILA_A', unidadBase: 'ug/L' }
		]);
		tipos = await db.select().from(tiposRegistro).all();
	}

	return {
		authorized: true,
		tipos
	};
};

export const actions = {
	/** Crear un nuevo tipo de medición */
	create: async ({ request, locals }) => {
		const userRol = locals.user?.rol as Rol;
		if (!hasMinRole(userRol, ROLES.ADMIN))
			return fail(403, { error: true, message: 'No tiene permisos' });

		const data = await request.formData();
		const codigo = (data.get('codigo') as string)?.toUpperCase().replace(/\s+/g, '_');
		const unidadBase = data.get('unidadBase') as string;

		if (!codigo || !unidadBase) {
			return fail(400, { error: true, message: 'Código y unidad son requeridos' });
		}

		try {
			await db.insert(tiposRegistro).values({
				codigo,
				unidadBase
			});
			return { success: true, message: 'Tipo de medición creado exitosamente' };
		} catch (e) {
			if (e instanceof Error && e.message?.includes('UNIQUE')) {
				return fail(400, { error: true, message: 'El código ya existe' });
			}
			return fail(500, { error: true, message: 'Error interno al crear' });
		}
	},

	/** Editar un tipo de medición existente */
	update: async ({ request, locals }) => {
		const userRol = locals.user?.rol as Rol;
		if (!hasMinRole(userRol, ROLES.ADMIN))
			return fail(403, { error: true, message: 'No tiene permisos' });

		const data = await request.formData();
		const id = Number(data.get('id'));
		const codigo = (data.get('codigo') as string)?.toUpperCase().replace(/\s+/g, '_');
		const unidadBase = data.get('unidadBase') as string;

		if (!id || !codigo || !unidadBase) {
			return fail(400, { error: true, message: 'Todos los campos son requeridos' });
		}

		try {
			await db.update(tiposRegistro).set({ codigo, unidadBase }).where(eq(tiposRegistro.id, id));
			return { success: true, message: 'Tipo de medición actualizado' };
		} catch (e) {
			if (e instanceof Error && e.message?.includes('UNIQUE')) {
				return fail(400, { error: true, message: 'El código ya existe' });
			}
			return fail(500, { error: true, message: 'Error interno al actualizar' });
		}
	},

	/** Eliminar un tipo de medición */
	delete: async ({ request, locals }) => {
		const userRol = locals.user?.rol as Rol;
		if (!hasMinRole(userRol, ROLES.ADMIN))
			return fail(403, { error: true, message: 'No tiene permisos' });

		const data = await request.formData();
		const id = Number(data.get('id'));

		if (!id) return fail(400, { error: true, message: 'ID no proporcionado' });

		try {
			// Nota: Aquí estrictamente debríamos verificar si hay registros (mediciones) que usen este tipo
			// antes de eliminarlo. Si hay foreign key constraints habilitados en SQLite, fallará solo.
			await db.delete(tiposRegistro).where(eq(tiposRegistro.id, id));
			return { success: true, message: 'Tipo de medición eliminado' };
		} catch {
			return fail(400, { error: true, message: 'No se puede eliminar (probablemente en uso)' });
		}
	}
} satisfies Actions;
