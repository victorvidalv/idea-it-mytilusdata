import toast from 'svelte-french-toast';
import type { SubmitFunction } from '@sveltejs/kit';

/**
 * Maneja el resultado exitoso de una acción
 */
function handleSuccess(message: string | undefined, isLoading: { value: boolean }): void {
	toast.success(message || 'Operación exitosa');
	isLoading.value = false;
}

/**
 * Maneja el resultado fallido de una acción
 */
function handleFailure(message: string | undefined, isLoading: { value: boolean }): void {
	toast.error(message || 'Ocurrió un error');
	isLoading.value = false;
}

/**
 * Crea el manejador de acciones para formularios de biblioteca
 */
export function createBibliotecaAction(isLoading: { value: boolean }): SubmitFunction {
	return () => {
		isLoading.value = true;
		return async ({ result, update }) => {
			if (result.type === 'success') {
				const data = result.data as { message?: string; error?: string } | undefined;
				handleSuccess(data?.message || data?.error, isLoading);
				await update();
			} else if (result.type === 'failure') {
				const data = result.data as { message?: string; error?: string } | undefined;
				handleFailure(data?.message || data?.error, isLoading);
			} else {
				isLoading.value = false;
			}
		};
	};
}