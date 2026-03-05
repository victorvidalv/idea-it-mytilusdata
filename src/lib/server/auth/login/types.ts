/**
 * Contexto compartido entre las funciones de login.
 * Contiene información de la solicitud necesaria para el procesamiento.
 */
export interface LoginContext {
	email: string;
	clientIp: string;
	userAgent: string | undefined;
	origin: string;
}

/**
 * Usuario existente encontrado en la base de datos.
 */
export interface ExistingUser {
	id: number;
	nombre: string;
}