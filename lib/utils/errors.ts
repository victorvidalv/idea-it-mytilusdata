/**
 * Manejo centralizado de errores para la API
 * Proporciona clases de error personalizadas y funciones de manejo de errores
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ErrorCode } from '@/lib/types';
import { logger } from './logger';

// ============================================================================
// API ERROR CLASS
// ============================================================================

/**
 * Error personalizado para la API
 * Extiende de Error y agrega propiedades específicas para respuestas HTTP
 */
export class ApiError extends Error {
  /**
   * Código de estado HTTP
   */
  public readonly statusCode: number;

  /**
   * Código de error estandarizado
   */
  public readonly code: ErrorCode;

  /**
   * Detalles adicionales del error
   */
  public readonly details: unknown;

  constructor(
    statusCode: number,
    message: string,
    details?: unknown,
    code?: ErrorCode
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.code = code || this.getDefaultErrorCode(statusCode);
    
    // Mantener el stack trace correcto
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Obtiene el código de error predeterminado basado en el statusCode
   */
  private getDefaultErrorCode(statusCode: number): ErrorCode {
    switch (statusCode) {
      case 400:
        return ErrorCode.INVALID_INPUT;
      case 401:
        return ErrorCode.UNAUTHORIZED;
      case 403:
        return ErrorCode.FORBIDDEN;
      case 404:
        return ErrorCode.NOT_FOUND;
      case 409:
        return ErrorCode.CONFLICT;
      case 422:
        return ErrorCode.VALIDATION_ERROR;
      default:
        return ErrorCode.INTERNAL_ERROR;
    }
  }

  /**
   * Crea un error de solicitud incorrecta (400)
   */
  static badRequest(message: string, details?: unknown): ApiError {
    return new ApiError(400, message, details, ErrorCode.INVALID_INPUT);
  }

  /**
   * Crea un error de no autorizado (401)
   */
  static unauthorized(message: string, details?: unknown): ApiError {
    return new ApiError(401, message, details, ErrorCode.UNAUTHORIZED);
  }

  /**
   * Crea un error de prohibido (403)
   */
  static forbidden(message: string, details?: unknown): ApiError {
    return new ApiError(403, message, details, ErrorCode.FORBIDDEN);
  }

  /**
   * Crea un error de no encontrado (404)
   */
  static notFound(message: string, details?: unknown): ApiError {
    return new ApiError(404, message, details, ErrorCode.NOT_FOUND);
  }

  /**
   * Crea un error de conflicto (409)
   */
  static conflict(message: string, details?: unknown): ApiError {
    return new ApiError(409, message, details, ErrorCode.CONFLICT);
  }

  /**
   * Crea un error de validación (422)
   */
  static validationError(message: string, details?: unknown): ApiError {
    return new ApiError(422, message, details, ErrorCode.VALIDATION_ERROR);
  }

  /**
   * Crea un error interno del servidor (500)
   */
  static internal(message: string, details?: unknown): ApiError {
    return new ApiError(500, message, details, ErrorCode.INTERNAL_ERROR);
  }
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard para verificar si un error es ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Type guard para verificar si un error es ZodError
 */
export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

/**
 * Interfaz para el contexto de error
 * Compatible con LoggerContext
 */
interface ErrorContext {
  requestId?: string;
  userId?: number;
  path?: string;
  method?: string;
  [key: string]: unknown;
}

/**
 * Maneja errores de la API y retorna una respuesta NextResponse apropiada
 * 
 * @param error - El error a manejar
 * @param context - Contexto adicional (requestId, userId, etc.)
 * @returns NextResponse con el formato de error estandarizado
 */
export function handleApiError(error: unknown, context?: ErrorContext): NextResponse {
  // Obtener requestId del contexto o del logger
  const requestId = context?.requestId || logger.getRequestId();

  // Construir respuesta base
  const buildResponse = (
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: unknown
  ): NextResponse => {
    const responseBody = {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        ...(requestId && { requestId }),
      },
    };

    return NextResponse.json(responseBody, { status: statusCode });
  };

  // Caso 1: Es un ApiError
  if (isApiError(error)) {
    logger.error(
      `Error de API: ${error.message}`,
      error,
      {
        statusCode: error.statusCode,
        code: error.code,
        ...context,
      }
    );

    return buildResponse(
      error.statusCode,
      error.code,
      error.message,
      error.details
    );
  }

  // Caso 2: Es un ZodError (error de validación)
  if (isZodError(error)) {
    const validationDetails = error.issues.map((err) => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));

    logger.error(
      'Error de validación Zod',
      error,
      {
        validationErrors: validationDetails,
        ...context,
      }
    );

    return buildResponse(
      422,
      ErrorCode.VALIDATION_ERROR,
      'Error de validación en los datos enviados',
      validationDetails
    );
  }

  // Caso 3: Es un Error genérico
  if (error instanceof Error) {
    logger.error(
      `Error no manejado: ${error.message}`,
      error,
      context
    );

    return buildResponse(
      500,
      ErrorCode.INTERNAL_ERROR,
      'Error interno del servidor',
      process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }

  // Caso 4: Error desconocido
  logger.error(
    'Error desconocido',
    undefined,
    {
      errorType: typeof error,
      ...context,
    }
  );

  return buildResponse(
    500,
    ErrorCode.INTERNAL_ERROR,
    'Error interno del servidor',
    process.env.NODE_ENV === 'development' ? String(error) : undefined
  );
}

// ============================================================================
// ERROR HANDLER HOC
// ============================================================================

/**
 * Tipo para un handler de API que puede retornar NextResponse o Promise<NextResponse>
 */
type ApiHandler = (...args: unknown[]) => NextResponse | Promise<NextResponse>;

/**
 * HOC (Higher-Order Component) para envolver handlers de API con manejo de errores
 * 
 * @param handler - El handler de API a envolver
 * @returns Una función que ejecuta el handler y maneja errores automáticamente
 * 
 * @example
 * ```typescript
 * export const GET = withErrorHandler(async (request: Request) => {
 *   // Tu lógica aquí
 *   return NextResponse.json({ data: '...' });
 * });
 * ```
 */
export function withErrorHandler<T extends ApiHandler>(handler: T): T {
  return (async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      // Intentar extraer información del contexto de la solicitud
      let context: ErrorContext = {};

      // Si el primer argumento es una Request, extraer información
      if (args[0] instanceof Request) {
        const request = args[0] as Request;
        context = {
          path: request.url,
          method: request.method,
        };

        // Intentar obtener requestId de los headers
        const requestId = request.headers.get('x-request-id');
        if (requestId) {
          context.requestId = requestId;
          logger.setRequestId(requestId);
        }
      }

      return handleApiError(error, context);
    }
  }) as T;
}
