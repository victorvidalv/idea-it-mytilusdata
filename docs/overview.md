# Visión General del Proyecto - MytilusData

## Resumen Ejecutivo

**MytilusData** es una plataforma web especializada para la gestión de datos de mitilicultura (cultivo de mejillones). El sistema permite a investigadores y administradores registrar, visualizar y exportar datos de centros de cultivo, ciclos productivos y mediciones ambientales y biológicas.

## Propósito y Objetivos

### Propósito Principal

Proporcionar una herramienta centralizada para la recopilación, análisis y exportación de datos relacionados con la producción de mitílidos, facilitando la toma de decisiones basada en datos.

### Objetivos Específicos

1. **Gestión de Centros de Cultivo**: Administrar ubicaciones geográficas de centros de producción con coordenadas precisas
2. **Control de Ciclos Productivos**: Seguimiento de ciclos desde siembra hasta cosecha
3. **Registro de Mediciones**: Almacenamiento normalizado de mediciones biológicas y ambientales
4. **Visualización de Datos**: Gráficos y mapas para análisis visual
5. **Exportación de Datos**: Generación de reportes en formato Excel
6. **Acceso Programático**: API REST para integración con sistemas externos

## Funcionalidades Principales

### Módulo de Autenticación

- **Magic Links**: Autenticación sin contraseña vía email (Resend)
- **Sesiones JWT**: Tokens con validez de 7 días
- **Rate Limiting**: Protección contra abuso (5 intentos/IP/15min, 3 intentos/email/hora)
- **CAPTCHA**: Verificación con Cloudflare Turnstile

### Módulo de Centros de Cultivo

- Registro de ubicaciones con coordenadas geográficas (latitud/longitud)
- Visualización en mapa interactivo vectorial (MapLibre GL)
- Multi-tenancy: cada usuario ve solo sus propios centros

### Módulo de Ciclos Productivos

- Definición de períodos de cultivo
- Asociación con centros de cultivo
- Estado activo/inactivo

### Módulo de Mediciones (Registros)

- Tipos de registro configurables (talla, biomasa, temperatura, etc.)
- Origen de datos (manual, satelital, PSMB)
- Normalización de unidades
- Notas y observaciones

### Módulo de Gráficos

- Visualización de datos por centro y ciclo
- Gráficos de series temporales
- Filtros dinámicos

### Módulo de Exportación

- Exportación a Excel (XLSX)
- Tres hojas: Centros, Ciclos, Registros
- Formato profesional con estilos

### Módulo de API REST

- Acceso programático vía API Keys
- Endpoints para centros, ciclos, registros y exportación
- Rate limiting diferenciado

## Roles de Usuario

El sistema implementa un modelo de control de acceso basado en roles (RBAC) con tres niveles jerárquicos:

### Jerarquía de Roles

```
ADMIN > INVESTIGADOR > USUARIO
```

### Rol: USUARIO (Nivel 0)

- **Acceso**: Funcionalidades básicas
- **Permisos**:
  - Ver sus propios datos
  - Gestionar su perfil
  - Generar API Keys

### Rol: INVESTIGADOR (Nivel 1)

- **Acceso**: Funcionalidades de investigación
- **Permisos**:
  - Todo lo de USUARIO
  - Dashboard de investigador
  - Acceso a datos de investigación
  - Gráficos avanzados

### Rol: ADMIN (Nivel 2)

- **Acceso**: Administración completa
- **Permisos**:
  - Todo lo de INVESTIGADOR
  - Panel de administración
  - Gestión de usuarios
  - Gestión de tipos de medición
  - Gestión de orígenes de datos
  - Asignación de roles

### Tabla de Permisos por Ruta

| Ruta              | USUARIO | INVESTIGADOR | ADMIN |
| ----------------- | ------- | ------------ | ----- |
| `/dashboard`      | ✅      | ✅           | ✅    |
| `/centros`        | ✅      | ✅           | ✅    |
| `/ciclos`         | ✅      | ✅           | ✅    |
| `/registros`      | ✅      | ✅           | ✅    |
| `/graficos`       | ✅      | ✅           | ✅    |
| `/investigador/*` | ❌      | ✅           | ✅    |
| `/admin/*`        | ❌      | ❌           | ✅    |
| `/perfil`         | ✅      | ✅           | ✅    |

## Tecnologías Utilizadas

### Framework y Runtime

| Tecnología     | Versión  | Propósito                |
| -------------- | -------- | ------------------------ |
| **SvelteKit**  | 2.55.0   | Framework web full-stack |
| **Svelte**     | 5.53.12  | UI reactiva              |
| **TypeScript** | 5.9.3    | Tipado estático          |
| **Vite**       | 8.0.0    | Build tool y dev server  |
| **Node.js**    | 20+      | Runtime                  |

### Base de Datos y ORM

| Tecnología        | Versión | Propósito             |
| ----------------- | ------- | --------------------- |
| **Drizzle ORM**   | 0.45.1  | ORM type-safe         |
| **Neon Database** | 1.0.2   | PostgreSQL serverless |

### UI y Estilos

| Tecnología        | Versión | Propósito        |
| ----------------- | ------- | ---------------- |
| **TailwindCSS**   | 4.1.18  | Framework CSS    |
| **shadcn-svelte** | -       | Componentes UI   |
| **bits-ui**       | 1.8.0   | Primitivos de UI |
| **Lucide Icons**  | 0.575.0 | Iconografía      |

### Visualización y Mapas

| Tecnología       | Versión       | Propósito                  |
| ---------------- | ------------- | -------------------------- |
| **MapLibre GL**  | 5.20.1        | Mapas interactivos vectoriales |
| **svelte-maplibre** | 1.2.6     | Integración Svelte para MapLibre |
| **LayerChart**   | 2.0.0-next.46 | Gráficos                   |
| **D3 Scale**     | 4.0.2         | Escalas para visualización |

### Servicios Externos

| Tecnología               | Propósito                     |
| ------------------------ | ----------------------------- |
| **Resend**               | Envío de emails (Magic Links) |
| **Cloudflare Turnstile** | CAPTCHA                       |

### Testing

| Tecnología     | Versión | Propósito        |
| -------------- | ------- | ---------------- |
| **Vitest**     | 4.0.18  | Testing unitario |
| **Playwright** | 1.58.1  | Testing E2E      |

### Validación y Utilidades

| Tecnología       | Versión | Propósito                    |
| ---------------- | ------- | ---------------------------- |
| **Zod**          | 3.24.4  | Validación de esquemas       |
| **ExcelJS**      | 4.4.0   | Generación de Excel          |
| **jsonwebtoken** | 9.0.3   | Manejo de JWT                |
| **mode-watcher** | 1.1.0   | Tema claro/oscuro            |

## Estructura de Directorios

```
plataforma_idea2025/
├── docs/                          # Documentación del proyecto
│   ├── overview.md               # Este archivo
│   ├── installation.md           # Guía de instalación
│   ├── architecture.md           # Arquitectura del sistema
│   └── api.md                    # Documentación de API
│
├── drizzle/                       # Migraciones de base de datos
│   ├── 0000_sharp_kylun.sql
│   ├── 0001_neat_jane_foster.sql
│   ├── 0002_numerous_secret_warriors.sql
│   ├── 0003_equal_loners.sql
│   └── meta/                     # Metadatos de migraciones
│
├── e2e/                          # Tests end-to-end
│   └── demo.test.ts
│
├── scripts/                      # Scripts de utilidad
│   └── seed.js                   # Poblado y limpieza de BD
│
├── src/                          # Código fuente
│   ├── lib/                      # Librerías compartidas
│   │   ├── components/           # Componentes Svelte
│   │   │   ├── ui/              # Componentes shadcn
│   │   │   ├── layout/          # Header, Sidebar
│   │   │   ├── centros/         # Componentes de centros
│   │   │   ├── ciclos/          # Componentes de ciclos
│   │   │   ├── registros/       # Componentes de registros
│   │   │   ├── graficos/        # Componentes de gráficos
│   │   │   └── auth/            # Componentes de auth
│   │   │
│   │   ├── server/              # Código de servidor
│   │   │   ├── db/              # Esquema y conexión BD
│   │   │   │   ├── schema.ts    # Esquema Drizzle
│   │   │   │   └── index.ts     # Conexión
│   │   │   ├── auth.ts          # Autenticación
│   │   │   ├── rateLimiter.ts   # Rate limiting login
│   │   │   ├── apiRateLimiter.ts # Rate limiting API
│   │   │   ├── captcha.ts       # Verificación CAPTCHA
│   │   │             └── audit.ts         # Registro de auditoría
│   │   │
│   │   ├── hooks/               # Hooks personalizados
│   │   ├── assets/              # Recursos estáticos
│   │   ├── validations/         # Esquemas Zod para validación
│   │   │   └── index.ts         # Esquemas y helpers de validación
│   │   ├── utils.ts             # Utilidades generales
│   │   └── index.ts             # Exports públicos
│   │
│   ├── routes/                   # Rutas SvelteKit
│   │   ├── (app)/               # Grupo de rutas autenticadas
│   │   │   ├── admin/           # Panel de administración
│   │   │   │   ├── usuarios/    # Gestión de usuarios
│   │   │   │   ├── origenes/    # Orígenes de datos
│   │   │   │   └── tipos-medicion/ # Tipos de medición
│   │   │   │
│   │   │   ├── investigador/    # Panel de investigador
│   │   │   │   ├── dashboard/   # Dashboard investigador
│   │   │   │   ├── centros/     # Centros (vista investigador)
│   │   │   │   ├── ciclos/      # Ciclos (vista investigador)
│   │   │   │   ├── registros/   # Registros (vista investigador)
│   │   │   │   └── graficos/    # Gráficos (vista investigador)
│   │   │   │
│   │   │   ├── dashboard/       # Dashboard general
│   │   │   ├── centros/         # Gestión de centros
│   │   │   ├── ciclos/          # Gestión de ciclos
│   │   │   ├── registros/       # Gestión de registros
│   │   │   ├── graficos/        # Visualización gráfica
│   │   │   └── perfil/          # Perfil de usuario
│   │   │       └── api-keys/    # Gestión de API keys
│   │   │
│   │   ├── api/                 # Endpoints REST
│   │   │   ├── centros/         # API de centros
│   │   │   ├── ciclos/          # API de ciclos
│   │   │   ├── registros/       # API de registros
│   │   │   └── export-data/     # API de exportación
│   │   │
│   │   ├── auth/                # Autenticación
│   │   │   ├── login/           # Página de login
│   │   │   ├── logout/          # Endpoint de logout
│   │   │   └── callback/        # Callback de magic link
│   │   │
│   │   ├── acerca-de/           # Acerca de
│   │   ├── condiciones-servicios/ # Términos de servicio
│   │   ├── +layout.svelte       # Layout raíz
│   │   ├── +page.svelte         # Página de inicio
│   │   └── layout.css           # Estilos globales
│   │
│   ├── __tests__/               # Tests de integración
│   │   └── api/                 # Tests de API
│   │
│   ├── app.d.ts                 # Tipos de SvelteKit
│   ├── app.html                 # Template HTML
│   └── hooks.server.ts          # Hooks de servidor
│
├── static/                       # Archivos estáticos
│   └── robots.txt
│
├── .env.example                  # Variables de entorno (ejemplo)
├── drizzle.config.ts            # Configuración Drizzle
├── package.json                 # Dependencias y scripts
├── svelte.config.js             # Configuración SvelteKit
├── tsconfig.json                # Configuración TypeScript
├── vite.config.ts               # Configuración Vite
├── eslint.config.js             # Configuración ESLint
├── playwright.config.ts         # Configuración Playwright
└── README.md                    # README del proyecto
```

## Convenciones de Nomenclatura

### Archivos

- **Componentes Svelte**: PascalCase (ej: `DataTable.svelte`)
- **Utilidades**: camelCase (ej: `rateLimiter.ts`)
- **Rutas**: kebab-case (ej: `tipos-medicion/`)

### Base de Datos

- **Tablas**: snake_case plural (ej: `rate_limit_logs`)
- **Columnas**: snake_case (ej: `fecha_medicion`)

### Código

- **Variables/Funciones**: camelCase
- **Clases/Tipos/Interfaces**: PascalCase
- **Constantes**: UPPER_SNAKE_CASE

## Próximos Pasos

Para continuar con la implementación o configuración:

1. Consultar [installation.md](./installation.md) para instrucciones de instalación
2. Revisar [architecture.md](./architecture.md) para entender la arquitectura del sistema
3. Ver [api.md](./api.md) para documentación de la API REST
4. Consultar [database.md](./database.md) para detalles del esquema de base de datos
5. Revisar [security.md](./security.md) para aspectos de seguridad

## Documentación Adicional

| Documento | Descripción |
| --------- | ----------- |
| [components.md](./components.md) | Catálogo de componentes reutilizables |
| [testing.md](./testing.md) | Guía de testing unitario y E2E |
| [user-guide.md](./user-guide.md) | Manual de usuario para operadores |
| [faq.md](./faq.md) | Preguntas frecuentes |
| [runbook.md](./runbook.md) | Guía de operación y troubleshooting |
| [modelado-predictivo.md](./modelado-predictivo.md) | Documentación del modelo predictivo |
