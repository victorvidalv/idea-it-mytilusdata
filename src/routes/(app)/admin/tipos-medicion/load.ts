import type { PageServerLoad } from './$types';
import { canViewTiposMedicion, ensureTiposRegistroSeeded } from '$lib/server/tipos-medicion';
import { getUserRol } from './auth-helpers';

export const load: PageServerLoad = async ({ locals }) => {
	const userRol = getUserRol(locals);

	if (!canViewTiposMedicion(userRol)) {
		return { authorized: false, tipos: [] };
	}

	const tipos = await ensureTiposRegistroSeeded();

	return {
		authorized: true,
		tipos
	};
};