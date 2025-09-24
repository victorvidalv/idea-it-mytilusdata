/**
 * Utilidades de CSRF para el frontend
 * Funciones de ayuda para manejar tokens CSRF en el navegador
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Nombre de la cookie CSRF (debe coincidir con el backend)
 */
const CSRF_COOKIE_NAME = 'csrf-token';

/**
 * Nombre del header CSRF (debe coincidir con el backend)
 */
const CSRF_HEADER_NAME = 'x-csrf-token';

// ============================================================================
// COOKIE UTILITIES
// ============================================================================

/**
 * Obtiene el valor de una cookie por su nombre
 * @param name - Nombre de la cookie
 * @returns Valor de la cookie o null si no existe
 */
function getCookie(name: string): string | null {
    if (typeof document === 'undefined') {
        return null;
    }

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        return cookieValue || null;
    }

    return null;
}

/**
 * Establece una cookie
 * @param name - Nombre de la cookie
 * @param value - Valor de la cookie
 * @param options - Opciones de la cookie
 */
function setCookie(
    name: string,
    value: string,
    options: {
        path?: string;
        maxAge?: number;
        secure?: boolean;
        sameSite?: 'strict' | 'lax' | 'none';
    } = {}
): void {
    if (typeof document === 'undefined') {
        return;
    }

    const {
        path = '/',
        maxAge = 60 * 60 * 24, // 24 horas
        secure = process.env.NODE_ENV === 'production',
        sameSite = 'strict',
    } = options;

    let cookieString = `${name}=${value}; path=${path}; max-age=${maxAge}`;

    if (secure) {
        cookieString += '; secure';
    }

    if (sameSite) {
        cookieString += `; samesite=${sameSite}`;
    }

    document.cookie = cookieString;
}

/**
 * Elimina una cookie
 * @param name - Nombre de la cookie
 * @param path - Path de la cookie (default: '/')
 */
function deleteCookie(name: string, path: string = '/'): void {
    if (typeof document === 'undefined') {
        return;
    }

    document.cookie = `${name}=; path=${path}; max-age=0`;
}

// ============================================================================
// CSRF TOKEN FUNCTIONS
// ============================================================================

/**
 * Obtiene el token CSRF desde la cookie del navegador
 * @returns Token CSRF o null si no existe
 */
export function getCSRFToken(): string | null {
    return getCookie(CSRF_COOKIE_NAME);
}

/**
 * Verifica si existe un token CSRF válido
 * @returns true si existe un token CSRF, false en caso contrario
 */
export function hasCSRFToken(): boolean {
    const token = getCSRFToken();
    return token !== null && token.length > 0;
}

/**
 * Agrega el token CSRF a los headers de una solicitud fetch
 * @param headers - Objeto de headers (HeadersInit)
 * @returns Headers con el token CSRF agregado
 */
export function setCSRFTokenHeader(headers: HeadersInit = {}): HeadersInit {
    const token = getCSRFToken();

    if (token) {
        if (headers instanceof Headers) {
            headers.set(CSRF_HEADER_NAME, token);
        } else if (Array.isArray(headers)) {
            headers.push([CSRF_HEADER_NAME, token]);
        } else {
            headers[CSRF_HEADER_NAME as keyof HeadersInit] = token as string & number & readonly string[];
        }
    }

    return headers;
}

/**
 * Crea un objeto de headers con el token CSRF incluido
 * @param additionalHeaders - Headers adicionales a incluir
 * @returns Objeto de headers con el token CSRF
 */
export function createCSRFHeaders(
    additionalHeaders?: HeadersInit
): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Agregar headers adicionales
    if (additionalHeaders) {
        if (additionalHeaders instanceof Headers) {
            additionalHeaders.forEach((value, key) => {
                headers[key] = value;
            });
        } else if (Array.isArray(additionalHeaders)) {
            additionalHeaders.forEach(([key, value]) => {
                headers[key] = value;
            });
        } else {
            Object.assign(headers, additionalHeaders);
        }
    }

    // Agregar token CSRF
    const token = getCSRFToken();
    if (token) {
        headers[CSRF_HEADER_NAME] = token;
    }

    return headers;
}

// ============================================================================
// FETCH WRAPPER
// ============================================================================

/**
 * Opciones para fetchWithCSRF
 */
export interface FetchWithCSRFOptions extends RequestInit {
    /**
     * Si es true, no agrega el token CSRF (útil para GET requests)
     * Default: false
     */
    skipCSRF?: boolean;

    /**
     * Headers adicionales a incluir
     */
    headers?: HeadersInit;
}

/**
 * Wrapper para fetch que incluye automáticamente el token CSRF
 * @param url - URL de la solicitud
 * @param options - Opciones de fetch
 * @returns Promise con la respuesta de fetch
 */
export async function fetchWithCSRF(
    url: string,
    options: FetchWithCSRFOptions = {}
): Promise<Response> {
    const { skipCSRF = false, headers = {}, ...restOptions } = options;

    // Determinar si el método requiere CSRF
    const method = (options.method || 'GET').toUpperCase();
    const requiresCSRF = !skipCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

    // Crear headers
    const finalHeaders: Record<string, string> = {};

    // Agregar headers proporcionados
    if (headers instanceof Headers) {
        headers.forEach((value, key) => {
            finalHeaders[key] = value;
        });
    } else if (Array.isArray(headers)) {
        headers.forEach(([key, value]) => {
            finalHeaders[key] = value;
        });
    } else {
        Object.assign(finalHeaders, headers);
    }

    // Agregar token CSRF si es necesario
    if (requiresCSRF) {
        const token = getCSRFToken();

        if (!token) {
            console.warn('CSRF token not found. Request may fail.');
        } else {
            finalHeaders[CSRF_HEADER_NAME] = token;
        }
    }

    // Ejecutar fetch
    return fetch(url, {
        credentials: 'include', // Asegurar que las cookies se envíen
        ...restOptions,
        headers: finalHeaders,
    });
}

/**
 * Wrapper para GET requests (no requieren CSRF)
 * @param url - URL de la solicitud
 * @param options - Opciones de fetch
 * @returns Promise con la respuesta de fetch
 */
export async function fetchWithCSRFGet(
    url: string,
    options?: Omit<FetchWithCSRFOptions, 'skipCSRF' | 'method'>
): Promise<Response> {
    return fetchWithCSRF(url, {
        ...options,
        method: 'GET',
        skipCSRF: true,
    });
}

/**
 * Wrapper para POST requests (requieren CSRF)
 * @param url - URL de la solicitud
 * @param data - Datos a enviar en el body
 * @param options - Opciones adicionales de fetch
 * @returns Promise con la respuesta de fetch
 */
export async function fetchWithCSRFPost<T = unknown>(
    url: string,
    data?: T,
    options?: Omit<FetchWithCSRFOptions, 'skipCSRF' | 'method' | 'body'>
): Promise<Response> {
    return fetchWithCSRF(url, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
}

/**
 * Wrapper para PUT requests (requieren CSRF)
 * @param url - URL de la solicitud
 * @param data - Datos a enviar en el body
 * @param options - Opciones adicionales de fetch
 * @returns Promise con la respuesta de fetch
 */
export async function fetchWithCSRFPut<T = unknown>(
    url: string,
    data?: T,
    options?: Omit<FetchWithCSRFOptions, 'skipCSRF' | 'method' | 'body'>
): Promise<Response> {
    return fetchWithCSRF(url, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
}

/**
 * Wrapper para DELETE requests (requieren CSRF)
 * @param url - URL de la solicitud
 * @param options - Opciones adicionales de fetch
 * @returns Promise con la respuesta de fetch
 */
export async function fetchWithCSRFDelete(
    url: string,
    options?: Omit<FetchWithCSRFOptions, 'skipCSRF' | 'method'>
): Promise<Response> {
    return fetchWithCSRF(url, {
        ...options,
        method: 'DELETE',
    });
}

/**
 * Wrapper para PATCH requests (requieren CSRF)
 * @param url - URL de la solicitud
 * @param data - Datos a enviar en el body
 * @param options - Opciones adicionales de fetch
 * @returns Promise con la respuesta de fetch
 */
export async function fetchWithCSRFPatch<T = unknown>(
    url: string,
    data?: T,
    options?: Omit<FetchWithCSRFOptions, 'skipCSRF' | 'method' | 'body'>
): Promise<Response> {
    return fetchWithCSRF(url, {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });
}

// ============================================================================
// REACT HOOK
// ============================================================================

/**
 * Hook personalizado para usar CSRF en componentes React
 * @returns Objeto con funciones y estado de CSRF
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { token, hasToken, fetchWithCSRF } = useCSRF();
 *   
 *   const handleSubmit = async () => {
 *     const response = await fetchWithCSRF('/api/data', {
 *       method: 'POST',
 *       body: JSON.stringify({ foo: 'bar' }),
 *     });
 *   };
 *   
 *   return <button onClick={handleSubmit}>Submit</button>;
 * }
 * ```
 */
export function useCSRF() {
    const token = getCSRFToken();
    const hasToken = hasCSRFToken();

    return {
        token,
        hasToken,
        getCSRFToken,
        setCSRFTokenHeader,
        createCSRFHeaders,
        fetchWithCSRF,
        fetchWithCSRFGet,
        fetchWithCSRFPost,
        fetchWithCSRFPut,
        fetchWithCSRFDelete,
        fetchWithCSRFPatch,
    };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    CSRF_COOKIE_NAME,
    CSRF_HEADER_NAME,
};
