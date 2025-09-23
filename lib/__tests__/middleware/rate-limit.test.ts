import { NextRequest, NextResponse } from 'next/server';
import {
  RateLimiter,
  createRateLimiter,
  withRateLimit,
  getRateLimitHeaders,
  authRateLimiter,
  apiRateLimiter,
  strictRateLimiter,
} from '../../middleware/rate-limit';

// Mock de logger
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock de getClientIp
jest.mock('../../middleware/auth', () => ({
  __esModule: true,
  getClientIp: jest.fn(() => '127.0.0.1'),
}));

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;
  let mockRequest: NextRequest;

  beforeEach(() => {
    rateLimiter = new RateLimiter({
      windowMs: 60000,
      maxRequests: 5,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      keyGenerator: () => 'test-key',
    });

    mockRequest = {
      headers: new Headers(),
      nextUrl: new URL('http://localhost/api/test'),
      method: 'GET',
    } as unknown as NextRequest;
  });

  it('debe crear instancia con configuración', () => {
    expect(rateLimiter).toBeInstanceOf(RateLimiter);
    expect(rateLimiter['config'].windowMs).toBe(60000);
    expect(rateLimiter['config'].maxRequests).toBe(5);
  });

  it('debe permitir request dentro del límite', () => {
    const result1 = rateLimiter.check(mockRequest);
    const result2 = rateLimiter.check(mockRequest);
    const result3 = rateLimiter.check(mockRequest);

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    expect(result3.success).toBe(true);
    expect(result1.remaining).toBe(4);
    expect(result2.remaining).toBe(3);
    expect(result3.remaining).toBe(2);
  });

  it('debe bloquear request que excede el límite', () => {
    // Hacer 5 requests (límite)
    for (let i = 0; i < 5; i++) {
      const result = rateLimiter.check(mockRequest);
      expect(result.success).toBe(true);
    }

    // La 6ta request debe ser bloqueada
    const result = rateLimiter.check(mockRequest);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBeDefined();
  });

  it('debe resetear después del tiempo de ventana', () => {
    jest.useFakeTimers();

    // Hacer 5 requests
    for (let i = 0; i < 5; i++) {
      rateLimiter.check(mockRequest);
    }

    // Avanzar el tiempo más allá de la ventana
    jest.advanceTimersByTime(61000);

    // La siguiente request debe ser permitida nuevamente
    const result = rateLimiter.check(mockRequest);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);

    jest.useRealTimers();
  });

  it('debe limpiar entradas expiradas', () => {
    jest.useFakeTimers();

    // Crear una entrada
    rateLimiter.check(mockRequest);

    // Avanzar el tiempo más allá de la ventana
    jest.advanceTimersByTime(61000);

    // Llamar a cleanup
    rateLimiter.cleanup();

    // Verificar que el store esté vacío
    expect(rateLimiter['store'].size).toBe(0);

    jest.useRealTimers();
  });

  it('debe resetear contador para una clave específica', () => {
    // Hacer algunas requests
    rateLimiter.check(mockRequest);
    rateLimiter.check(mockRequest);

    // Resetear
    rateLimiter.reset('test-key');

    // Verificar que el contador se reinició
    const result = rateLimiter.check(mockRequest);
    expect(result.remaining).toBe(4);
  });

  it('debe manejar múltiples claves independientes', () => {
    const mockRequest2 = {
      ...mockRequest,
    } as unknown as NextRequest;

    const rateLimiter2 = new RateLimiter({
      windowMs: 60000,
      maxRequests: 3,
      keyGenerator: () => 'test-key-2',
    });

    // Hacer requests con la primera clave
    for (let i = 0; i < 5; i++) {
      rateLimiter.check(mockRequest);
    }

    // La primera clave debe estar bloqueada
    const result1 = rateLimiter.check(mockRequest);
    expect(result1.success).toBe(false);

    // La segunda clave debe seguir funcionando
    const result2 = rateLimiter2.check(mockRequest2);
    expect(result2.success).toBe(true);
  });

  it('debe obtener el tamaño del store', () => {
    expect(rateLimiter.getStoreSize()).toBe(0);

    rateLimiter.check(mockRequest);
    expect(rateLimiter.getStoreSize()).toBe(1);

    rateLimiter.check(mockRequest);
    expect(rateLimiter.getStoreSize()).toBe(1); // Mismo key
  });
});

describe('createRateLimiter', () => {
  it('debe crear instancia con configuración por defecto', () => {
    const rateLimiter = createRateLimiter();

    expect(rateLimiter).toBeInstanceOf(RateLimiter);
    expect(rateLimiter['config'].windowMs).toBe(15 * 60 * 1000);
    expect(rateLimiter['config'].maxRequests).toBe(100);
  });

  it('debe crear instancia con configuración personalizada', () => {
    const rateLimiter = createRateLimiter({
      windowMs: 30000,
      maxRequests: 10,
    });

    expect(rateLimiter['config'].windowMs).toBe(30000);
    expect(rateLimiter['config'].maxRequests).toBe(10);
  });
});

describe('withRateLimit', () => {
  let mockHandler: jest.Mock;
  let mockRequest: NextRequest;

  beforeEach(() => {
    mockHandler = jest.fn().mockResolvedValue(
      NextResponse.json({ success: true, data: 'test' })
    );

    mockRequest = {
      headers: new Headers(),
      nextUrl: new URL('http://localhost/api/test'),
      method: 'GET',
    } as unknown as NextRequest;
  });

  it('debe envolver handler correctamente', () => {
    const wrappedHandler = withRateLimit(mockHandler, {
      windowMs: 60000,
      maxRequests: 5,
    });

    expect(typeof wrappedHandler).toBe('function');
  });

  it('debe retornar respuesta exitosa dentro del límite', async () => {
    const wrappedHandler = withRateLimit(mockHandler, {
      windowMs: 60000,
      maxRequests: 5,
    });

    const response = await wrappedHandler(mockRequest);

    expect(response.status).toBe(200);
    expect(mockHandler).toHaveBeenCalledWith(mockRequest);
  });

  it('debe retornar 429 cuando excede el límite', async () => {
    const wrappedHandler = withRateLimit(mockHandler, {
      windowMs: 60000,
      maxRequests: 2,
    });

    // Hacer 2 requests exitosas
    await wrappedHandler(mockRequest);
    await wrappedHandler(mockRequest);

    // La 3ra request debe ser bloqueada
    const response = await wrappedHandler(mockRequest);

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain('Demasiadas solicitudes');
  });

  it('debe incluir headers de rate limiting', async () => {
    const wrappedHandler = withRateLimit(mockHandler, {
      windowMs: 60000,
      maxRequests: 5,
    });

    const response = await wrappedHandler(mockRequest);

    expect(response.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('4');
    expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
  });

  it('debe incluir Retry-After header cuando excede el límite', async () => {
    const wrappedHandler = withRateLimit(mockHandler, {
      windowMs: 60000,
      maxRequests: 2,
    });

    // Hacer 2 requests exitosas
    await wrappedHandler(mockRequest);
    await wrappedHandler(mockRequest);

    // La 3ra request debe ser bloqueada con Retry-After
    const response = await wrappedHandler(mockRequest);

    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBeDefined();
  });

  it('debe respetar skipSuccessfulRequests', async () => {
    const wrappedHandler = withRateLimit(mockHandler, {
      windowMs: 60000,
      maxRequests: 2,
      skipSuccessfulRequests: true,
    });

    // Hacer 3 requests exitosas
    await wrappedHandler(mockRequest);
    await wrappedHandler(mockRequest);
    const response = await wrappedHandler(mockRequest);

    // No debe estar bloqueado porque las exitosas no cuentan
    expect(response.status).toBe(200);
  });

  it('debe respetar skipFailedRequests', async () => {
    const mockFailedHandler = jest.fn().mockResolvedValue(
      NextResponse.json({ error: 'test' }, { status: 400 })
    );

    const wrappedHandler = withRateLimit(mockFailedHandler, {
      windowMs: 60000,
      maxRequests: 2,
      skipFailedRequests: true,
    });

    // Hacer 3 requests fallidas
    await wrappedHandler(mockRequest);
    await wrappedHandler(mockRequest);
    const response = await wrappedHandler(mockRequest);

    // No debe estar bloqueado porque las fallidas no cuentan
    expect(response.status).toBe(400);
  });
});

describe('getRateLimitHeaders', () => {
  it('debe generar headers correctos', () => {
    const result = {
      success: true,
      limit: 100,
      remaining: 50,
      reset: Date.now() + 60000,
    };

    const headers = getRateLimitHeaders(result);

    expect(headers.get('X-RateLimit-Limit')).toBe('100');
    expect(headers.get('X-RateLimit-Remaining')).toBe('50');
    expect(headers.get('X-RateLimit-Reset')).toBe(result.reset.toString());
  });

  it('debe incluir Retry-Only cuando hay retryAfter', () => {
    const result = {
      success: false,
      limit: 100,
      remaining: 0,
      reset: Date.now() + 60000,
      retryAfter: 60,
    };

    const headers = getRateLimitHeaders(result);

    expect(headers.get('Retry-After')).toBe('60');
  });

  it('no debe incluir Retry-After cuando no hay retryAfter', () => {
    const result = {
      success: true,
      limit: 100,
      remaining: 50,
      reset: Date.now() + 60000,
    };

    const headers = getRateLimitHeaders(result);

    // Map.get() retorna undefined cuando la clave no existe
    expect(headers.get('Retry-After')).toBeUndefined();
  });
});

describe('Pre-configured Rate Limiters', () => {
  it('debe crear authRateLimiter con configuración correcta', () => {
    expect(authRateLimiter).toBeInstanceOf(RateLimiter);
    expect(authRateLimiter['config'].windowMs).toBe(15 * 60 * 1000);
    expect(authRateLimiter['config'].maxRequests).toBe(5);
  });

  it('debe crear apiRateLimiter con configuración correcta', () => {
    expect(apiRateLimiter).toBeInstanceOf(RateLimiter);
    expect(apiRateLimiter['config'].windowMs).toBe(15 * 60 * 1000);
    expect(apiRateLimiter['config'].maxRequests).toBe(100);
  });

  it('debe crear strictRateLimiter con configuración correcta', () => {
    expect(strictRateLimiter).toBeInstanceOf(RateLimiter);
    expect(strictRateLimiter['config'].windowMs).toBe(60 * 1000);
    expect(strictRateLimiter['config'].maxRequests).toBe(10);
  });
});
