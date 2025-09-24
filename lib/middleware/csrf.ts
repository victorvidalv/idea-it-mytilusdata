/**
 * Middleware de protección CSRF (Cross-Site Request Forgery)
 * Protege las APIs contra ataques de falsificación de solicitudes entre sitios
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';
import type { ApiResponse } from '@/lib/types/api.types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Opciones de cookie para el token CSRF
 */
export interface CSRFTokenCookieOptions {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
    maxAge?: number;
}

/**
 * Configuración del middleware CSRF
 */
export interface CSRFConfig {
    /**
     * Clave secreta para firmar tokens
     * Default: process.env.CSRF_SECRET
     */
    secret?: string;

    /**
     * Nombre de la cookie que contiene el token CSRF
     * Default: 'csrf-token'
     */
    cookieName?: string;

    /**
     * Nombre del header que debe contener el token CSRF
     * Default: 'x-csrf-token'
     */
    headerName?: string;

    /**
     * Longitud del token CSRF en bytes
     * Default: 32
     */
    tokenLength?: number;

    /**
     * Opciones de la cookie
     */
    cookieOptions?: Partial<CSRFTokenCookieOptions>;
}

/**
 * Métodos HTTP seguros que no requieren verificación CSRF
 */
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'] as const;

/**
 * Métodos HTTP no seguros que requieren verificación CSRF
 */
const UNSAFE_METHODS = ['POST', 'PUT', 'DELETE', 'PATCH'] as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
const DEFAULT_COOKIE_NAME = 'csrf-token';
const DEFAULT_HEADER_NAME = 'x-csrf-token';
const DEFAULT_TOKEN_LENGTH = 32;

const DEFAULT_COOKIE_OPTIONS: CSRFTokenCookieOptions = {
    httpOnly: false, // IMPORTANTE: false para que JS pueda leer la cookie y enviarla como header
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 horas
};

// ============================================================================
// TOKEN GENERATION AND VERIFICATION
// ============================================================================

/**
 * Genera un token CSRF aleatorio
 * @param length - Longitud del token en bytes (default: 32)
 * @returns Token CSRF como string hexadecimal
 */
export function generateCSRFToken(length: number = DEFAULT_TOKEN_LENGTH): string {
    const array = new Uint8Array(length);

    // Usar crypto.randomBytes si está disponible (Node.js)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        crypto.getRandomValues(array);
    } else {
        // Fallback para navegadores antiguos
        for (let i = 0; i < length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
    }

    // Convertir a string hexadecimal
    return Array.from(array)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Verifica si un token CSRF es válido
 * @param token - Token a verificar
 * @param secret - Secreto usado para generar el token
 * @returns true si el token es válido, false en caso contrario
 */
export function verifyCSRFToken(token: string, secret: string): boolean {
    // Verificar que el token exista y tenga longitud válida
    if (!token || typeof token !== 'string') {
        return false;
    }

    // Verificar que el token tenga formato hexadecimal válido
    const hexRegex = /^[0-9a-f]+$/i;
    if (!hexRegex.test(token)) {
        return false;
    }

    // Verificar longitud mínima (al menos 16 caracteres = 8 bytes)
    if (token.length < 16) {
        return false;
    }

    // Verificar que el secret sea válido
    if (!secret || typeof secret !== 'string') {
        return false;
    }

    // En una implementación más robusta, podríamos verificar
    // que el token fue firmado con el secret
    // Por ahora, verificamos que el token tenga el formato correcto

    return true;
}

// ============================================================================
// TOKEN EXTRACTION
// ============================================================================

/**
 * Obtiene el token CSRF desde la cookie de la solicitud
 * @param request - Request de Next.js
 * @param cookieName - Nombre de la cookie (default: 'csrf-token')
 * @returns Token CSRF o null si no existe
 */
export function getCSRFTokenFromCookie(
    request: NextRequest,
    cookieName: string = DEFAULT_COOKIE_NAME
): string | null {
    try {
        // En Next.js NextRequest, podemos usar request.cookies.get()
        return request.cookies.get(cookieName)?.value || null;
    } catch (error) {
        // Fallback al parseo manual si request.cookies falla
        const cookieHeader = request.headers.get('cookie');

        if (!cookieHeader) {
            return null;
        }

        const cookies = cookieHeader.split(';').reduce<Record<string, string>>((acc, cookie) => {
            const parts = cookie.trim().split('=');
            if (parts.length >= 2) {
                const name = parts[0];
                const value = parts.slice(1).join('=');
                acc[name] = value;
            }
            return acc;
        }, {});

        return cookies[cookieName] || null;
    }
}

/**
 * Obtiene el token CSRF desde el header de la solicitud
 * @param request - Request de Next.js
 * @param headerName - Nombre del header (default: 'x-csrf-token')
 * @returns Token CSRF o null si no existe
 */
export function getCSRFTokenFromHeader(
    request: NextRequest,
    headerName: string = DEFAULT_HEADER_NAME
): string | null {
    return request.headers.get(headerName);
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Crea un middleware de protección CSRF
 * @param config - Configuración del middleware
 * @returns Función middleware de Next.js
 */
export function createCSRFMiddleware(config?: CSRFConfig) {
    const finalConfig: Required<CSRFConfig> & { cookieOptions: CSRFTokenCookieOptions } = {
        secret: config?.secret || DEFAULT_CSRF_SECRET,
        cookieName: config?.cookieName || DEFAULT_COOKIE_NAME,
        headerName: config?.headerName || DEFAULT_HEADER_NAME,
        tokenLength: config?.tokenLength || DEFAULT_TOKEN_LENGTH,
        cookieOptions: {
            ...DEFAULT_COOKIE_OPTIONS,
            ...config?.cookieOptions,
        },
    };

    return async function csrfMiddleware(
        request: NextRequest
    ): Promise<NextResponse> {
        const method = request.method;
        const isSafeMethod = SAFE_METHODS.includes(method as any);

        // Para métodos seguros (GET, HEAD, OPTIONS): generar y enviar token
        if (isSafeMethod) {
            const token = generateCSRFToken(finalConfig.tokenLength);

            const response = NextResponse.next();

            // Establecer cookie con el token
            response.cookies.set(finalConfig.cookieName, token, {
                httpOnly: finalConfig.cookieOptions.httpOnly,
                secure: finalConfig.cookieOptions.secure,
                sameSite: finalConfig.cookieOptions.sameSite,
                path: finalConfig.cookieOptions.path,
                maxAge: finalConfig.cookieOptions.maxAge,
            });

            logger.debug('CSRF token generated', {
                method,
                cookieName: finalConfig.cookieName,
            });

            return response as NextResponse;
        }

        // Para métodos no seguros (POST, PUT, DELETE, PATCH): verificar token
        const isUnsafeMethod = UNSAFE_METHODS.includes(method as any);

        if (isUnsafeMethod) {
            // Obtener token de cookie
            const cookieToken = getCSRFTokenFromCookie(request, finalConfig.cookieName);

            // Obtener token de header
            const headerToken = getCSRFTokenFromHeader(request, finalConfig.headerName);

            // Verificar que ambos tokens existan
            if (!cookieToken) {
                logger.warn('CSRF token missing from cookie', {
                    method,
                    path: request.nextUrl.pathname,
                    cookieName: finalConfig.cookieName,
                });

                return NextResponse.json<ApiResponse>(
                    {
                        success: false,
                        error: {
                            code: 'CSRF_TOKEN_MISSING',
                            message: 'CSRF token missing from cookie',
                        },
                    },
                    { status: 403 }
                );
            }

            if (!headerToken) {
                logger.warn('CSRF token missing from header', {
                    method,
                    path: request.nextUrl.pathname,
                    headerName: finalConfig.headerName,
                });

                return NextResponse.json<ApiResponse>(
                    {
                        success: false,
                        error: {
                            code: 'CSRF_TOKEN_MISSING',
                            message: `CSRF token missing from header: ${finalConfig.headerName}`,
                        },
                    },
                    { status: 403 }
                );
            }

            // Verificar que los tokens coincidan
            if (cookieToken !== headerToken) {
                logger.warn('CSRF token mismatch', {
                    method,
                    path: request.nextUrl.pathname,
                });

                return NextResponse.json<ApiResponse>(
                    {
                        success: false,
                        error: {
                            code: 'CSRF_TOKEN_MISMATCH',
                            message: 'CSRF token mismatch',
                        },
                    },
                    { status: 403 }
                );
            }

            // Verificar que el token sea válido
            if (!verifyCSRFToken(headerToken, finalConfig.secret)) {
                logger.warn('CSRF token invalid', {
                    method,
                    path: request.nextUrl.pathname,
                });

                return NextResponse.json<ApiResponse>(
                    {
                        success: false,
                        error: {
                            code: 'CSRF_TOKEN_INVALID',
                            message: 'CSRF token invalid',
                        },
                    },
                    { status: 403 }
                );
            }

            logger.debug('CSRF token verified', {
                method,
                path: request.nextUrl.pathname,
            });

            return NextResponse.next() as NextResponse;
        }

        // Otros métodos no soportados
        return NextResponse.next() as NextResponse;
    };
}

// ============================================================================
// HOC (Higher-Order Component) FOR API HANDLERS
// ============================================================================

/**
 * HOC para envolver handlers de API con protección CSRF
 * @param handler - Handler de API a proteger
 * @param config - Configuración del middleware CSRF
 * @returns Handler de API con protección CSRF
 */
export function withCSRFProtection(
    handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>,
    config?: CSRFConfig
) {
    const finalConfig: Required<CSRFConfig> & { cookieOptions: CSRFTokenCookieOptions } = {
        secret: config?.secret || DEFAULT_CSRF_SECRET,
        cookieName: config?.cookieName || DEFAULT_COOKIE_NAME,
        headerName: config?.headerName || DEFAULT_HEADER_NAME,
        tokenLength: config?.tokenLength || DEFAULT_TOKEN_LENGTH,
        cookieOptions: {
            ...DEFAULT_COOKIE_OPTIONS,
            ...config?.cookieOptions,
        },
    };

    return async function protectedHandler(
        request: NextRequest,
        ...args: unknown[]
    ): Promise<NextResponse> {
        const method = request.method;
        const isSafeMethod = SAFE_METHODS.includes(method as any);
        const isUnsafeMethod = UNSAFE_METHODS.includes(method as any);

        // Para métodos seguros: generar token y agregar a respuesta
        if (isSafeMethod) {
            const token = generateCSRFToken(finalConfig.tokenLength);

            const response = await handler(request, ...args as []);

            // Establecer cookie con el token
            response.cookies.set(finalConfig.cookieName, token, {
                httpOnly: finalConfig.cookieOptions.httpOnly,
                secure: finalConfig.cookieOptions.secure,
                sameSite: finalConfig.cookieOptions.sameSite,
                path: finalConfig.cookieOptions.path,
                maxAge: finalConfig.cookieOptions.maxAge,
            });

            logger.debug('CSRF token added to response', {
                method,
                path: request.nextUrl.pathname,
            });

            return response;
        }

        // Para métodos no seguros: verificar token
        if (isUnsafeMethod) {
            // Obtener token de cookie
            const cookieToken = getCSRFTokenFromCookie(request, finalConfig.cookieName);

            // Obtener token de header
            const headerToken = getCSRFTokenFromHeader(request, finalConfig.headerName);

            // Verificar que ambos tokens existan
            if (!cookieToken) {
                logger.warn('CSRF token missing from cookie', {
                    method,
                    path: request.nextUrl.pathname,
                    cookieName: finalConfig.cookieName,
                });

                return NextResponse.json<ApiResponse>(
                    {
                        success: false,
                        error: {
                            code: 'CSRF_TOKEN_MISSING',
                            message: 'CSRF token missing from cookie',
                        },
                    },
                    { status: 403 }
                );
            }

            if (!headerToken) {
                logger.warn('CSRF token missing from header', {
                    method,
                    path: request.nextUrl.pathname,
                    headerName: finalConfig.headerName,
                });

                return NextResponse.json<ApiResponse>(
                    {
                        success: false,
                        error: {
                            code: 'CSRF_TOKEN_MISSING',
                            message: `CSRF token missing from header: ${finalConfig.headerName}`,
                        },
                    },
                    { status: 403 }
                );
            }

            // Verificar que los tokens coincidan
            if (cookieToken !== headerToken) {
                logger.warn('CSRF token mismatch', {
                    method,
                    path: request.nextUrl.pathname,
                });

                return NextResponse.json<ApiResponse>(
                    {
                        success: false,
                        error: {
                            code: 'CSRF_TOKEN_MISMATCH',
                            message: 'CSRF token mismatch',
                        },
                    },
                    { status: 403 }
                );
            }

            // Verificar que el token sea válido
            if (!verifyCSRFToken(headerToken, finalConfig.secret)) {
                logger.warn('CSRF token invalid', {
                    method,
                    path: request.nextUrl.pathname,
                });

                return NextResponse.json<ApiResponse>(
                    {
                        success: false,
                        error: {
                            code: 'CSRF_TOKEN_INVALID',
                            message: 'CSRF token invalid',
                        },
                    },
                    { status: 403 }
                );
            }

            logger.debug('CSRF token verified', {
                method,
                path: request.nextUrl.pathname,
            });
        }

        // Ejecutar el handler original
        return handler(request, ...args as []);
    };
}
