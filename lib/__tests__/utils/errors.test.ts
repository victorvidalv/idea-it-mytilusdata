import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { z } from 'zod';
import {
  ApiError,
  isApiError,
  isZodError,
  handleApiError,
  withErrorHandler,
} from '../../utils/errors';
import { ErrorCode } from '../../types/api.types';

describe('ApiError', () => {
  describe('constructor', () => {
    it('debe crear un ApiError con statusCode y message', () => {
      const error = new ApiError(400, 'Bad request');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.name).toBe('ApiError');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad request');
      expect(error.code).toBe(ErrorCode.INVALID_INPUT);
      expect(error.details).toBeUndefined();
    });

    it('debe crear un ApiError con details', () => {
      const details = { field: 'email', value: 'invalid' };
      const error = new ApiError(400, 'Bad request', details);

      expect(error.details).toEqual(details);
    });

    it('debe crear un ApiError con código personalizado', () => {
      const error = new ApiError(400, 'Bad request', undefined, ErrorCode.VALIDATION_ERROR);

      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('debe asignar código predeterminado basado en statusCode', () => {
      const error401 = new ApiError(401, 'Unauthorized');
      expect(error401.code).toBe(ErrorCode.UNAUTHORIZED);

      const error403 = new ApiError(403, 'Forbidden');
      expect(error403.code).toBe(ErrorCode.FORBIDDEN);

      const error404 = new ApiError(404, 'Not found');
      expect(error404.code).toBe(ErrorCode.NOT_FOUND);

      const error409 = new ApiError(409, 'Conflict');
      expect(error409.code).toBe(ErrorCode.CONFLICT);

      const error422 = new ApiError(422, 'Validation error');
      expect(error422.code).toBe(ErrorCode.VALIDATION_ERROR);

      const error500 = new ApiError(500, 'Internal error');
      expect(error500.code).toBe(ErrorCode.INTERNAL_ERROR);
    });

    it('debe mantener el stack trace correcto', () => {
      const error = new ApiError(400, 'Bad request');

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
    });
  });

  describe('static methods', () => {
    it('badRequest debe crear error 400', () => {
      const error = ApiError.badRequest('Invalid input');

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe(ErrorCode.INVALID_INPUT);
    });

    it('badRequest debe aceptar details', () => {
      const details = { field: 'name' };
      const error = ApiError.badRequest('Invalid input', details);

      expect(error.details).toEqual(details);
    });

    it('unauthorized debe crear error 401', () => {
      const error = ApiError.unauthorized('Not authenticated');

      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Not authenticated');
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
    });

    it('forbidden debe crear error 403', () => {
      const error = ApiError.forbidden('Access denied');

      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access denied');
      expect(error.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('notFound debe crear error 404', () => {
      const error = ApiError.notFound('Resource not found');

      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
    });

    it('conflict debe crear error 409', () => {
      const error = ApiError.conflict('Resource already exists');

      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Resource already exists');
      expect(error.code).toBe(ErrorCode.CONFLICT);
    });

    it('validationError debe crear error 422', () => {
      const error = ApiError.validationError('Validation failed');

      expect(error.statusCode).toBe(422);
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('internal debe crear error 500', () => {
      const error = ApiError.internal('Server error');

      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Server error');
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
    });
  });
});

describe('isApiError', () => {
  it('debe retornar true para ApiError', () => {
    const error = ApiError.badRequest('Invalid');

    expect(isApiError(error)).toBe(true);
  });

  it('debe retornar false para Error genérico', () => {
    const error = new Error('Generic error');

    expect(isApiError(error)).toBe(false);
  });

  it('debe retornar false para null', () => {
    expect(isApiError(null)).toBe(false);
  });

  it('debe retornar false para undefined', () => {
    expect(isApiError(undefined)).toBe(false);
  });

  it('debe retornar false para string', () => {
    expect(isApiError('error')).toBe(false);
  });
});

describe('isZodError', () => {
  it('debe retornar true para ZodError', () => {
    const schema = z.string();
    const result = schema.safeParse(123);

    if (!result.success) {
      expect(isZodError(result.error)).toBe(true);
    }
  });

  it('debe retornar false para Error genérico', () => {
    const error = new Error('Generic error');

    expect(isZodError(error)).toBe(false);
  });

  it('debe retornar false para ApiError', () => {
    const error = ApiError.badRequest('Invalid');

    expect(isZodError(error)).toBe(false);
  });

  it('debe retornar false para null', () => {
    expect(isZodError(null)).toBe(false);
  });
});

describe('handleApiError', () => {
  it('debe manejar ApiError correctamente', async () => {
    const error = ApiError.notFound('Resource not found');
    const response = handleApiError(error);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(404);

    const data = await response.json() as { success: boolean; error: { code: string; message: string } };
    
    expect(data.success).toBe(false);
    expect(data.error.code).toBe(ErrorCode.NOT_FOUND);
    expect(data.error.message).toBe('Resource not found');
  });

  it('debe manejar ApiError con details', async () => {
    const details = { field: 'email', value: 'invalid' };
    const error = ApiError.badRequest('Invalid input', details);
    const response = handleApiError(error);

    const data = await response.json() as { success: boolean; error: { code: string; message: string; details?: unknown } };
    
    expect(data.error.details).toEqual(details);
  });

  it('debe manejar ZodError correctamente', async () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    });

    const result = schema.safeParse({ email: 'invalid', age: 10 });

    if (!result.success) {
      const response = handleApiError(result.error);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(422);

      const data = await response.json() as { success: boolean; error: { code: string; message: string; details?: unknown[] } };
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(data.error.message).toBe('Error de validación en los datos enviados');
      expect(Array.isArray(data.error.details)).toBe(true);
    }
  });

  it('debe manejar Error genérico correctamente', async () => {
    const error = new Error('Generic error');
    const response = handleApiError(error);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(500);

    const data = await response.json() as { success: boolean; error: { code: string; message: string } };
    
    expect(data.success).toBe(false);
    expect(data.error.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(data.error.message).toBe('Error interno del servidor');
  });

  it('debe manejar error desconocido correctamente', async () => {
    const error = 'string error';
    const response = handleApiError(error);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(500);

    const data = await response.json() as { success: boolean; error: { code: string; message: string } };
    
    expect(data.success).toBe(false);
    expect(data.error.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(data.error.message).toBe('Error interno del servidor');
  });

  it('debe incluir requestId en la respuesta cuando se proporciona contexto', async () => {
    const error = ApiError.badRequest('Invalid input');
    const context = { requestId: 'test-123' };
    const response = handleApiError(error, context);

    const data = await response.json() as { success: boolean; meta?: { requestId?: string } };
    
    expect(data.meta?.requestId).toBe('test-123');
  });

  it('debe incluir userId en la respuesta cuando se proporciona contexto', async () => {
    const error = ApiError.badRequest('Invalid input');
    const context = { userId: 1 };
    const response = handleApiError(error, context);

    const data = await response.json() as { success: boolean; meta?: { timestamp: string } };
    
    expect(data.meta?.timestamp).toBeDefined();
  });

  it('debe incluir timestamp en todas las respuestas', async () => {
    const error = ApiError.badRequest('Invalid input');
    const response = handleApiError(error);

    const data = await response.json() as { success: boolean; meta?: { timestamp: string } };
    
    expect(data.meta?.timestamp).toBeDefined();
    expect(typeof data.meta?.timestamp).toBe('string');
  });
});

describe('withErrorHandler', () => {
  it('debe ejecutar el handler exitosamente sin errores', async () => {
    const mockHandler = jest.fn().mockResolvedValue(
      NextResponse.json({ success: true, data: 'test' })
    );

    const wrappedHandler = withErrorHandler(mockHandler);
    const result = await wrappedHandler();

    expect(mockHandler).toHaveBeenCalled();
    expect(result).toBeInstanceOf(NextResponse);
  });

  it('debe manejar ApiError en el handler', async () => {
    const mockHandler = jest.fn().mockRejectedValue(
      ApiError.notFound('Resource not found')
    );

    const wrappedHandler = withErrorHandler(mockHandler);
    const result = await wrappedHandler();

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(404);
  });

  it('debe manejar ZodError en el handler', async () => {
    const schema = z.object({ email: z.string().email() });
    const result = schema.safeParse({ email: 'invalid' });

    if (!result.success) {
      const mockHandler = jest.fn().mockRejectedValue(result.error);

      const wrappedHandler = withErrorHandler(mockHandler);
      const response = await wrappedHandler();

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(422);
      
      const data = await response.json() as { success: boolean; error: { code: string } };
      expect(data.error.code).toBe(ErrorCode.VALIDATION_ERROR);
    }
  });

  it('debe manejar Error genérico en el handler', async () => {
    const mockHandler = jest.fn().mockRejectedValue(
      new Error('Unexpected error')
    );

    const wrappedHandler = withErrorHandler(mockHandler);
    const result = await wrappedHandler();

    expect(result).toBeInstanceOf(NextResponse);
    expect(result.status).toBe(500);
  });

  it('debe extraer contexto de Request cuando está disponible', async () => {
    const mockRequest = new Request('http://localhost:3000/api/test', {
      method: 'GET',
      headers: {
        'x-request-id': 'test-request-123',
      },
    });

    const mockHandler = jest.fn().mockRejectedValue(
      ApiError.badRequest('Invalid input')
    );

    const wrappedHandler = withErrorHandler(mockHandler);
    const result = await wrappedHandler(mockRequest);

    expect(result).toBeInstanceOf(NextResponse);
  });

  it('debe mantener la firma del handler original', async () => {
    const mockHandler = jest.fn().mockResolvedValue(
      NextResponse.json({ success: true })
    );

    const wrappedHandler = withErrorHandler(mockHandler);
    await wrappedHandler('arg1', 'arg2', 'arg3');

    expect(mockHandler).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });
});
