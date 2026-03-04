// --- Configuración de Rate Limiting ---

/** Límite de intentos por IP en ventana de tiempo */
export const IP_RATE_LIMIT = {
	maxAttempts: 5,
	windowMs: 15 * 60 * 1000 // 15 minutos
} as const;

/** Límite de intentos por email en ventana de tiempo */
export const EMAIL_RATE_LIMIT = {
	maxAttempts: 3,
	windowMs: 60 * 60 * 1000 // 1 hora
} as const;

/** Cooldown entre envíos de email al mismo correo */
export const EMAIL_COOLDOWN_MS = 60 * 1000; // 60 segundos

/** Tiempo de retención de logs antiguos antes de limpieza */
export const CLEANUP_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 horas

// --- Tipos ---

export type RateLimitType = 'IP' | 'EMAIL';

export interface RateLimitResult {
	allowed: boolean;
	remainingAttempts: number;
	resetIn?: number; // milisegundos hasta que se reinicie el límite
	message?: string;
}

export interface CooldownResult {
	allowed: boolean;
	remainingSeconds: number;
	message?: string;
}