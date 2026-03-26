/** Tiempo de expiración del Magic Link en milisegundos (15 minutos) */
export const MAGIC_LINK_EXPIRATION_MS = 15 * 60 * 1000;

/** Resultado de createMagicLink con validaciones defensivas */
export type MagicLinkResult = 
	| { success: true } 
	| { success: false; error: string; status: number };