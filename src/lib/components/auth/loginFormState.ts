/**
 * Funciones auxiliares para determinar el estado del formulario de login.
 * Cada función encapsula la lógica de evaluación de condiciones del formulario.
 */

export type LoginFormState = {
	success?: boolean;
	requiresRegistration?: boolean;
	rateLimited?: boolean;
	cooldownActive?: boolean;
	message?: string;
	remainingSeconds?: number;
	email?: string;
	nombre?: string;
	captchaError?: boolean;
	error?: boolean;
	missing?: boolean;
} | null;

/**
 * Determina si el formulario está en estado de éxito (enlace enviado).
 */
export function isSuccess(form: LoginFormState): boolean {
	return form?.success ?? false;
}

/**
 * Determina si el formulario requiere registro de nuevo usuario.
 */
export function requiresRegistration(form: LoginFormState): boolean {
	return form?.requiresRegistration ?? false;
}

/**
 * Determina si el formulario está en estado de rate limiting.
 * Incluye tanto rate limiting activo como cooldown.
 */
export function isRateLimited(form: LoginFormState): boolean {
	return (form?.rateLimited ?? false) || (form?.cooldownActive ?? false);
}

/**
 * Determina si el formulario tiene algún tipo de error.
 * Incluye errores generales, campos faltantes, rate limiting y errores de captcha.
 */
export function hasFormError(form: LoginFormState): boolean {
	if (!form) return false;
	return !!(form.error || form.missing || isRateLimited(form) || form.captchaError);
}