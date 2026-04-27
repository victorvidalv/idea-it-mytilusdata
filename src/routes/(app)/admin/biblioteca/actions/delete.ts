import type { Action } from '@sveltejs/kit';
import { requireAdmin } from '../auth-helpers';
import { deleteBibliotecaRecord } from '$lib/server/biblioteca';

export const deleteAction: Action = async (event) => {
	const authError = requireAdmin(event);
	if (authError) return authError;

	const formData = await event.request.formData();
	const idStr = formData.get('id');

	if (!idStr || typeof idStr !== 'string') {
		return { success: false, error: 'ID de registro no proporcionado' };
	}

	const id = parseInt(idStr, 10);
	if (isNaN(id)) {
		return { success: false, error: 'ID de registro inválido' };
	}

	try {
		await deleteBibliotecaRecord(id);
		return { success: true, message: 'Registro eliminado correctamente' };
	} catch (error) {
		console.error('Error al eliminar registro:', error);
		return { 
			success: false, 
			error: error instanceof Error ? error.message : 'Error al eliminar registro' 
		};
	}
};