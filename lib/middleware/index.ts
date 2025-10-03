/**
 * Middleware exports
 * Exporta todos los middlewares de la aplicación
 */

// ============================================================================
// AUTH MIDDLEWARE
// ============================================================================

export {
    verifyAuth,
    isAuthError,
    getClientIp,
    type AuthenticatedUser,
} from './auth';

export { withRole } from './role';

// ============================================================================
// RATE LIMIT MIDDLEWARE
// ============================================================================

export {
    RateLimiter,
    createRateLimiter,
    withRateLimit,
    getRateLimitHeaders,
    startCleanup,
    authRateLimiter,
    apiRateLimiter,
    strictRateLimiter,
    cleanupFunctions,
    type RateLimitConfig,
    type RateLimitResult,
} from './rate-limit';

// ============================================================================
// CSRF MIDDLEWARE
// ============================================================================

export type {
    CSRFConfig,
    CSRFTokenCookieOptions,
} from './csrf';

export {
    generateCSRFToken,
    verifyCSRFToken,
    getCSRFTokenFromCookie,
    getCSRFTokenFromHeader,
    createCSRFMiddleware,
    withCSRFProtection,
} from './csrf';
