import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { origenDatos } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { hasMinRole, ROLES, type Rol } from '$lib/server/auth';

/** Cargar orígenes, asegurando que existen los básicos si la tabla está vacía */
export const load: PageServerLoad = async ({ locals }) => {
	const userRol = locals.user?.rol as Rol;
	// Solo admins pueden configurar orígenes de datos
	if (!hasMinRole(userRol, ROLES.ADMIN)) {
		return { authorized: false, origenes: [] };
	}

	let origenes = await db.select().from(origenDatos);

	// Semillas iniciales si la tabla está vacía
	if (origenes.length === 0) {
		await db
			.insert(origenDatos)
			.values([
				{ nombre: 'Manual / Terreno' },
				{ nombre: 'Laboratorio' },
				{ nombre: 'Satelital' },
				{ nombre: 'Sensor IoT' },
				{ nombre: 'PSMB' }
			]);
		origenes = await db.select().from(origenDatos);
	}

	return {
		authorized: true,
		origenes
	};
};

export const actions = {
	/** Crear un nuevo origen de datos */
	create: async ({ request, locals }) => {
		const userRol = locals.user?.rol as Rol;
		if (!hasMinRole(userRol, ROLES.ADMIN))
			return fail(403, { error: true, message: 'No tiene permisos' });

		const data = await request.formData();
		const nombre = data.get('nombre') as string;

		if (!nombre) {
			return fail(400, { error: true, message: 'El nombre es requerido' });
		}

		try {
			await db.insert(origenDatos).values({ nombre });
			return { success: true, message: 'Origen de datos creado exitosamente' };
		} catch {
			return fail(500, { error: true, message: 'Error interno al crear' });
		}
	},

	/** Editar un origen de datos existente */
	update: async ({ request, locals }) => {
		const userRol = locals.user?.rol as Rol;
		if (!hasMinRole(userRol, ROLES.ADMIN))
			return fail(403, { error: true, message: 'No tiene permisos' });

		const data = await request.formData();
		const id = Number(data.get('id'));
		const nombre = data.get('nombre') as string;

		if (!id || !nombre) {
			return fail(400, { error: true, message: 'ID y nombre son requeridos' });
		}

		try {
			await db.update(origenDatos).set({ nombre }).where(eq(origenDatos.id, id));
			return { success: true, message: 'Origen de datos actualizado' };
		} catch {
			return fail(500, { error: true, message: 'Error interno al actualizar' });
		}
	},

	/** Eliminar un origen de datos */
	delete: async ({ request, locals }) => {
		const userRol = locals.user?.rol as Rol;
		if (!hasMinRole(userRol, ROLES.ADMIN))
			return fail(403, { error: true, message: 'No tiene permisos' });

		const data = await request.formData();
		const id = Number(data.get('id'));

		if (!id) return fail(400, { error: true, message: 'ID no proporcionado' });

		try {
			await db.delete(origenDatos).where(eq(origenDatos.id, id));
			return { success: true, message: 'Origen de datos eliminado' };
		} catch {
			return fail(400, { error: true, message: 'No se puede eliminar (probablemente en uso)' });
		}
	}
} satisfies Actions;
