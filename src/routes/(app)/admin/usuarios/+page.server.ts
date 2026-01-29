import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { usuarios } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { requireRole, ROLES, type Rol } from '$lib/server/auth';

/** Cargar lista de usuarios para el panel de administración */
export const load: PageServerLoad = async ({ locals }) => {
	requireRole(locals.user?.rol as Rol, ROLES.ADMIN);

	const allUsers = await db.select().from(usuarios);

	return {
		usuarios: allUsers.map((u) => ({
			id: u.id,
			nombre: u.nombre,
			email: u.email,
			rol: u.rol,
			activo: u.activo,
			createdAt: u.createdAt
		}))
	};
};

export const actions = {
	/** Cambiar el rol de un usuario */
	updateRole: async ({ request, locals }) => {
		requireRole(locals.user?.rol as Rol, ROLES.ADMIN);

		const data = await request.formData();
		const userId = Number(data.get('userId'));
		const newRole = data.get('rol') as string;

		// Validar rol
		if (!['USUARIO', 'INVESTIGADOR', 'ADMIN'].includes(newRole)) {
			return fail(400, { error: true, message: 'Rol inválido' });
		}

		// Impedir auto-degradación
		if (userId === locals.user?.userId) {
			return fail(400, { error: true, message: 'No puedes cambiar tu propio rol' });
		}

		await db
			.update(usuarios)
			.set({ rol: newRole as 'ADMIN' | 'INVESTIGADOR' | 'USUARIO' })
			.where(eq(usuarios.id, userId));

		return { success: true, message: `Rol actualizado a ${newRole}` };
	},

	/** Activar o desactivar un usuario */
	toggleActive: async ({ request, locals }) => {
		requireRole(locals.user?.rol as Rol, ROLES.ADMIN);

		const data = await request.formData();
		const userId = Number(data.get('userId'));
		const activo = data.get('activo') === 'true';

		// Impedir auto-desactivación
		if (userId === locals.user?.userId) {
			return fail(400, { error: true, message: 'No puedes desactivarte a ti mismo' });
		}

		await db.update(usuarios).set({ activo }).where(eq(usuarios.id, userId));

		return { success: true, message: activo ? 'Usuario activado' : 'Usuario desactivado' };
	}
} satisfies Actions;
