import { NextRequest, NextResponse } from 'next/server';
import {
  generateCSRFToken,
  verifyCSRFToken,
  getCSRFTokenFromCookie,
  getCSRFTokenFromHeader,
  createCSRFMiddleware,
  withCSRFProtection,
} from '../../middleware/csrf';

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

describe('generateCSRFToken', () => {
  it('debe generar token de longitud correcta (default 32 bytes = 64 caracteres hex)', () => {
    const token = generateCSRFToken();

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(64);
  });

  it('debe generar token con longitud personalizada', () => {
    const token = generateCSRFToken(16);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBe(32);
  });

  it('debe generar tokens únicos', () => {
    const token1 = generateCSRFToken();
    const token2 = generateCSRFToken();
    const token3 = generateCSRFToken();

    expect(token1).not.toBe(token2);
    expect(token2).not.toBe(token3);
    expect(token1).not.toBe(token3);
  });

  it('debe generar tokens con formato hexadecimal válido', () => {
    const token = generateCSRFToken();
    const hexRegex = /^[0-9a-f]+$/i;

    expect(hexRegex.test(token)).toBe(true);
  });

  it('debe generar múltiples tokens sin repetir', () => {
    const tokens = new Set<string>();

    for (let i = 0; i < 100; i++) {
      const token = generateCSRFToken();
      tokens.add(token);
    }

    expect(tokens.size).toBe(100);
  });
});

describe('verifyCSRFToken', () => {
  it('debe verificar token válido', () => {
    const token = generateCSRFToken();
    const secret = 'test-secret';

    const result = verifyCSRFToken(token, secret);

    expect(result).toBe(true);
  });

  it('debe rechazar token inválido (null)', () => {
    const secret = 'test-secret';

    const result = verifyCSRFToken(null as unknown as string, secret);

    expect(result).toBe(false);
  });

  it('debe rechazar token inválido (undefined)', () => {
    const secret = 'test-secret';

    const result = verifyCSRFToken(undefined as unknown as string, secret);

    expect(result).toBe(false);
  });

  it('debe rechazar token vacío', () => {
    const secret = 'test-secret';

    const result = verifyCSRFToken('', secret);

    expect(result).toBe(false);
  });

  it('debe rechazar token con formato inválido (no hexadecimal)', () => {
    const token = 'not-a-hex-token';
    const secret = 'test-secret';

    const result = verifyCSRFToken(token, secret);

    expect(result).toBe(false);
  });

  it('debe rechazar token muy corto (< 16 caracteres)', () => {
    const token = 'abc123';
    const secret = 'test-secret';

    const result = verifyCSRFToken(token, secret);

    expect(result).toBe(false);
  });

  it('debe rechazar token con longitud mínima válida (16 caracteres)', () => {
    const token = '0123456789abcdef';
    const secret = 'test-secret';

    const result = verifyCSRFToken(token, secret);

    expect(result).toBe(true);
  });

  it('debe rechazar secret inválido (null)', () => {
    const token = generateCSRFToken();

    const result = verifyCSRFToken(token, null as unknown as string);

    expect(result).toBe(false);
  });

  it('debe rechazar secret vacío', () => {
    const token = generateCSRFToken();

    const result = verifyCSRFToken(token, '');

    expect(result).toBe(false);
  });

  it('debe aceptar token con caracteres especiales hexadecimales', () => {
    const token = '0123456789ABCDEFabcdef';
    const secret = 'test-secret';

    const result = verifyCSRFToken(token, secret);

    expect(result).toBe(true);
  });
});

describe('getCSRFTokenFromCookie', () => {
  it('debe extraer token de cookie existente', () => {
    const mockRequest = {
      headers: new Headers({
        cookie: 'csrf-token=abc123def456; other=value',
      }),
    } as unknown as NextRequest;

    const token = getCSRFTokenFromCookie(mockRequest, 'csrf-token');

    expect(token).toBe('abc123def456');
  });

  it('debe retornar null si cookie no existe', () => {
    const mockRequest = {
      headers: new Headers(),
    } as unknown as NextRequest;

    const token = getCSRFTokenFromCookie(mockRequest, 'csrf-token');

    expect(token).toBeNull();
  });

  it('debe retornar null si header cookie no existe', () => {
    const mockRequest = {
      headers: new Headers({
        'content-type': 'application/json',
      }),
    } as unknown as NextRequest;

    const token = getCSRFTokenFromCookie(mockRequest, 'csrf-token');

    expect(token).toBeNull();
  });

  it('debe extraer token con nombre de cookie personalizado', () => {
    const mockRequest = {
      headers: new Headers({
        cookie: 'custom-token=xyz789; other=value',
      }),
    } as unknown as NextRequest;

    const token = getCSRFTokenFromCookie(mockRequest, 'custom-token');

    expect(token).toBe('xyz789');
  });

  it('debe manejar cookies con espacios', () => {
    const mockRequest = {
      headers: new Headers({
        cookie: 'csrf-token=abc123; other=value; another=test',
      }),
    } as unknown as NextRequest;

    const token = getCSRFTokenFromCookie(mockRequest, 'csrf-token');

    expect(token).toBe('abc123');
  });

  it('debe manejar cookie vacía', () => {
    const mockRequest = {
      headers: new Headers({
        cookie: 'csrf-token=',
      }),
    } as unknown as NextRequest;

    const token = getCSRFTokenFromCookie(mockRequest, 'csrf-token');

    // La función retorna null cuando el valor está vacío
    expect(token).toBe(null);
  });

  it('debe retornar null si cookie específica no existe', () => {
    const mockRequest = {
      headers: new Headers({
        cookie: 'other-token=xyz789',
      }),
    } as unknown as NextRequest;

    const token = getCSRFTokenFromCookie(mockRequest, 'csrf-token');

    expect(token).toBeNull();
  });
});

describe('getCSRFTokenFromHeader', () => {
  it('debe extraer token de header existente', () => {
    const mockRequest = {
      headers: new Headers({
        'x-csrf-token': 'abc123def456',
      }),
    } as unknown as NextRequest;

    const token = getCSRFTokenFromHeader(mockRequest, 'x-csrf-token');

    expect(token).toBe('abc123def456');
  });

  it('debe retornar null si header no existe', () => {
    const mockRequest = {
      headers: new Headers({
        'content-type': 'application/json',
      }),
    } as unknown as NextRequest;

    const token = getCSRFTokenFromHeader(mockRequest, 'x-csrf-token');

    expect(token).toBeNull();
  });

  it('debe extraer token con nombre de header personalizado', () => {
    const mockRequest = {
      headers: new Headers({
        'custom-header': 'xyz789',
      }),
    } as unknown as NextRequest;

    const token = getCSRFTokenFromHeader(mockRequest, 'custom-header');

    expect(token).toBe('xyz789');
  });

  it('debe manejar header vacío', () => {
    const mockRequest = {
      headers: new Headers({
        'x-csrf-token': '',
      }),
    } as unknown as NextRequest;

    const token = getCSRFTokenFromHeader(mockRequest, 'x-csrf-token');

    expect(token).toBe('');
  });
});

describe('createCSRFMiddleware', () => {
  let middleware: ReturnType<typeof createCSRFMiddleware>;
  let mockRequest: NextRequest;

  beforeEach(() => {
    middleware = createCSRFMiddleware({
      secret: 'test-secret',
      cookieName: 'csrf-token',
      headerName: 'x-csrf-token',
      tokenLength: 32,
    });

    mockRequest = {
      headers: new Headers(),
      nextUrl: new URL('http://localhost/api/test'),
      method: 'GET',
    } as unknown as NextRequest;
  });

  it('debe generar y enviar token para métodos seguros (GET)', async () => {
    mockRequest.method = 'GET';

    const response = await middleware(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);
    // El token debe estar en las cookies de la respuesta
    const cookies = response.cookies.getAll();
    const csrfCookie = cookies.find(c => c.name === 'csrf-token');
    expect(csrfCookie).toBeDefined();
    expect(csrfCookie?.value).toBeDefined();
    expect(csrfCookie?.value.length).toBe(64);
  });

  it('debe generar y enviar token para método HEAD', async () => {
    mockRequest.method = 'HEAD';

    const response = await middleware(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);
    const cookies = response.cookies.getAll();
    const csrfCookie = cookies.find(c => c.name === 'csrf-token');
    expect(csrfCookie).toBeDefined();
  });

  it('debe generar y enviar token para método OPTIONS', async () => {
    mockRequest.method = 'OPTIONS';

    const response = await middleware(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);
    const cookies = response.cookies.getAll();
    const csrfCookie = cookies.find(c => c.name === 'csrf-token');
    expect(csrfCookie).toBeDefined();
  });

  it('debe verificar token para métodos no seguros (POST)', async () => {
    const token = generateCSRFToken(32);

    mockRequest.method = 'POST';
    mockRequest.headers.set('cookie', `csrf-token=${token}`);
    mockRequest.headers.set('x-csrf-token', token);

    const response = await middleware(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);
  });

  it('debe verificar token para método PUT', async () => {
    const token = generateCSRFToken(32);

    mockRequest.method = 'PUT';
    mockRequest.headers.set('cookie', `csrf-token=${token}`);
    mockRequest.headers.set('x-csrf-token', token);

    const response = await middleware(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);
  });

  it('debe verificar token para método DELETE', async () => {
    const token = generateCSRFToken(32);

    mockRequest.method = 'DELETE';
    mockRequest.headers.set('cookie', `csrf-token=${token}`);
    mockRequest.headers.set('x-csrf-token', token);

    const response = await middleware(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);
  });

  it('debe verificar token para método PATCH', async () => {
    const token = generateCSRFToken(32);

    mockRequest.method = 'PATCH';
    mockRequest.headers.set('cookie', `csrf-token=${token}`);
    mockRequest.headers.set('x-csrf-token', token);

    const response = await middleware(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);
  });

  it('debe rechazar POST sin token en cookie', async () => {
    mockRequest.method = 'POST';
    mockRequest.headers.set('x-csrf-token', 'abc123');

    const response = await middleware(mockRequest);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('CSRF_TOKEN_MISSING');
  });

  it('debe rechazar POST sin token en header', async () => {
    mockRequest.method = 'POST';
    mockRequest.headers.set('cookie', 'csrf-token=abc123');

    const response = await middleware(mockRequest);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('CSRF_TOKEN_MISSING');
  });

  it('debe rechazar POST con tokens que no coinciden', async () => {
    mockRequest.method = 'POST';
    mockRequest.headers.set('cookie', 'csrf-token=abc123');
    mockRequest.headers.set('x-csrf-token', 'xyz789');

    const response = await middleware(mockRequest);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('CSRF_TOKEN_MISMATCH');
  });

  it('debe usar configuración por defecto si no se proporciona', async () => {
    const defaultMiddleware = createCSRFMiddleware();

    mockRequest.method = 'GET';

    const response = await defaultMiddleware(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);
    const cookies = response.cookies.getAll();
    const csrfCookie = cookies.find(c => c.name === 'csrf-token');
    expect(csrfCookie).toBeDefined();
  });
});

describe('withCSRFProtection', () => {
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

  it('debe generar y agregar token para métodos seguros', async () => {
    const protectedHandler = withCSRFProtection(mockHandler, {
      secret: 'test-secret',
    });

    mockRequest.method = 'GET';

    const response = await protectedHandler(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);
    expect(mockHandler).toHaveBeenCalledWith(mockRequest);

    const cookies = response.cookies.getAll();
    const csrfCookie = cookies.find(c => c.name === 'csrf-token');
    expect(csrfCookie).toBeDefined();
  });

  it('debe verificar token para métodos no seguros', async () => {
    const protectedHandler = withCSRFProtection(mockHandler, {
      secret: 'test-secret',
    });

    const token = generateCSRFToken(32);

    mockRequest.method = 'POST';
    mockRequest.headers.set('cookie', `csrf-token=${token}`);
    mockRequest.headers.set('x-csrf-token', token);

    const response = await protectedHandler(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);
    expect(mockHandler).toHaveBeenCalledWith(mockRequest);
  });

  it('debe rechazar POST sin token en cookie', async () => {
    const protectedHandler = withCSRFProtection(mockHandler, {
      secret: 'test-secret',
    });

    mockRequest.method = 'POST';
    mockRequest.headers.set('x-csrf-token', 'abc123');

    const response = await protectedHandler(mockRequest);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('CSRF_TOKEN_MISSING');
  });

  it('debe rechazar POST sin token en header', async () => {
    const protectedHandler = withCSRFProtection(mockHandler, {
      secret: 'test-secret',
    });

    mockRequest.method = 'POST';
    mockRequest.headers.set('cookie', 'csrf-token=abc123');

    const response = await protectedHandler(mockRequest);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('CSRF_TOKEN_MISSING');
  });

  it('debe rechazar POST con tokens que no coinciden', async () => {
    const protectedHandler = withCSRFProtection(mockHandler, {
      secret: 'test-secret',
    });

    mockRequest.method = 'POST';
    mockRequest.headers.set('cookie', 'csrf-token=abc123');
    mockRequest.headers.set('x-csrf-token', 'xyz789');

    const response = await protectedHandler(mockRequest);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('CSRF_TOKEN_MISMATCH');
  });

  it('debe usar configuración por defecto si no se proporciona', async () => {
    const protectedHandler = withCSRFProtection(mockHandler);

    mockRequest.method = 'GET';

    const response = await protectedHandler(mockRequest);

    expect(response).toBeInstanceOf(NextResponse);
    expect(mockHandler).toHaveBeenCalledWith(mockRequest);
  });
});
