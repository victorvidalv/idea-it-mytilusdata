# Informe Técnico - Análisis del Proyecto MytilusData

**Fecha:** 2026-03-19  
**Versión:** 1.0  
**Autor:** Análisis automatizado

---

## 1. Resumen Ejecutivo

**MytilusData** es una plataforma SaaS (Software as a Service) diseñada para optimizar la toma de decisiones en el cultivo de *Mytilus chilensis* (chorito/mejillón) en la Región de Los Lagos, Chile. El proyecto combina:

- **Captura estandarizada de datos** de muestreo (talla, peso, densidad) y variables ambientales
- **Modelado predictivo sigmoidal** (Gompertz, Logística, von Bertalanffy) para proyecciones de biomasa
- **Visualización interactiva** de tendencias y comparativas entre centros de cultivo
- **API RESTful** para integración con sistemas externos

### Contexto de Negocio

El proyecto surge como respuesta a la brecha tecnológica en el sector mitilicultor chileno (segundo productor mundial de mejillones), donde el 99% de la producción se concentra en la Región de Los Lagos. La plataforma está diseñada para servir tanto a grandes empresas como a PYMES, con un modelo Freemium que democratiza el acceso a herramientas de análisis predictivo.

### Estado del Proyecto

- **TRL Objetivo:** 6 (Modelo de sistema o subsistema o demostración de prototipo en un entorno relevante)
- **Financiamiento:** Subsidio ANID con cofinanciamiento de socios (Apiao, Sudmaris)
- **Entidades involucradas:** Universidad Santo Tomás, INTEMIT, AmiChile, Sindicato de Pescadores de Huito, Geomar S.A., St. Andrews Smoky Delicacies S.A.

---

## 2. Stack Tecnológico Completo

### 2.1 Framework y Runtime

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Framework | SvelteKit | 2.55.0 |
| Runtime | Node.js | - |
| Lenguaje | TypeScript | 5.9.3 |
| UI Framework | Svelte 5 | 5.53.12 |

### 2.2 Base de Datos

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Base de datos | PostgreSQL (Neon Serverless) | Almacenamiento principal |
| Extensión espacial | PostGIS | Operaciones geográficas |
| ORM | Drizzle ORM | Mapeo objeto-relacional |
| Migraciones | Drizzle Kit | Control de versiones de esquema |

### 2.3 Frontend y UI

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Estilos | Tailwind CSS 4 | Framework de utilidades CSS |
| Componentes UI | bits-ui | Componentes primitivos accesibles |
| Iconos | Lucide Svelte | Sistema de iconos |
| Gráficos | LayerChart | Visualización de datos |
| Mapas | MapLibre GL + svelte-maplibre | Visualización geoespacial |
| Data Grid | wx-svelte-grid | Tablas de datos editables |
| Notificaciones | svelte-sonner | Toast notifications |
| Tema | mode-watcher | Modo claro/oscuro |

### 2.4 Servicios y APIs

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Email | Resend | Envío de magic links |
| Autenticación | JWT (jsonwebtoken) | Sesiones stateless |
| Validación | Zod | Validación de esquemas |
| Exportación | ExcelJS | Generación de archivos Excel |
| Modelado ML | ml-levenberg-marquardt | Ajuste de curvas sigmoidales |

### 2.5 Herramientas de Desarrollo y Testing

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Build | Vite 8 | Bundler y servidor de desarrollo |
| Testing Unitario | Vitest 4 | Tests de componentes y lógica |
| Testing E2E | Playwright | Tests de integración |
| Linting | ESLint | Calidad de código |
| Formateo | Prettier | Estilo de código |
| Type Checking | svelte-check | Verificación de tipos Svelte |

### 2.6 Despliegue

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Plataforma | Vercel | Hosting y serverless functions |
| Adapter | @sveltejs/adapter-vercel | Optimización para Vercel |

---

## 3. Arquitectura de la Aplicación

### 3.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENTE (Browser)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Páginas   │  │ Componentes │  │   Stores    │  │   Utils     │    │
│  │  SvelteKit  │  │   Svelte    │  │   Runes     │  │  Cliente    │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼───────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        SVELTEKIT SERVER                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     hooks.server.ts                              │   │
│  │  • Auth Guard (sesiones JWT)                                     │   │
│  │  • Route Protection (RBAC)                                       │   │
│  │  • Security Headers                                               │   │
│  │  • API Authentication                                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐               │
│  │   Rutas Web   │  │  Rutas API    │  │ Server Actions │               │
│  │  +page.svelte │  │  +server.ts   │  │  +page.server  │               │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘               │
└──────────┼──────────────────┼──────────────────┼────────────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CAPA DE SERVICIOS                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Auth     │  │  Centros    │  │   Ciclos    │  │  Registros  │    │
│  │  Service    │  │  Service    │  │  Service    │  │  Service    │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Rate Limiter│  │   Audit     │  │ Biblioteca  │  │  Tipos      │    │
│  │  Service    │  │  Service    │  │  Service    │  │ Medición    │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
└─────────┼────────────────┼────────────────┼────────────────┼───────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        CAPA DE DATOS                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Drizzle ORM                                  │   │
│  │  • Schema definitions                                            │   │
│  │  • Query builder                                                 │   │
│  │  • Relations                                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL + PostGIS (Neon Serverless)              │   │
│  │  • usuarios, sesiones, magic_link_tokens                         │   │
│  │  • lugares (con geometry), ciclos                                │   │
│  │  • mediciones, tipos_registro, origen_datos                      │   │
│  │  • biblioteca, api_keys, audit_logs                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Patrones de Diseño Utilizados

1. **Arquitectura en Capas:** Separación clara entre presentación, lógica de negocio y acceso a datos
2. **Multi-tenancy:** Aislamiento de datos por usuario mediante `userId` en todas las tablas productivas
3. **Repository Pattern:** Módulos de servicio encapsulan consultas y mutaciones
4. **Server Actions:** Formularios con acciones del servidor para mutaciones
5. **RBAC (Role-Based Access Control):** Tres niveles de acceso: USUARIO, INVESTIGADOR, ADMIN

### 3.3 Estructura de Directorios

```
src/
├── lib/
│   ├── components/          # Componentes Svelte reutilizables
│   │   ├── auth/           # Componentes de autenticación
│   │   ├── centros/        # Gestión de centros de cultivo
│   │   ├── ciclos/         # Gestión de ciclos productivos
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── datagrid/       # Componentes de tabla reutilizables
│   │   ├── graficos/       # Visualización de datos
│   │   ├── layout/         # Header, Sidebar
│   │   ├── legal/          # Términos y condiciones
│   │   ├── origenes/       # Gestión de orígenes de datos
│   │   ├── perfil/         # Perfil de usuario
│   │   └── ...
│   ├── server/             # Código del servidor
│   │   ├── auth/           # Autenticación y sesiones
│   │   ├── centros/        # Lógica de centros
│   │   ├── ciclos/         # Lógica de ciclos
│   │   ├── db/             # Esquemas y conexión DB
│   │   ├── hooks/          # Hooks de autorización
│   │   ├── rate-limiter/   # Control de tasa
│   │   ├── registros/      # Lógica de mediciones
│   │   └── ...
│   └── utils.ts            # Utilidades cliente
├── routes/
│   ├── (app)/              # Rutas protegidas (grupo)
│   │   ├── admin/          # Panel de administración
│   │   ├── centros/        # Gestión de centros
│   │   ├── ciclos/         # Gestión de ciclos
│   │   ├── dashboard/      # Dashboard principal
│   │   ├── graficos/       # Visualización
│   │   ├── investigador/   # Vista de investigador
│   │   ├── perfil/         # Perfil y API keys
│   │   └── registros/      # Mediciones
│   ├── api/                # Endpoints REST
│   ├── auth/               # Autenticación
│   └── ...
├── __tests__/              # Tests unitarios y de integración
└── hooks.server.ts         # Middleware global
```

---

## 4. Modelo de Datos

### 4.1 Diagrama Entidad-Relación

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SISTEMA DE AUTENTICACIÓN                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐       ┌──────────────────┐       ┌──────────────┐    │
│  │   usuarios   │──1:N──│ magicLinkTokens  │       │  sesiones    │    │
│  │──────────────│       │──────────────────│       │──────────────│    │
│  │ id (PK)      │       │ id (PK)          │       │ id (PK)      │    │
│  │ nombre       │       │ tokenHash        │       │ userId (FK)  │    │
│  │ email (UQ)   │       │ userId (FK)      │       │ tokenHash    │    │
│  │ rol (ENUM)   │       │ expiresAt        │       │ userAgent    │    │
│  │ activo       │       │ usedAt           │       │ ip           │    │
│  │ createdAt    │       │ createdAt        │       │ expiresAt    │    │
│  └──────┬───────┘       └──────────────────┘       │ invalidatedAt│    │
│         │                                          └──────────────┘    │
│         │                                          (relación 1:N)       │
│         │                                                               │
└─────────┼───────────────────────────────────────────────────────────────┘
          │
          │ (Multi-tenancy: userId en todas las tablas productivas)
          │
┌─────────┼───────────────────────────────────────────────────────────────┐
│         │              ESTRUCTURA PRODUCTIVA                              │
├─────────┼───────────────────────────────────────────────────────────────┤
│         │                                                                │
│         │     ┌──────────────┐       ┌──────────────┐                   │
│         │     │   lugares    │──1:N──│    ciclos    │                   │
│         │     │──────────────│       │──────────────│                   │
│         └────▶│ id (PK)      │       │ id (PK)      │                   │
│               │ nombre       │       │ nombre       │                   │
│               │ geom (PostGIS│       │ fechaSiembra │                   │
│               │ latitud      │       │ fechaFinaliz │                   │
│               │ longitud     │       │ lugarId (FK) │                   │
│               │ userId (FK)  │       │ userId (FK)  │                   │
│               │ createdAt    │       │ activo       │                   │
│               └──────┬───────┘       └──────┬───────┘                   │
│                      │                      │                            │
│                      │                      │                            │
│                      ▼                      ▼                            │
│               ┌──────────────────────────────────┐                      │
│               │           mediciones              │                      │
│               │──────────────────────────────────│                      │
│               │ id (PK)                          │                      │
│               │ valor                            │                      │
│               │ fechaMedicion                    │                      │
│               │ cicloId (FK, nullable)           │                      │
│               │ lugarId (FK)                     │                      │
│               │ userId (FK)                      │                      │
│               │ tipoId (FK)                      │                      │
│               │ origenId (FK)                    │                      │
│               │ notas                            │                      │
│               │ createdAt                        │                      │
│               └──────────────────────────────────┘                      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                         TABLAS MAESTRAS                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐                    ┌──────────────┐                    │
│  │ tiposRegistro│                    │ origenDatos  │                    │
│  │──────────────│                    │──────────────│                    │
│  │ id (PK)      │                    │ id (PK)      │                    │
│  │ codigo (UQ)  │──┐                 │ nombre       │                    │
│  │ unidadBase   │  │                 └──────────────┘                    │
│  └──────────────┘  │                        ▲                            │
│         │          │                        │                            │
│         └──────────┼────────────────────────┘                            │
│                    │                                                      │
│                    │ (referenciados por mediciones)                       │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                      BIBLIOTECA DE PARÁMETROS                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────┐                                                    │
│  │    biblioteca    │                                                    │
│  │──────────────────│                                                    │
│  │ id (PK)          │                                                    │
│  │ codigoReferencia │                                                    │
│  │ cicloId (FK)     │───────▶ ciclos                                     │
│  │ puntosJson (JSON)│  {dia: talla}                                      │
│  │ parametrosCalcul │  {L, k, x0, r2}                                    │
│  │ formulaTipo      │  LOGISTICO, GOMPERTZ, VON_BERTALANFFY              │
│  │ metadatos (JSON) │                                                    │
│  │ userId (FK)      │                                                    │
│  │ createdAt        │                                                    │
│  │ updatedAt        │                                                    │
│  └──────────────────┘                                                    │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                         SEGURIDAD Y AUDITORÍA                             │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │consentimientos│ │   apiKeys    │  │rateLimitLogs │  │ auditLogs    │ │
│  │──────────────│ │──────────────│  │──────────────│  │──────────────│ │
│  │ id (PK)      │ │ id (PK)      │  │ id (PK)      │  │ id (PK)      │ │
│  │ userId (FK)  │ │ key (UQ)     │  │ identifier   │  │ userId       │ │
│  │ versionDoc   │ │ userId (UQ,  │  │ tipo (ENUM)  │  │ action       │ │
│  │ fechaAceptac │ │   FK)        │  │ createdAt    │  │ entityType   │ │
│  │ ipOrigen     │ │ createdAt    │  └──────────────┘  │ entityId     │ │
│  └──────────────┘ └──────────────┘                    │ metadata      │ │
│                                                        │ createdAt     │ │
│                                                        └──────────────┘ │
│                                                                           │
│  ┌──────────────┐                                                        │
│  │emailCooldowns│                                                        │
│  │──────────────│                                                        │
│  │ id (PK)      │                                                        │
│  │ email (UQ)   │                                                        │
│  │ lastSentAt   │                                                        │
│  └──────────────┘                                                        │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Descripción de Entidades Principales

#### Autenticación y Usuarios

| Tabla | Propósito |
|-------|-----------|
| `usuarios` | Usuarios del sistema con roles (ADMIN, INVESTIGADOR, USUARIO) |
| `sesiones` | Sesiones activas con JWT, permite invalidación |
| `magic_link_tokens` | Tokens para autenticación passwordless vía email |
| `api_keys` | Claves API para acceso programático (una por usuario) |

#### Estructura Productiva

| Tabla | Propósito |
|-------|-----------|
| `lugares` | Centros de cultivo con ubicación geográfica (PostGIS) |
| `ciclos` | Períodos de cultivo desde siembra hasta cosecha |
| `mediciones` | Datos de muestreo (talla, biomasa, temperatura, etc.) |

#### Tablas Maestras

| Tabla | Propósito |
|-------|-----------|
| `tipos_registro` | Catálogo de tipos de medición con unidad base |
| `origen_datos` | Origen de los datos (Manual, Satelital, PSMB) |

#### Modelado Predictivo

| Tabla | Propósito |
|-------|-----------|
| `biblioteca` | Parámetros de curvas sigmoidales ajustadas por ciclo |

#### Seguridad

| Tabla | Propósito |
|-------|-----------|
| `consentimientos` | Registro legal de aceptación de términos |
| `rate_limit_logs` | Control de intentos de login |
| `email_cooldowns` | Prevención de spam de magic links |
| `audit_logs` | Trazabilidad de acciones del sistema |

---

## 5. Endpoints API Documentados

### 5.1 Autenticación

Todos los endpoints API requieren autenticación mediante:
- **Sesión activa** (cookie JWT), o
- **API Key** (header `Authorization: Bearer <api_key>`)

### 5.2 Endpoints Disponibles

#### GET /api/centros

**Propósito:** Listar centros de cultivo del usuario autenticado

**Autenticación:** API Key o sesión

**Query Parameters:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | int | 1 | Número de página |
| `limit` | int | 10 | Registros por página (max 100) |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Centro Norte",
      "latitud": -41.1234,
      "longitud": -72.5678,
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Headers de Rate Limiting:**
- `X-RateLimit-Limit`: Límite total
- `X-RateLimit-Remaining`: Solicitudes restantes
- `X-RateLimit-Reset`: Timestamp de reset

---

#### GET /api/ciclos

**Propósito:** Listar ciclos de cultivo del usuario autenticado

**Autenticación:** API Key o sesión

**Query Parameters:** Igual que `/api/centros`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Siembra Primavera 2025",
      "fechaSiembra": "2025-09-01",
      "fechaFinalizacion": null,
      "lugarId": 1,
      "activo": true
    }
  ],
  "pagination": { ... }
}
```

---

#### GET /api/registros

**Propósito:** Listar mediciones del usuario autenticado

**Autenticación:** API Key o sesión

**Query Parameters:** Igual que `/api/centros`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "valor": 45.5,
      "fecha": "2025-10-15",
      "notas": "Muestreo mensual",
      "cicloId": 1,
      "lugarId": 1,
      "tipoId": 1,
      "origenId": 1
    }
  ],
  "pagination": { ... }
}
```

---

#### GET /api/export-data

**Propósito:** Exportar todos los datos del usuario a Excel

**Autenticación:** Solo sesión (no API Key)

**Response:** Archivo Excel (.xlsx) con tres hojas:
1. **Centros de Cultivo:** Lugares con coordenadas
2. **Ciclos Productivos:** Períodos de cultivo
3. **Registros:** Mediciones con joins a tablas maestras

**Rate Limiting:** Límite especial más restrictivo para exportaciones

---

#### POST /api/poblar

**Propósito:** Poblar datos de prueba (solo desarrollo)

**Autenticación:** Requiere rol ADMIN

---

### 5.3 Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Solicitud mal formada |
| 401 | No autenticado |
| 403 | Sin permisos |
| 429 | Rate limit excedido |
| 500 | Error interno del servidor |

---

## 6. Estructura de Componentes Frontend

### 6.1 Organización por Dominio

```
src/lib/components/
├── auth/                    # Autenticación
│   ├── LoginEmailForm.svelte
│   ├── LoginRegistrationForm.svelte
│   ├── LoginFormContent.svelte
│   ├── LoginSubmitButton.svelte
│   ├── LoginSuccessState.svelte
│   ├── LoginRateLimitWarning.svelte
│   ├── LoginCaptchaError.svelte
│   ├── loginFormState.ts     # Estado del formulario
│   └── turnstile.ts          # Integración Cloudflare Turnstile
│
├── centros/                 # Gestión de centros de cultivo
│   ├── CentroCreateForm.svelte
│   ├── CentroEditForm.svelte
│   ├── CentroDeleteButton.svelte
│   ├── CentroRow.svelte
│   ├── CentroMapSelector.svelte
│   └── centro-form-utils.ts
│
├── ciclos/                  # Gestión de ciclos productivos
│   ├── CicloCreateForm.svelte
│   ├── CicloRow.svelte
│   ├── CiclosGrid.svelte
│   ├── CiclosEmptyState.svelte
│   ├── CiclosNoCentrosAlert.svelte
│   └── ciclo-utils.ts
│
├── dashboard/               # Dashboard principal
│   ├── DashboardStatCard.svelte
│   ├── DashboardActivityAlerts.svelte
│   ├── DashboardChartPlaceholder.svelte
│   └── index.ts
│
├── datagrid/                # Componentes de tabla reutilizables
│   ├── DataGridEmptyState.svelte
│   ├── DataGridGridView.svelte
│   ├── DataGridPagination.svelte
│   ├── DataGridSearchBar.svelte
│   ├── DataGridTableHeader.svelte
│   ├── DataGridTableView.svelte
│   ├── datagrid-types.ts
│   ├── filter-utils.ts
│   ├── sort-utils.ts
│   └── svar-grid-api.ts
│
├── graficos/                # Visualización de datos
│   ├── DashboardGraficos.svelte
│   ├── EstadisticasPanel.svelte
│   ├── GraficoEvolucion.svelte
│   ├── GraficoEmptyState.svelte
│   ├── FiltrosPanel.svelte
│   ├── FiltrosPanelHeader.svelte
│   ├── TipoMedicionButton.svelte
│   ├── dashboardUtils.ts
│   ├── filtroEntidades.ts
│   ├── filtroRegistros.ts
│   └── types.ts
│
├── layout/                  # Estructura de la aplicación
│   ├── Header.svelte
│   └── Sidebar.svelte
│
├── legal/                   # Términos y condiciones
│   ├── TermSection.svelte
│   └── sections/
│       ├── SectionDerechosArcop.svelte
│       ├── SectionGobernanza.svelte
│       ├── SectionIdentidad.svelte
│       ├── SectionLegitimacion.svelte
│       ├── SectionPropiedadIntelectual.svelte
│       ├── SectionProteccionConsumidor.svelte
│       └── SectionSeguridad.svelte
│
├── origenes/                # Gestión de orígenes de datos
│   ├── OrigenCreateForm.svelte
│   ├── OrigenesPageHeader.svelte
│   ├── OrigenesTable.svelte
│   └── OrigenRow.svelte
│
├── perfil/                  # Perfil de usuario
│   ├── PerfilApiKeysSection.svelte
│   ├── PerfilDangerZoneSection.svelte
│   ├── PerfilExportSection.svelte
│   └── PerfilInfoSection.svelte
│
├── home/                    # Página de inicio
│   ├── HomeEntitiesSection.svelte
│   └── HomeEntityCard.svelte
│
├── acerca-de/               # Acerca del proyecto
│   ├── AcercaDeSection.svelte
│   ├── SectionEjeEconomico.svelte
│   ├── SectionEjeOperativo.svelte
│   ├── SectionEjeTecnico.svelte
│   └── SectionPropuestaValor.svelte
│
├── MapContainer.svelte      # Contenedor de mapa
├── MapLibreMap.svelte       # Mapa interactivo
├── MapMarkers.svelte        # Marcadores del mapa
├── SearchableSelect.svelte  # Selector con búsqueda
├── SvarDataGrid.svelte      # Grid de datos principal
└── utils.ts
```

### 6.2 Patrones de Componentes

1. **Componentes de Presentación:** Componentes visuales sin lógica de negocio
2. **Componentes de Contenedor:** Manejan estado y orquestan componentes hijos
3. **Utilidades Separadas:** Lógica extraída en archivos `-utils.ts`
4. **Server Actions:** Mutaciones mediante formularios con acciones del servidor

### 6.3 Librerías de UI Utilizadas

| Librería | Uso |
|----------|-----|
| bits-ui | Componentes primitivos (Button, Dialog, Dropdown, etc.) |
| wx-svelte-grid | Tablas de datos editables |
| LayerChart | Gráficos de líneas y visualizaciones |
| svelte-maplibre | Mapas interactivos |
| svelte-sonner | Notificaciones toast |
| lucide-svelte | Iconos |

---

## 7. Sistema de Autenticación y Autorización

### 7.1 Flujo de Autenticación

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Usuario   │     │   Frontend  │     │   Backend   │     │   Resend    │
│             │     │             │     │             │     │   (Email)   │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │ 1. Ingresa email  │                   │                   │
       │──────────────────▶│                   │                   │
       │                   │ 2. POST /auth/login                   │
       │                   │──────────────────▶│                   │
       │                   │                   │ 3. Validar rate   │
       │                   │                   │    limit          │
       │                   │                   │                   │
       │                   │                   │ 4. Crear magic    │
       │                   │                   │    link token     │
       │                   │                   │                   │
       │                   │                   │ 5. Enviar email   │
       │                   │                   │──────────────────▶│
       │                   │                   │                   │
       │                   │ 6. Confirmación   │                   │
       │                   │◀──────────────────│                   │
       │                   │                   │                   │
       │ 7. Click en link  │                   │                   │
       │──────────────────────────────────────▶│                   │
       │                   │                   │ 8. Validar token  │
       │                   │                   │ 9. Crear sesión   │
       │                   │                   │ 10. Set cookie    │
       │                   │                   │                   │
       │ 11. Redirect a    │                   │                   │
       │     dashboard     │                   │                   │
       │◀──────────────────────────────────────│                   │
       │                   │                   │                   │
```

### 7.2 Sistema de Roles (RBAC)

| Rol | Nivel | Permisos |
|-----|-------|----------|
| USUARIO | 0 | Gestión de sus propios datos |
| INVESTIGADOR | 1 | Acceso a gráficos y análisis |
| ADMIN | 2 | Acceso completo, gestión de usuarios |

### 7.3 Protección de Rutas

```typescript
// Rutas protegidas por rol
const PROTECTED_ROUTES = {
  '/admin': 'ADMIN',
  '/investigador': 'INVESTIGADOR'
};

// Rutas públicas
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/acerca-de',
  '/condiciones-servicios'
];
```

### 7.4 Rate Limiting

| Tipo | Límite | Ventana |
|------|--------|---------|
| Login por IP | 10 intentos | 15 minutos |
| Login por email | 5 intentos | 15 minutos |
| API general | 100 solicitudes | 1 minuto |
| Exportación | 5 solicitudes | 1 hora |
| Email cooldown | 1 email | 60 segundos |

---

## 8. Estructura de Tests

### 8.1 Organización

```
src/__tests__/
├── test-utils.ts             # Utilidades de testing
├── api/
│   ├── auth/
│   │   └── api-auth.test.ts  # Tests de autenticación API
│   ├── centros/
│   │   └── centros.test.ts   # Tests de endpoint centros
│   ├── ciclos/
│   │   └── ciclos.test.ts    # Tests de endpoint ciclos
│   ├── registros/
│   │   └── registros.test.ts # Tests de endpoint registros
│   └── export-data/
│       └── export-data.test.ts # Tests de exportación
├── auth/
│   ├── callback.test.ts      # Tests de callback de auth
│   ├── login.test.ts         # Tests de login
│   └── logout.test.ts        # Tests de logout
└── hooks/
    └── hooks.test.ts         # Tests de hooks de servidor
```

### 8.2 Cobertura de Tests

| Módulo | Tipo de Test | Framework |
|--------|--------------|-----------|
| Componentes Svelte | Unitario + Browser | Vitest + Playwright |
| Lógica de servidor | Unitario | Vitest |
| API endpoints | Integración | Vitest |
| E2E | End-to-end | Playwright |

### 8.3 Configuración de Testing

```typescript
// vite.config.ts
test: {
  projects: [
    {
      name: 'client',
      browser: {
        enabled: true,
        provider: playwright(),
        instances: [{ browser: 'chromium', headless: true }]
      },
      include: ['src/**/*.svelte.{test,spec}.{js,ts}']
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

---

## 9. Hallazgos Relevantes

### 9.1 Fortalezas

1. **Arquitectura Modular:** Separación clara de responsabilidades con módulos independientes por dominio
2. **Multi-tenancy Implementado:** Aislamiento de datos por usuario en todas las tablas productivas
3. **Seguridad Robusta:**
   - Autenticación passwordless con magic links
   - Rate limiting en múltiples niveles
   - Auditoría de acciones
   - Headers de seguridad HTTP
4. **Stack Moderno:** SvelteKit 5 con runes, TypeScript estricto, Drizzle ORM
5. **Testing Completo:** Tests unitarios, de integración y E2E
6. **Soporte Geoespacial:** PostGIS para operaciones con coordenadas
7. **API Documentada:** Endpoints RESTful con paginación y rate limiting

### 9.2 Áreas de Mejora Identificadas

1. **Documentación de API:** No existe documentación OpenAPI/Swagger
2. **Modelado Predictivo:** La biblioteca de parámetros existe pero el motor de predicción no está completamente integrado
3. **Tests de Componentes:** Algunos componentes clave carecen de tests
4. **Internacionalización:** No hay soporte para multiidioma
5. **Offline Support:** No hay soporte para funcionamiento offline (mencionado como requisito para usuarios en terreno)

### 9.3 Deuda Técnica Detectada

1. **Columnas Legacy:** `latitud` y `longitud` en `lugares` mantenidas para rollback
2. **ETL Python:** Script `ETL.py` separado del pipeline principal
3. **Scripts de Seed:** Múltiples scripts `add_profiles_part*.js` sugieren migraciones incrementales

---

## 10. Recomendaciones para la Documentación

### 10.1 Documentación Técnica Necesaria

1. **Guía de Arquitectura:** Diagramas C4 y explicación de decisiones técnicas
2. **Referencia de API:** Documentación OpenAPI/Swagger
3. **Guía de Contribución:** Estándares de código, flujo de trabajo Git
4. **Runbook de Operaciones:** Procedimientos de despliegue, monitoreo, backup

### 10.2 Documentación de Usuario Necesaria

1. **Manual de Usuario:** Guías por rol (USUARIO, INVESTIGADOR, ADMIN)
2. **Guía de Inicio Rápido:** Pasos para comenzar a usar la plataforma
3. **FAQ:** Preguntas frecuentes sobre funcionalidades
4. **Guía de API:** Para desarrolladores que integren con la plataforma

### 10.3 Documentación de Cumplimiento

1. **Política de Privacidad:** Alineada con Ley 19.628
2. **Términos de Servicio:** Ya existe en `/condiciones-servicios`
3. **Registro de Consentimientos:** Ya implementado en base de datos

---

## 11. Supuestos y Riesgos

### 11.1 Supuestos

- La base de datos PostgreSQL con PostGIS está disponible (Neon Serverless)
- El servicio de email Resend está configurado
- El despliegue es en Vercel con funciones serverless
- Los usuarios tienen conectividad a internet (no hay modo offline)

### 11.2 Riesgos Técnicos

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Dependencia de Neon Serverless | Alto si hay interrupción | Considerar multi-cloud |
| Rate limiting en memoria | Medio en serverless | Ya implementado con DB |
| Sin offline support | Alto para usuarios en terreno | Considerar PWA |
| ETL Python separado | Medio mantenimiento | Integrar en el pipeline |

### 11.3 Vacíos de Información

- No se encontró documentación sobre el motor de modelado predictivo sigmoidal
- No está claro el flujo de integración con datos satelitales
- No hay documentación sobre el proceso de ETL desde PSMB

---

## 12. Conclusión

MytilusData es una plataforma bien arquitecturada con un stack tecnológico moderno y apropiado para el contexto de uso. La separación de responsabilidades, el multi-tenancy y las medidas de seguridad son sólidas. 

Las principales áreas de mejora están en:
1. Completar la integración del motor predictivo
2. Mejorar la cobertura de documentación
3. Implementar soporte offline para usuarios en terreno
4. Consolidar los scripts de migración y ETL

Este informe proporciona la base técnica necesaria para que el especialista de documentación cree documentos de alto nivel sin necesidad de revisar el código fuente directamente.

---

**Fin del Informe**