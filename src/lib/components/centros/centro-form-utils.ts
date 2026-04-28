/**
 * Utilidades para el manejo de formularios de centros
 */

export interface FormResult {
	type: string;
	data?: { message?: string };
}

export interface FormCallbacks {
	onSuccess: (msg: string) => void;
	onError: (msg: string) => void;
}

/**
 * Procesa el resultado de una acción de formulario de centro
 * y ejecuta el callback correspondiente
 */
export function processFormResult(result: FormResult, callbacks: FormCallbacks): void {
	if (result.type === 'success') {
		// @ts-expect-error - message comes from action result
		callbacks.onSuccess(result.data?.message || 'Centro actualizado');
	} else if (result.type === 'failure') {
		// @ts-expect-error - message comes from action result
		callbacks.onError(result.data?.message || 'Error al actualizar');
	}
}