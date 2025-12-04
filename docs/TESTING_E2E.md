# 🎭 Pruebas End-to-End (E2E) con Playwright

## Descripción General

Las pruebas E2E validan flujos completos de usuario desde el navegador, simulando interacciones reales con la aplicación. Son fundamentales para detectar regresiones en la integración de componentes.

## ¿Qué es Playwright?

**Playwright** es un framework de automatización de navegadores desarrollado por Microsoft. Permite ejecutar pruebas en Chromium, Firefox y WebKit con una API unificada, garantizando compatibilidad cross-browser.

### Ventajas de Playwright

| Característica | Descripción |
|----------------|-------------|
| **Auto-waiting** | Espera automática a que los elementos estén listos antes de interactuar |
| **Aislamiento de contexto** | Cada test se ejecuta en un contexto limpio de navegador |
| **Selectores inteligentes** | Soporte para roles ARIA, texto visible, data-testid y CSS |
| **Trazas y debugging** | Genera reportes HTML interactivos con capturas de pantalla y videos |
| **Ejecución paralela** | Tests se ejecutan en paralelo para optimizar tiempos de CI/CD |
| **Web Server integrado** | Inicia automáticamente el servidor de desarrollo antes de los tests |

---

## Configuración del Proyecto

### Archivo de configuración: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        locale: 'es-CL',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'E2E_TEST=true npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        env: {
            E2E_TEST: 'true',
        },
    },
});
```

---

## Suite de Tests E2E

La suite incluye **9 archivos de especificación** que cubren todos los módulos principales:

### 1. `auth.spec.ts` - Autenticación
- ✅ Registro de nuevos usuarios con validación de formulario
- ✅ Login con credenciales de administrador del sistema
- ✅ Manejo de errores con credenciales inválidas
- ✅ Espera de token CSRF antes de habilitar formularios

### 2. `ciclos.spec.ts` - Ciclos de Cultivo
- ✅ Flujo completo CRUD: Crear → Editar → Eliminar ciclo
- ✅ Selección de lugar mediante componentes Radix UI
- ✅ Manejo de switches para estado activo/inactivo
- ✅ Verificación de persistencia en tabla de datos

### 3. `lugares.spec.ts` - Centros de Cultivo
- ✅ Creación de lugares con interacción de mapa Leaflet
- ✅ Selección de coordenadas mediante clic en el mapa
- ✅ Validación de que coordenadas se actualicen (no "Pendiente...")
- ✅ Diálogos de confirmación nativa para eliminación

### 4. `mediciones.spec.ts` - Registros de Mediciones
- ✅ Creación de mediciones con todos los campos requeridos
- ✅ Selección de: Lugar, Ciclo, Origen, Unidad, Tipo de Registro
- ✅ Edición de valores y notas
- ✅ Verificación de actualizaciones en tiempo real

### 5. `unidades.spec.ts` - Unidades de Medida
- ✅ Gestión de unidades desde Configuración
- ✅ Creación con nombre y símbolo (e.g., "kg", "PW")
- ✅ Validación de campos obligatorios

### 6. `usuarios.spec.ts` - Gestión de Usuarios
- ✅ Creación de usuarios con asignación de rol
- ✅ Cambio de rol dinámico (EQUIPO → ADMIN)
- ✅ Activación/Desactivación de cuentas
- ✅ Verificación de badges de estado (ACTIVO/INACTIVO)

### 7. `configuracion.spec.ts` - Configuración Avanzada
- ✅ Gestión de Tipos de Registro (código + descripción)
- ✅ Gestión de Orígenes de Datos
- ✅ Creación de API Keys con permisos granulares
- ✅ Verificación de generación de claves (prefijo `myt_`)

### 8. `analisis.spec.ts` - Análisis de Datos
- ✅ Carga de página de análisis
- ✅ Verificación de componentes de configuración de gráfico
- ✅ Elementos UI del módulo de visualización

### 9. `api-docs.spec.ts` - Documentación API
- ✅ Acceso restringido a administradores
- ✅ Verificación de secciones: Inicio Rápido, Autenticación, Endpoints
- ✅ Navegación por tabs de endpoints (Ciclos, Unidades)
- ✅ Ejemplos de código en Python disponibles

---

## Patrones de Testing Implementados

### Función de Login Reutilizable

Todos los tests que requieren autenticación usan una función helper `loginAsAdmin()`:

```typescript
async function loginAsAdmin(page: Page) {
    await page.goto('/login');

    // Esperar a que el formulario esté listo (CSRF token)
    const loginButton = page.getByRole('button', { name: 'Entrar al Sistema' });
    await expect(loginButton).toBeEnabled({ timeout: 10000 });

    await page.locator('#login-email').fill(process.env.E2E_ADMIN_EMAIL || 'admin@example.com');
    await page.locator('#login-password').fill(process.env.E2E_ADMIN_PASSWORD || 'password');
    await loginButton.click();

    // Esperar redirección con timeout extendido
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
}
```

### Estrategia de Selectores

| Tipo | Ejemplo | Uso |
|------|---------|-----|
| **Roles ARIA** | `getByRole('button', { name: 'Crear' })` | Botones, tabs, links |
| **IDs de formulario** | `page.locator('#nombre')` | Inputs específicos |
| **Texto visible** | `page.getByText('Centro de Pruebas')` | Verificaciones de contenido |
| **Filtrado de filas** | `page.locator('tr').filter({ hasText: uniqueName })` | Tablas de datos |

---

## Comandos de Ejecución

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar tests con UI de Playwright (debugging)
npx playwright test --ui

# Ejecutar un archivo específico
npx playwright test auth.spec.ts

# Ejecutar tests en modo headed (ver navegador)
npx playwright test --headed

# Ver reporte HTML del último run
npx playwright show-report

# Actualizar snapshots si hay cambios visuales
npx playwright test --update-snapshots
```

---

## Variables de Entorno para E2E

```bash
# Variables opcionales para tests E2E
E2E_ADMIN_EMAIL=admin@tudominio.com
E2E_ADMIN_PASSWORD=tu_password_seguro

# Flag para activar modo de prueba (usado en playwright.config.ts)
E2E_TEST=true
```

---

## Estructura de Reportes

| Directorio | Contenido |
|------------|-----------|
| `playwright-report/` | Reportes HTML interactivos |
| `test-results/` | Trazas, screenshots y videos de tests fallidos |

> 💡 **Tip:** Los reportes HTML incluyen un panel interactivo donde puedes ver cada paso del test, inspeccionar selectores, y ver capturas de pantalla en cada interacción.

---

## Mejores Prácticas Implementadas

1. **Nombres únicos con timestamp:** Cada test genera identificadores únicos para evitar colisiones
2. **Limpieza automática:** Los tests CRUD eliminan los recursos que crean
3. **Timeouts explícitos:** Timeouts extendidos para operaciones asíncronas (10-15s)
4. **beforeEach hook:** Cada suite usa hooks para asegurar estado limpio
5. **Manejo de diálogos:** Configuración de listeners para confirmaciones nativas
6. **Verificaciones dobles:** Se verifica tanto la visibilidad como la desaparición de elementos

---

## Integración con CI/CD

El archivo de configuración está preparado para CI:

```typescript
// En CI: reintentos, worker único, fail en test.only
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : undefined,
```

---

📅 **Última actualización:** 15 de Enero de 2026
