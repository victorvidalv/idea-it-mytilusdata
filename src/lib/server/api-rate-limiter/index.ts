/**
 * API pública del módulo de rate limiting de API.
 */
// Tipos
export type { ApiRateLimitResult, RateLimitConfig } from './types';

// Configuración
export { API_RATE_LIMITS, type ApiRateLimitType } from './config';

// Función principal
export { checkApiRateLimit } from './core';

// Utilidades
export { logApiRateLimit, getApiRateLimitIdentifier, formatResetTime } from './utils';