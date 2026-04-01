import { fail } from '@sveltejs/kit';

/**
 * Resultado de la validación de datos de registro.
 */
export type RegistrationValidationResult =
	| { valid: true }
	| { valid: false; requiresRegistration: true; email: string }
	| { valid: false; error: ReturnType<typeof fail> };

/**
 * Validar que el nombre tenga longitud mínima.
 */
function validateNombre(nombre: FormDataEntryValue | null, email: string): RegistrationValidationResult {
	if (!nombre) {
		return { valid: false, requiresRegistration: true, email };
	}

	if (typeof nombre !== 'string' || nombre.length < 2) {
		return {
			valid: false,
			error: fail(400, {
				email,
				nombre,
				requiresRegistration: true,
				missing: true,
				message: 'Nombre es requerido'
			})
		};
	}

	return { valid: true };
}

/**
 * Validar que los términos hayan sido aceptados.
 */
function validateTerms(
	terms: FormDataEntryValue | null,
	nombre: string,
	email: string
): RegistrationValidationResult {
	if (terms !== 'on' && terms !== 'true') {
		return {
			valid: false,
			error: fail(400, {
				email,
				nombre,
				requiresRegistration: true,
				missing: true,
				message: 'Debes aceptar las condiciones del servicio'
			})
		};
	}

	return { valid: true };
}

/**
 * Validar los datos de registro de un nuevo usuario.
 * Verifica nombre y aceptación de términos.
 */
export function validateRegistrationData(
	nombre: FormDataEntryValue | null,
	terms: FormDataEntryValue | null,
	email: string
): RegistrationValidationResult {
	const nombreResult = validateNombre(nombre, email);
	if (!nombreResult.valid) {
		return nombreResult;
	}

	const nombreStr = nombre as string;
	return validateTerms(terms, nombreStr, email);
}