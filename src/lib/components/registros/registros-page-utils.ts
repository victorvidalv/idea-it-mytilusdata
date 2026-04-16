/**
 * Utilidades para la página de registros.
 * Funciones auxiliares para formateo y manejo de acciones.
 */

import toast from 'svelte-french-toast';
import type { SubmitFunction } from '@sveltejs/kit';

/**
 * Formatea una fecha para visualización en formato local chileno.
 */
export function formatDateTime(dateInput: string | Date | null): string {
	if (!dateInput) return '—';
	const date = new Date(dateInput);
	return date.toLocaleString('es-CL', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	});
}

/**
 * Verifica si un resultado de acción es exitoso.
 */
function isSuccessResult(result: { type: string }): boolean {
	return result.type === 'success';
}

/**
 * Extrae el mensaje de un resultado de acción.
 */
function getResultMessage(result: { type: string; data?: { message?: string } }): string | undefined {
	return result.data?.message;
}

/**
 * Crea un manejador de acciones para formularios de registros.
 * Maneja toasts de éxito/error y callbacks de actualización.
 */
export function createRegistrosActionHandler(
	onSuccess: () => void
): SubmitFunction {
	return () => {
		return async ({ result, update }) => {
			const message = getResultMessage(result);
			
			if (isSuccessResult(result)) {
				toast.success(message || 'Operación exitosa');
				onSuccess();
				await update();
			} else {
				toast.error(message || 'Ocurrió un error');
			}
		};
	};
}