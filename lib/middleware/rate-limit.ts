/**
 * Middleware de Rate Limiting para proteger APIs contra ataques de fuerza bruta
 */

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/utils/logger";
import { getClientIp } from "./auth";

// ============================================================================
// INTERFACES
// ============================================================================

/**
 * Configuración del rate limiter
 */
export interface RateLimitConfig {
    /** Ventana de tiempo en milisegundos (default: 15 minutos) */
    windowMs: number;
    /** Máximo de solicitudes por ventana (default: 100) */
    maxRequests: number;
    /** Si true, no cuenta respuestas exitosas (status 2xx) */
    skipSuccessfulRequests: boolean;
    /** Si true, no cuenta respuestas fallidas (status 4xx, 5xx) */
    skipFailedRequests: boolean;
    /** Función para generar la clave única (default: usa IP) */
    keyGenerator: (request: NextRequest) => string;
}

/**
 * Resultado de verificación de rate limit
 */
export interface RateLimitResult {
    /** Indica si la solicitud está permitida */
    success: boolean;
    /** Número máximo de solicitudes */
    limit: number;
    /** Solicitudes restantes */
    remaining: number;
    /** Timestamp de reset */
    reset: number;
    /** Segundos hasta reset (si excedido) */
    retryAfter?: number;
}

/**
 * Entrada en el store de rate limiting
 */
interface RateLimitEntry {
    /** Contador de solicitudes */
    count: number;
    /** Timestamp de inicio de la ventana */
    startTime: number;
}

// ============================================================================
// RATE LIMITER CLASS
// ============================================================================

/**
 * Implementación en memoria del rate limiter
 */
export class RateLimiter {
    private config: RateLimitConfig;
    private store: Map<string, RateLimitEntry>;

    constructor(config: Partial<RateLimitConfig> = {}) {
        this.config = {
            windowMs: 15 * 60 * 1000, // 15 minutos
            maxRequests: 100,
            skipSuccessfulRequests: false,
            skipFailedRequests: false,
            keyGenerator: getClientIp,
            ...config,
        };
        this.store = new Map();
    }

    /**
     * Verifica si la solicitud está permitida
     * @param request - Request de Next.js
     * @returns RateLimitResult con el resultado de la verificación
     */
    public check(request: NextRequest): RateLimitResult {
        // Generar clave usando keyGenerator
        const key = this.config.keyGenerator(request);

        // Obtener o crear entrada en el store
        const now = Date.now();
        let entry = this.store.get(key);

        // Verificar si está dentro de la ventana de tiempo
        if (!entry || now - entry.startTime >= this.config.windowMs) {
            // Crear nueva entrada
            entry = {
                count: 0,
                startTime: now,
            };
            this.store.set(key, entry);
        }

        // Incrementar contador
        entry.count++;

        // Calcular resultado
        const remaining = Math.max(0, this.config.maxRequests - entry.count);
        const success = entry.count <= this.config.maxRequests;
        const reset = entry.startTime + this.config.windowMs;
        const retryAfter = success ? undefined : Math.ceil((reset - now) / 1000);

        return {
            success,
            limit: this.config.maxRequests,
            remaining,
            reset,
            retryAfter,
        };
    }

    /**
     * Resetea el contador para una clave específica
     * @param key - Clave a resetear
     */
    public reset(key: string): void {
        this.store.delete(key);
    }

    /**
     * Limpia entradas expiradas del store
     */
    public cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        for (const [key, entry] of this.store.entries()) {
            if (now - entry.startTime >= this.config.windowMs) {
                keysToDelete.push(key);
            }
        }

        for (const key of keysToDelete) {
            this.store.delete(key);
        }

        if (keysToDelete.length > 0) {
            logger.debug(`Rate limiter cleanup: removed ${keysToDelete.length} expired entries`);
        }
    }

    /**
     * Obtiene el tamaño actual del store
     */
    public getStoreSize(): number {
        return this.store.size;
    }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Factory para crear instancias de RateLimiter
 * @param config - Configuración del rate limiter
 * @returns Nueva instancia de RateLimiter
 */
export function createRateLimiter(config?: Partial<RateLimitConfig>): RateLimiter {
    return new RateLimiter(config);
}

// ============================================================================
// HOC FOR API HANDLERS
// ============================================================================

/**
 * HOC para envolver handlers de API con rate limiting
 * @param handler - Handler de API a envolver
 * @param config - Configuración del rate limiter
 * @returns Handler con rate limiting aplicado
 */
export function withRateLimit<T extends (...args: unknown[]) => Promise<NextResponse>>(
    handler: T,
    config: Partial<RateLimitConfig>
): T {
    const rateLimiter = createRateLimiter(config);

    return (async (...args: unknown[]): Promise<NextResponse> => {
        // Obtener el request (primer argumento)
        const request = args[0] as NextRequest;

        // Saltar rate limiting en ambiente de test
        if (process.env.NODE_ENV === "test" || process.env.E2E_TEST === "true") {
            return await handler(...args);
        }

        // Verificar rate limit
        const result = rateLimiter.check(request);

        // Generar headers de rate limit
        const headers = getRateLimitHeaders(result);

        if (!result.success) {
            // Log del bloqueo
            const ip = getClientIp(request);
            const url = request.nextUrl.pathname;

            logger.warn(`Rate limit exceeded`, {
                ip,
                url,
                limit: result.limit,
                retryAfter: result.retryAfter,
            });

            // Retornar 429 con headers de rate limit
            const headersObject: Record<string, string> = {};
            headers.forEach((value, key) => {
                headersObject[key] = value;
            });

            return NextResponse.json(
                {
                    success: false,
                    message: "Demasiadas solicitudes. Por favor, inténtelo de nuevo más tarde.",
                },
                {
                    status: 429,
                    headers: headersObject,
                }
            );
        }

        // Ejecutar el handler original
        const response = await handler(...args);

        // Aplicar configuración de skip
        const status = response.status;
        const shouldSkip =
            (rateLimiter["config"].skipSuccessfulRequests && status >= 200 && status < 300) ||
            (rateLimiter["config"].skipFailedRequests && status >= 400);

        if (shouldSkip) {
            // Si se debe saltar, decrementar el contador
            const key = rateLimiter["config"].keyGenerator(request);
            const entry = rateLimiter["store"].get(key);
            if (entry && entry.count > 0) {
                entry.count--;
            }
        }

        // Agregar headers de rate limit a la respuesta
        headers.forEach((value, key) => {
            response.headers.set(key, value);
        });

        return response;
    }) as T;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generar headers de rate limit para la respuesta
 * @param result - Resultado de verificación de rate limit
 * @returns Map con los headers de rate limit
 */
export function getRateLimitHeaders(result: RateLimitResult): Map<string, string> {
    const headers = new Map<string, string>();

    headers.set("X-RateLimit-Limit", result.limit.toString());
    headers.set("X-RateLimit-Remaining", result.remaining.toString());
    headers.set("X-RateLimit-Reset", result.reset.toString());

    if (result.retryAfter) {
        headers.set("Retry-After", result.retryAfter.toString());
    }

    return headers;
}

// ============================================================================
// PRE-CONFIGURED RATE LIMITERS
// ============================================================================

/**
 * Rate limiter para autenticación (login/registro)
 * 5 solicitudes por 15 minutos
 */
export const authRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
});

/**
 * Rate limiter para APIs generales
 * 100 solicitudes por 15 minutos
 */
export const apiRateLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
});

/**
 * Rate limiter estricto para endpoints sensibles
 * 10 solicitudes por minuto
 */
export const strictRateLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 10,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
});

// ============================================================================
// CLEANUP INTERVAL
// ============================================================================

/**
 * Intervalo de limpieza automática (cada 5 minutos)
 */
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * Inicia la limpieza automática de entradas expiradas
 * @param rateLimiter - RateLimiter a limpiar
 * @returns Función para detener la limpieza
 */
export function startCleanup(rateLimiter: RateLimiter): () => void {
    const intervalId = setInterval(() => {
        rateLimiter.cleanup();
    }, CLEANUP_INTERVAL);

    return () => {
        clearInterval(intervalId);
    };
}

// Iniciar limpieza automática para los rate limiters pre-configurados
const stopAuthCleanup = startCleanup(authRateLimiter);
const stopApiCleanup = startCleanup(apiRateLimiter);
const stopStrictCleanup = startCleanup(strictRateLimiter);

// Exportar funciones para detener la limpieza (útil para testing)
export const cleanupFunctions = {
    auth: stopAuthCleanup,
    api: stopApiCleanup,
    strict: stopStrictCleanup,
};
