import type { PageServerLoad } from './$types';
import { getBibliotecaRecords, canManageBiblioteca } from '$lib/server/biblioteca';
import { getUserRol } from './auth-helpers';

export const load: PageServerLoad = async ({ locals }) => {
	const userRol = getUserRol(locals);

	if (!canManageBiblioteca(userRol)) {
		return { authorized: false, records: [] };
	}

	const records = await getBibliotecaRecords();

	return { authorized: true, records };
};