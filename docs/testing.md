# Documentación de Testing - MytilusData

**Fecha:** 2026-03-19
**Versión:** 1.0
**Audiencia:** Desarrolladores, QA engineers

---

## Propósito

Este documento describe la estrategia de testing, configuración, convenciones y mejores prácticas para el proyecto MytilusData. Permite a desarrolladores escribir, ejecutar y mantener tests de manera consistente.

---

## Estrategia de Testing

### Pirámide de Tests

```
                    ┌─────────┐
                    │   E2E   │  ← Pocos, lentos, alta confianza
                    │  (5%)   │
                  ┌─┴─────────┴─┐
                  │ Integración │  ← Cantidad media
                  │    (25%)    │
                ┌─┴─────────────┴─┐
                │   Unitarios     │  ← Muchos, rápidos, aislados
                │      (70%)      │
                └─────────────────┘
```

### Distribución de Tests

| Tipo | Cantidad | Velocidad | Propósito |
|------|----------|-----------|-----------|
| Unitarios | Muchos | < 100ms | Validar lógica aislada |
| Integración | Media | < 1s | Validar interacciones |
| E2E | Pocos | < 30s | Validar flujos completos |

### Cobertura Objetivo

| Componente | Cobertura Mínima | Cobertura Objetivo |
|------------|------------------|-------------------|
| Lógica de negocio | 80% | 90% |
| Componentes UI | 60% | 75% |
| API endpoints | 90% | 95% |
| Utilidades | 85% | 95% |

---

## Tests Unitarios

### Framework: Vitest

Vitest es el framework de testing principal, configurado con dos proyectos:

1. **client**: Tests de componentes Svelte (browser environment)
2. **server**: Tests de lógica de servidor (Node environment)

### Configuración

Definida en [`vite.config.ts`](../vite.config.ts):

```typescript
test: {
  expect: { requireAssertions: true },
  projects: [
    {
      name: 'client',
      browser: {
        enabled: true,
        provider: playwright(),
        instances: [{ browser: 'chromium', headless: true }]
      },
      include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
      exclude: ['src/lib/server/**']
    },
    {
      name: 'server',
      environment: 'node',
      include: ['src/**/*.{test,spec}.{js,ts}'],
      exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
    }
  ]
}
```

### Ejecución de Tests

```bash
# Ejecutar todos los tests unitarios
npm run test:unit

# Ejecutar en modo watch
npm run test:unit -- --watch

# Ejecutar archivo específico
npm run test:unit -- src/lib/utils.test.ts

# Ejecutar con coverage
npm run test:unit -- --coverage

# Ejecutar solo proyecto client
npm run test:unit -- --project=client

# Ejecutar solo proyecto server
npm run test:unit -- --project=server
```

### Estructura de Archivos

```
src/
├── __tests__/                    # Tests de integración y API
│   ├── test-utils.ts             # Utilidades compartidas
│   ├── api/
│   │   ├── auth/
│   │   │   └── api-auth.test.ts
│   │   ├── centros/
│   │   │   └── centros.test.ts
│   │   ├── ciclos/
│   │   │   └── ciclos.test.ts
│   │   ├── registros/
│   │   │   └── registros.test.ts
│   │   └── export-data/
│   │       └── export-data.test.ts
│   ├── auth/
│   │   ├── callback.test.ts
│   │   ├── login.test.ts
│   │   └── logout.test.ts
│   └── hooks/
│       └── hooks.test.ts
│
├── lib/
│   ├── utils.test.ts             # Test junto al archivo fuente
│   └── components/
│       └── centros/
│           ├── CentroCreateForm.svelte
│           └── CentroCreateForm.svelte.test.ts
```

### Convenciones de Nomenclatura

| Tipo de Test | Patrón | Ejemplo |
|--------------|--------|---------|
| Test unitario | `*.test.ts` | `utils.test.ts` |
| Test alternativo | `*.spec.ts` | `api.spec.ts` |
| Test de componente | `*.svelte.test.ts` | `Button.svelte.test.ts` |

---

## Tests de Componentes Svelte

### Framework: vitest-browser-svelte

Los tests de componentes se ejecutan en un navegador real (Chromium) mediante Playwright.

### Ejemplo Básico

```typescript
import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MiComponente from './MiComponente.svelte';

describe('MiComponente', () => {
  it('debería renderizar el título', async () => {
    render(MiComponente, { titulo: 'Hola Mundo' });
    
    await expect.element(page.getByText('Hola Mundo')).toBeInTheDocument();
  });

  it('debería llamar onClick al hacer clic', async () => {
    const onClick = vi.fn();
    render(MiComponente, { onClick });
    
    await page.getByRole('button').click();
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### Selectores Comunes

```typescript
// Por rol accesible
page.getByRole('button', { name: 'Guardar' })
page.getByRole('textbox', { name: 'Nombre' })

// Por texto
page.getByText('Bienvenido')
page.getByText(/bienvenido/i)  // Case insensitive

// Por placeholder
page.getByPlaceholder('Ej: Centro Calbuco')

// Por label
page.getByLabel('Email')

// Por test id (último recurso)
page.getByTestId('submit-button')
```

### Aserciones Disponibles

```typescript
// Presencia
await expect.element(element).toBeInTheDocument()
await expect.element(element).not.toBeInTheDocument()

// Visibilidad
await expect.element(element).toBeVisible()
await expect.element(element).toBeHidden()

// Estado
await expect.element(element).toBeEnabled()
await expect.element(element).toBeDisabled()
await expect.element(element).toBeChecked()

// Valor
await expect.element(input).toHaveValue('texto')
await expect.element(input).toHaveValue('')  // Vacío

// Atributos
await expect.element(input).toHaveAttribute('type', 'email')
await expect.element(input).toHaveClass('form-input')

// Texto
await expect.element(element).toHaveText('Contenido')
```

### Mocks de Módulos SvelteKit

```typescript
// Mock de $app/forms
vi.mock('$app/forms', () => ({
  enhance: vi.fn(() => ({}))
}));

// Mock de $app/environment
vi.mock('$app/environment', () => ({
  browser: false,
  dev: false
}));

// Mock de $app/navigation
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  invalidate: vi.fn()
}));

// Mock de $app/stores
vi.mock('$app/stores', () => ({
  page: {
    subscribe: vi.fn(fn => {
      fn({ url: new URL('http://localhost'), params: {} });
      return { unsubscribe: vi.fn() };
    })
  }
}));
```

---

## Tests de Integración (API)

### Estructura de Test de API

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '../../../routes/api/centros/+server';

// Mock de dependencias
vi.mock('$lib/server/db', () => ({
  db: { select: vi.fn() }
}));

describe('API /api/centros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('debería retornar 401 sin autenticación', async () => {
      const event = createApiRequestEvent({ authorization: null });
      
      const response = await GET(event);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.error).toBe('Falta la API Key');
    });
  });
});
```

### Helper para Crear RequestEvent Mock

Definido en [`src/__tests__/test-utils.ts`](../src/__tests__/test-utils.ts):

```typescript
export function createMockRequestEvent(overrides = {}): RequestEvent {
  return {
    cookies: {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
      getAll: vi.fn(),
      serialize: vi.fn()
    },
    getClientAddress: vi.fn(() => '127.0.0.1'),
    locals: { user: null, session: null },
    params: {},
    request: new Request('http://localhost/test'),
    route: { id: '/test' },
    url: new URL('http://localhost/test'),
    ...overrides
  } as unknown as RequestEvent;
}

export function createMockUser(overrides = {}) {
  return {
    id: 1,
    email: 'test@example.com',
    nombre: 'Test User',
    rol: 'USUARIO',
    activo: true,
    ...overrides
  };
}
```

### Tests de Rate Limiting

```typescript
it('debería retornar 429 si se excede el límite', async () => {
  mockCheckApiRateLimit.mockResolvedValue({
    allowed: false,
    remaining: 0,
    limit: 100,
    resetIn: 30000
  });

  const response = await GET(event);
  
  expect(response.status).toBe(429);
  expect(response.headers.get('Retry-After')).toBe('30');
  expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
});
```

---

## Tests E2E (Playwright)

### Configuración

Definida en [`playwright.config.ts`](../playwright.config.ts):

```typescript
export default defineConfig({
  webServer: { 
    command: 'npm run build && npm run preview', 
    port: 4173 
  },
  testDir: 'e2e'
});
```

### Ejecución

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar con UI
npm run test:e2e -- --ui

# Ejecutar archivo específico
npm run test:e2e -- e2e/login.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

### Estructura de Directorios

```
e2e/
├── demo.test.ts          # Test de demostración
└── (futuros tests E2E)
```

### Ejemplo de Test E2E

```typescript
import { test, expect } from '@playwright/test';

test.describe('Flujo de autenticación', () => {
  test('debería mostrar error con email inválido', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('input[name="email"]', 'email-invalido');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error')).toBeVisible();
  });

  test('debería enviar magic link con email válido', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
```

---

## Cobertura de Código

### Generar Reporte

```bash
# Generar coverage
npm run test:unit -- --coverage

# Coverage con umbral mínimo
npm run test:unit -- --coverage --coverage.lines=80
```

### Configuración de Coverage

Agregar a `vite.config.ts`:

```typescript
test: {
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'lcov'],
    exclude: [
      'node_modules/**',
      'src/**/*.d.ts',
      'src/**/*.test.ts',
      'src/**/*.spec.ts'
    ],
    thresholds: {
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    }
  }
}
```

### Interpretar Reporte

| Métrica | Descripción | Objetivo |
|---------|-------------|----------|
| Lines | Líneas ejecutadas | > 80% |
| Functions | Funciones llamadas | > 80% |
| Branches | Ramas condicionales | > 75% |
| Statements | Sentencias ejecutadas | > 80% |

---

## Mocks y Fixtures

### Mock de Base de Datos

```typescript
// Mock de Drizzle ORM
vi.mock('$lib/server/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([])
      })
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 1 }])
      })
    })
  }
}));
```

### Mock de Servicios Externos

```typescript
// Mock de Resend
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'email-id' })
    }
  }))
}));

// Mock de JWT
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(() => 'mock-jwt-token'),
  verify: vi.fn(() => ({ userId: 1 }))
}));
```

### Fixtures de Datos

```typescript
// Crear datos de prueba consistentes
export function createTestCentro(overrides = {}) {
  return {
    id: 1,
    nombre: 'Centro Test',
    latitud: -41.4689,
    longitud: -72.9411,
    userId: 1,
    createdAt: new Date('2025-01-01'),
    ...overrides
  };
}

export function createTestCiclo(overrides = {}) {
  return {
    id: 1,
    nombre: 'Ciclo Test 2025',
    fechaSiembra: new Date('2025-01-01'),
    lugarId: 1,
    userId: 1,
    activo: true,
    ...overrides
  };
}
```

---

## CI/CD de Tests

### Pipeline Recomendado

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run type check
        run: npm run check
      
      - name: Run unit tests
        run: npm run test:unit -- --run --coverage
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
```

### Checks Pre-Commit

```json
// package.json
{
  "scripts": {
    "test:quick": "npm run lint && npm run check && npm run test:unit -- --run"
  }
}
```

---

## Mejores Prácticas

### Principios Generales

1. **Un concepto por test**: Cada test verifica una sola cosa
2. **AAA Pattern**: Arrange, Act, Assert
3. **Tests independientes**: No compartir estado entre tests
4. **Nombres descriptivos**: El nombre debe explicar qué se prueba

### Ejemplo de Test Bien Estructurado

```typescript
describe('CentroCreateForm', () => {
  describe('Validación del campo nombre', () => {
    it('debería deshabilitar el botón cuando el nombre está vacío', async () => {
      // Arrange
      render(CentroCreateForm, { onCancel: vi.fn() });
      
      // Act
      const submitButton = page.getByRole('button', { name: 'Guardar' });
      
      // Assert
      await expect.element(submitButton).toBeDisabled();
    });

    it('debería habilitar el botón cuando el nombre tiene contenido', async () => {
      // Arrange
      render(CentroCreateForm, { onCancel: vi.fn() });
      
      // Act
      await page.getByPlaceholder('Ej: Centro Calbuco').fill('Centro Nuevo');
      
      // Assert
      await expect.element(page.getByRole('button', { name: 'Guardar' })).toBeEnabled();
    });
  });
});
```

### Qué Testear

| Testear | No Testear |
|---------|------------|
| Lógica de negocio | Código de librerías externas |
| Validaciones | Configuración trivial |
| Manejo de errores | Tipos (TypeScript lo hace) |
| Edge cases | Getters/setters simples |
| Flujos críticos | Código muerto |

### Antipatrones a Evitar

```typescript
// ❌ Mal: Test acoplado a implementación
it('debería llamar db.select con los parámetros correctos', async () => {
  await getCentros(1);
  expect(mockSelect).toHaveBeenCalledWith({ from: expect.any(Function) });
});

// ✅ Bien: Test de comportamiento
it('debería retornar los centros del usuario', async () => {
  mockSelect.mockResolvedValue([{ id: 1, nombre: 'Centro' }]);
  
  const result = await getCentros(1);
  
  expect(result).toHaveLength(1);
  expect(result[0].nombre).toBe('Centro');
});
```

```typescript
// ❌ Mal: Test con múltiples aserciones no relacionadas
it('debería funcionar correctamente', async () => {
  expect(component.exists()).toBe(true);
  expect(component.text()).toBe('Hola');
  expect(component.classes()).toContain('active');
  expect(onClick).toHaveBeenCalled();
});

// ✅ Bien: Tests separados
it('debería renderizar el texto', async () => {
  await expect.element(component).toHaveText('Hola');
});

it('debería tener la clase active', async () => {
  await expect.element(component).toHaveClass('active');
});
```

---

## Troubleshooting

### Error: "Browser not found"

```bash
# Instalar browsers de Playwright
npx playwright install chromium
```

### Error: "Module not found in $app/*"

```bash
# Verificar que los mocks están configurados
# O agregar a vi.mock en el test
vi.mock('$app/forms', () => ({ enhance: vi.fn() }));
```

### Error: "Timeout exceeded"

```typescript
// Aumentar timeout para tests lentos
it('test lento', async () => {
  // ...
}, 10000); // 10 segundos
```

### Tests Flaky

1. Usar `await` consistentemente
2. Evitar `setTimeout` arbitrarios
3. Usar `findBy*` en lugar de `getBy*` para elementos async
4. Verificar que los mocks se limpian en `afterEach`

```typescript
afterEach(() => {
  vi.clearAllMocks();
  // o
  vi.resetAllMocks();
});
```

---

## Referencias

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Svelte Testing](https://svelte.dev/docs/svelte-testing)
- [vitest-browser-svelte](https://github.com/corwinm/ vitest-browser-svelte)
- [Documentación de API](./api.md) - Endpoints a testear
- [Arquitectura](./architecture.md) - Contexto del sistema