# Guía de Contribución - MytilusData

**Audiencia:** Desarrolladores, nuevos integrantes, contribuidores externos

---

## Propósito

Este documento establece las normas y procedimientos para contribuir al proyecto MytilusData. Define el flujo de trabajo, estándares de código y proceso de revisión para mantener calidad y consistencia.

---

## Código de Conducta

Al participar en este proyecto, aceptas mantener un ambiente respetuoso e inclusivo. Se espera:

- Respeto hacia todos los participantes
- Aceptación de críticas constructivas
- Enfoque en lo que es mejor para la comunidad
- Tolerancia hacia diferentes puntos de vista

Comportamientos inaceptables serán motivo de exclusión del proyecto.

---

## Configuración del Entorno de Desarrollo

### Prerrequisitos

- Node.js 20+ (recomendado usar LTS)
- npm 10+
- PostgreSQL con PostGIS (o cuenta Neon Serverless)
- Cuenta en Resend (para emails de desarrollo)
- Cuenta en Cloudflare Turnstile (para CAPTCHA)

### Instalación

1. **Clonar el repositorio:**

```bash
git clone <url-del-repositorio>
cd idea-it-mytilusdata
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Configurar variables de entorno:**

```bash
cp .env.example .env
```

Editar `.env` con los valores correspondientes:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL de conexión PostgreSQL |
| `RESEND_API_KEY` | API key de Resend |
| `JWT_SECRET` | Secreto para JWT (generar con `openssl rand -hex 32`) |
| `EMAIL_FROM` | Email remitente para magic links |
| `INITIAL_ADMIN_EMAIL` | Email del administrador inicial |
| `TURNSTILE_SECRET_KEY` | Clave secreta de Cloudflare Turnstile |
| `PUBLIC_TURNSTILE_SITE_KEY` | Clave pública de Cloudflare Turnstile |

4. **Inicializar base de datos:**

```bash
npm run db:push
npm run poblar  # Datos de prueba opcionales
```

5. **Iniciar servidor de desarrollo:**

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Flujo de Trabajo Git

### Branches

| Branch | Propósito |
|--------|-----------|
| `main` | Código en producción |
| `develop` | Integración de features |
| `feature/*` | Nuevas funcionalidades |
| `fix/*` | Corrección de bugs |
| `docs/*` | Cambios de documentación |

### Crear una Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/mi-nueva-funcionalidad
```

### Convenciones de Nombres

- `feature/nombre-descriptivo` - Nuevas funcionalidades
- `fix/descripcion-del-bug` - Corrección de errores
- `docs/que-se-documenta` - Cambios en documentación
- `refactor/componente-o-modulo` - Refactorización
- `test/que-se-prueba` - Nuevos tests

---

## Convenciones de Commits

### Formato

```
<tipo>(<alcance>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos

| Tipo | Descripción |
|------|-------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Cambios en documentación |
| `style` | Formato, punto y coma, etc. (sin cambio de lógica) |
| `refactor` | Refactorización sin cambio de comportamiento |
| `test` | Añadir o modificar tests |
| `chore` | Tareas de mantenimiento |
| `perf` | Mejoras de rendimiento |

### Alcances Comunes

- `auth` - Autenticación y autorización
- `api` - Endpoints API
- `db` - Base de datos y migraciones
- `ui` - Componentes de interfaz
- `centros` - Módulo de centros de cultivo
- `ciclos` - Módulo de ciclos
- `mediciones` - Módulo de mediciones

### Ejemplos

```bash
feat(api): añadir endpoint de exportación Excel
fix(auth): corregir validación de sesión expirada
docs(database): documentar tabla de mediciones
refactor(ui): extraer lógica de DataGrid a utilidades
test(centros): añadir tests para CentroCreateForm
```

---

## Estándares de Código

Los estándares completos de calidad están documentados en [`docs/code-quality-standards.md`](./docs/code-quality-standards.md).

### Métricas y Umbrales Obligatorios

| Métrica | Límite | Excepción |
|---------|--------|-----------|
| Líneas por archivo | < 200 | Tests: < 300 |
| Complejidad ciclomática | < 10 | - |
| Código duplicado | < 3% | - |
| Funciones por archivo | < 10 | - |

### TypeScript

- **Tipado estricto:** Usar tipos explícitos, evitar `any`
- **Interfaces:** Preferir `interface` sobre `type` para objetos
- **Null safety:** Usar optional chaining (`?.`) y nullish coalescing (`??`)

### Svelte

- **Runes:** Usar `$state`, `$derived`, `$effect` (Svelte 5)
- **Props:** Tipar con `$props<T>()`
- **Eventos:** Usar `onclick` en lugar de `on:click`
- **Comentarios:** En español, explicando intención

### Estructura de Archivos

```
componente/
├── Componente.svelte        # Componente principal
├── Componente.svelte.test.ts # Tests del componente
├── componente-utils.ts      # Utilidades extraídas
└── types.ts                 # Tipos específicos (si aplica)
```

### Validación de Calidad

Ejecutar validación antes de cada PR:

```bash
# Verificar linting
npm run lint

# Verificar formateo
npm run format

# Verificar tipos
npm run check

# Ejecutar tests
npm run test:unit

# Análisis de calidad Svelte
npx svelteqa src/lib/components

# Análisis de calidad TypeScript
npx tsskill src/lib/server
```

### ESLint

El proyecto usa ESLint con configuración estricta. Verificar antes de commit:

```bash
npm run lint
```

### Prettier

Formatear código antes de commit:

```bash
npm run format
```

**Configuración:**
- Tabs en lugar de espacios
- Comillas simples
- Sin trailing commas
- Ancho de línea: 100 caracteres

---

## Testing

### Ejecutar Tests

```bash
# Tests unitarios
npm run test:unit

# Tests E2E
npm run test:e2e

# Todos los tests
npm run test
```

### Tipos de Tests

| Tipo | Framework | Ubicación |
|------|-----------|-----------|
| Unitarios | Vitest | `**/*.test.ts` |
| Componentes | Vitest + Playwright | `**/*.svelte.test.ts` |
| E2E | Playwright | `e2e/**/*.test.ts` |

### Cobertura

Los tests deben cubrir:
- Lógica de negocio en servicios
- Validaciones de formularios
- Endpoints de API
- Componentes críticos de UI

---

## Estructura de Pull Requests

### Título

Usar el mismo formato que los commits:

```
feat(modulo): descripción breve del cambio
```

### Descripción

```markdown
## Qué cambia
- Descripción de los cambios principales
- Lista de archivos o módulos afectados

## Por qué
- Contexto y motivación del cambio
- Problema que resuelve

## Cómo probar
1. Pasos para verificar el cambio
2. Casos de prueba específicos

## Checklist
- [ ] Tests pasan localmente
- [ ] Lint sin errores
- [ ] Documentación actualizada (si aplica)
- [ ] Migraciones generadas (si aplica)
```

### Tamaño

- **Ideal:** < 400 líneas de código
- **Máximo recomendado:** 800 líneas
- Si excede, considerar dividir en múltiples PRs

---

## Proceso de Review

### Antes de Solicitar Review

1. Verificar que CI pasa
2. Auto-revisar los cambios
3. Asegurar que la descripción está completa
4. Responder a comentarios de bot automatizados

### Durante el Review

- Responder a todos los comentarios
- Hacer cambios solicitados en commits separados
- Marcar conversaciones como resueltas

### Criterios de Aprobación

- [ ] Código sigue estándares del proyecto
- [ ] Tests cubren nueva funcionalidad
- [ ] No hay regresiones en tests existentes
- [ ] Documentación actualizada
- [ ] Sin vulnerabilidades de seguridad

### Merge

Solo mantenedores pueden hacer merge. Se usa **squash and merge** para mantener historial limpio.

---

## Reportar Bugs

### Antes de Reportar

1. Verificar que el bug existe en la última versión
2. Buscar en issues existentes
3. Reproducir el bug localmente

### Template de Bug Report

```markdown
**Descripción**
Descripción clara del bug.

**Pasos para reproducir**
1. Ir a '...'
2. Hacer clic en '...'
3. Ver error

**Comportamiento esperado**
Qué debería ocurrir.

**Comportamiento actual**
Qué ocurre en su lugar.

**Capturas de pantalla**
Si aplica, añadir capturas.

**Entorno**
- OS: [ej: macOS 14]
- Navegador: [ej: Chrome 120]
- Versión: [ej: 0.0.1]

**Contexto adicional**
Cualquier otra información relevante.
```

---

## Proponer Features

### Antes de Proponer

1. Verificar que no exista una propuesta similar
2. Considerar si está alineado con el roadmap del proyecto
3. Evaluar complejidad y alcance

### Template de Feature Request

```markdown
**Problema**
Descripción del problema que resolvería la feature.

**Solución propuesta**
Descripción de la solución deseada.

**Alternativas consideradas**
Otras soluciones que se hayan considerado.

**Contexto adicional**
Capturas, mockups, referencias a otras aplicaciones.

**Impacto**
- Usuarios afectados: [todos / específicos]
- Módulos involucrados: [lista]
- Breaking changes: [sí / no]
```

---

## Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Verificar con ESLint |
| `npm run format` | Formatear con Prettier |
| `npm run check` | Verificar tipos TypeScript |
| `npm run test:unit` | Tests unitarios |
| `npm run test:e2e` | Tests E2E |
| `npm run db:generate` | Generar migración |
| `npm run db:push` | Aplicar schema a BD |
| `npm run db:studio` | Abrir Drizzle Studio |
| `npm run poblar` | Poblar datos de prueba |
| `npm run create-admin` | Crear usuario admin |

---

## Recursos

- [Estándares de Calidad de Código](./docs/code-quality-standards.md) - Métricas, principios y proceso de validación
- [Informe de Calidad](./docs/informe-calidad-codigo.md) - Análisis actual del proyecto
- [Documentación de Arquitectura](./docs/architecture.md)
- [Guía de Instalación](./docs/installation.md)
- [Documentación de API](./docs/api.md)
- [Esquema de Base de Datos](./docs/database.md)
- [SvelteKit Docs](https://svelte.dev/docs/kit)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)

---

## Contacto

Para dudas o sugerencias sobre contribución:
- Abrir un issue en el repositorio
- Contactar a los mantenedores del proyecto