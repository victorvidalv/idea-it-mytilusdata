/**
 * Utilidades compartidas de la aplicación
 */

// ============================================================================
// LOGGER
// ============================================================================

export { Logger, logger, createLogger } from './logger';
export type { LogLevel, LoggerContext, LogEntry, LoggerConfig } from './logger';

// ============================================================================
// ERROR HANDLING
// ============================================================================

export { ApiError, handleApiError, withErrorHandler, isApiError, isZodError } from './errors';

// ============================================================================
// CSRF HELPERS
// ============================================================================

export {
    getCSRFToken,
    hasCSRFToken,
    setCSRFTokenHeader,
    createCSRFHeaders,
    fetchWithCSRF,
    fetchWithCSRFGet,
    fetchWithCSRFPost,
    fetchWithCSRFPut,
    fetchWithCSRFDelete,
    fetchWithCSRFPatch,
    useCSRF,
    CSRF_COOKIE_NAME,
    CSRF_HEADER_NAME,
} from '../middleware/csrf-helpers';

export type { FetchWithCSRFOptions } from '../middleware/csrf-helpers';

// ============================================================================
// OTRAS UTILIDADES
// ============================================================================

// Re-exportar utilidades del archivo principal utils.ts
export { cn } from '../utils';
