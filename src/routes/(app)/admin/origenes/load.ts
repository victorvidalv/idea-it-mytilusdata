import type { PageServerLoad } from './$types';
import { canManageOrigenes, getOrigenesWithSeed } from '$lib/server/origenes';
import { getUserRol } from './auth-helpers';

export const load: PageServerLoad = async ({ locals }) => {
	const userRol = getUserRol(locals);

	if (!canManageOrigenes(userRol)) {
		return { authorized: false, origenes: [] };
	}

	const origenes = await getOrigenesWithSeed();

	return { authorized: true, origenes };
};