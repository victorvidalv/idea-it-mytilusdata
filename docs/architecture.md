# Arquitectura del Sistema - MytilusData

Este documento describe la arquitectura técnica del sistema MytilusData, incluyendo sus capas, componentes, flujos de datos y decisiones de diseño.

## Diagrama de Arquitectura General

```mermaid
graph TB
    subgraph Cliente [Navegador Web]
        UI[Interfaz de Usuario - Svelte]
        Maps[Leaflet Maps]
        Charts[LayerChart]
    end

    subgraph SvelteKit [Servidor SvelteKit]
        Hooks[Hooks Server]
        Routes[Rutas y Endpoints]
        ServerLoad[Server Load Functions]
        Actions[Server Actions]
    end

    subgraph ServerLib [Librerías de Servidor]
        Auth[Módulo de Autenticación]
        RateLimiter[Rate Limiter]
        ApiRateLimiter[API Rate Limiter]
        Captcha[Verificador CAPTCHA]
        Audit[Sistema de Auditoría]
    end

    subgraph Database [PostgreSQL - Neon]
        UsersTable[Tabla usuarios]
        SessionsTable[Tabla sesiones]
        DataTable[Tablas de datos]
        AuditTable[Tabla audit_logs]
    end

    subgraph External [Servicios Externos]
        Resend[Resend - Emails]
        Turnstile[Cloudflare Turnstile]
    end

    UI --> Routes
    Maps --> Routes
    Charts --> Routes
    
    Routes --> Hooks
    Hooks --> Auth
    Hooks --> RateLimiter
    
    ServerLoad --> Auth
    Actions --> Auth
    Actions --> RateLimiter
    Actions --> Captcha
    
    Auth --> UsersTable
    Auth --> SessionsTable
    Auth --> Resend
    
    RateLimiter --> Database
    ApiRateLimiter --> Database
    Captcha --> Turnstile
    Audit --> AuditTable
```

## Descripción de Capas

### 1. Capa de Presentación (Frontend)

La capa de presentación está construida con **Svelte 5** y **SvelteKit**, utilizando el paradigma de componentes reactivos.

#### Componentes Principales

| Directorio | Propósito |
|------------|-----------|
| `src/lib/components/ui/` | Componentes base shadcn-svelte (Button, Input, Card, etc.) |
| `src/lib/components/layout/` | Componentes de estructura (Header, Sidebar) |
| `src/lib/components/centros/` | Componentes para gestión de centros |
| `src/lib/components/ciclos/` | Componentes para gestión de ciclos |
| `src/lib/components/registros/` | Componentes para gestión de registros |
| `src/lib/components/graficos/` | Componentes de visualización |

#### Tecnologías de UI

- **TailwindCSS 4**: Estilos utilitarios
- **bits-ui**: Primitivos de UI accesibles
- **Lucide Icons**: Iconografía
- **mode-watcher**: Tema claro/osculo

### 2. Capa de Aplicación (Backend)

La capa de aplicación maneja la lógica de negocio, autenticación y autorización.

#### Rutas de SvelteKit

```mermaid
graph LR
    subgraph Publicas [Rutas Públicas]
        Home[/ - Inicio]
        Login[/auth/login]
        Callback[/auth/callback]
        Acerca[/acerca-de]
        Terminos[/condiciones-servicios]
    end

    subgraph App [Rutas Autenticadas - Grupo app]
        Dashboard[/dashboard]
        Centros[/centros]
        Ciclos[/ciclos]
        Registros[/registros]
        Graficos[/graficos]
        Perfil[/perfil]
    end

    subgraph Admin [Rutas Admin]
        Usuarios[/admin/usuarios]
        Origenes[/admin/origenes]
        TiposMed[/admin/tipos-medicion]
    end

    subgraph Investigador [Rutas Investigador]
        InvDash[/investigador/dashboard]
        InvCentros[/investigador/centros]
        InvCiclos[/investigador/ciclos]
        InvReg[/investigador/registros]
        InvGraf[/investigador/graficos]
    end

    subgraph API [API REST]
        APICentros[/api/centros]
        APICiclos[/api/ciclos]
        APIReg[/api/registros]
        APIExport[/api/export-data]
    end
```

#### Layouts Anidados

```mermaid
graph TB
    RootLayout[+layout.svelte - Raíz]
    AppLayout[app/+layout.svelte - Autenticado]
    AdminLayout[admin/+layout.svelte - Admin]
    InvLayout[investigador/+layout.svelte - Investigador]

    RootLayout --> AppLayout
    AppLayout --> AdminLayout
    AppLayout --> InvLayout
    AppLayout --> Dashboard
    AppLayout --> Centros
    AppLayout --> Perfil
```

### 3. Capa de Datos (Base de Datos)

La capa de datos utiliza **PostgreSQL** (via Neon) con **Drizzle ORM**.

#### Esquema de Base de Datos

```mermaid
erDiagram
    usuarios ||--o{ sesiones : tiene
    usuarios ||--o{ magicLinkTokens : recibe
    usuarios ||--o{ lugares : posee
    usuarios ||--o{ ciclos : crea
    usuarios ||--o{ mediciones : registra
    usuarios ||--o{ apiKeys : genera
    usuarios ||--o{ consentimientos : acepta
    usuarios ||--o{ auditLogs : genera

    lugares ||--o{ ciclos : contiene
    lugares ||--o{ mediciones : registra

    ciclos ||--o{ mediciones : incluye

    tiposRegistro ||--o{ mediciones : define
    origenDatos ||--o{ mediciones : origina

    usuarios {
        serial id PK
        text nombre
        text email UK
        enum rol
        boolean activo
        timestamp created_at
    }

    sesiones {
        serial id PK
        integer user_id FK
        text token_hash UK
        timestamp expires_at
        timestamp invalidated_at
    }

    lugares {
        serial id PK
        text nombre
        real latitud
        real longitud
        integer user_id FK
    }

    ciclos {
        serial id PK
        text nombre
        timestamp fecha_siembra
        timestamp fecha_finalizacion
        integer lugar_id FK
        integer user_id FK
        boolean activo
    }

    mediciones {
        serial id PK
        real valor
        timestamp fecha_medicion
        integer ciclo_id FK
        integer lugar_id FK
        integer user_id FK
        integer tipo_id FK
        integer origen_id FK
        text notas
    }
```

## Flujo de Autenticación

### Diagrama de Secuencia - Magic Link

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant S as Servidor
    participant R as Resend
    participant DB as Base de Datos

    U->>F: Ingresa email
    F->>S: POST /auth/login
    S->>S: Verifica CAPTCHA - Turnstile
    S->>S: Verifica Rate Limit - IP/Email
    S->>S: Verifica Email Cooldown
    
    alt Rate Limit Excedido
        S-->>F: Error 429 - Demasiados intentos
        F-->>U: Muestra mensaje de espera
    else Cooldown Activo
        S-->>F: Error 429 - Espera antes de solicitar
        F-->>U: Muestra countdown
    else OK
        S->>DB: Busca/crea usuario
        S->>DB: Crea magic_link_token
        S->>DB: Registra rate limit attempt
        S->>DB: Actualiza email cooldown
        S->>R: Envía email con magic link
        R-->>U: Email entregado
        S-->>F: Success - Email enviado
        F-->>U: Muestra confirmación
    end

    Note over U,DB: Usuario hace clic en el link del email

    U->>F: Clic en magic link
    F->>S: GET /auth/callback?token=xxx
    S->>DB: Verifica token - válido, no usado, no expirado
    S->>DB: Marca token como usado
    S->>DB: Crea sesión en BD
    S->>S: Genera JWT con sessionId
    S-->>F: Set-Cookie: session=jwt
    F->>F: Redirige a /dashboard
```

### Validación de Sesión

```mermaid
sequenceDiagram
    participant C as Cliente
    participant H as hooks.server.ts
    participant A as auth.ts
    participant DB as Base de Datos

    C->>H: Request con cookie session
    H->>A: authGuard - cookies
    A->>A: Verifica JWT - firma y expiración
    A->>A: Extrae sessionId y sessionTokenHash
    A->>DB: validateSession - busca sesión
    
    alt Sesión No Encontrada
        DB-->>A: null
        A->>A: Elimina cookie
        A-->>H: null
        H->>H: Usuario no autenticado
    else Sesión Invalidada
        DB-->>A: sesión con invalidatedAt
        A->>A: Elimina cookie
        A-->>H: null
    else Sesión Expirada
        DB-->>A: sesión con expiresAt < now
        A->>A: Elimina cookie
        A-->>H: null
    else Usuario Inactivo
        DB-->>A: usuario con activo = false
        A->>A: Elimina cookie
        A-->>H: null
    else Rol Cambió
        DB-->>A: usuario.rol != jwt.rol
        A->>DB: invalidateSession
        A->>A: Elimina cookie
        A-->>H: null
    else Sesión Válida
        DB-->>A: sesión y usuario válidos
        A-->>H: datos del usuario
        H->>H: Inyecta en event.locals.user
    end
```

## Sistema de Rate Limiting

El sistema implementa múltiples capas de rate limiting para proteger contra abuso.

### Arquitectura de Rate Limiting

```mermaid
graph TB
    subgraph Login [Rate Limiting de Login]
        IPCheck[Verificación por IP]
        EmailCheck[Verificación por Email]
        Cooldown[Email Cooldown]
    end

    subgraph API [Rate Limiting de API]
        DefaultLimit[Límite DEFAULT - 100/min]
        ExportLimit[Límite EXPORT - 10/min]
    end

    subgraph Storage [Almacenamiento]
        RateLimitLogs[Tabla rate_limit_logs]
        EmailCooldowns[Tabla email_cooldowns]
    end

    Request[Request Entrante] --> IPCheck
    Request --> EmailCheck
    EmailCheck --> Cooldown
    
    IPCheck --> RateLimitLogs
    EmailCheck --> RateLimitLogs
    Cooldown --> EmailCooldowns

    APIRequest[API Request] --> DefaultLimit
    ExportRequest[Export Request] --> ExportLimit
    
    DefaultLimit --> RateLimitLogs
    ExportLimit --> RateLimitLogs
```

### Configuración de Límites

| Tipo | Límite | Ventana | Propósito |
|------|--------|---------|-----------|
| IP (Login) | 5 intentos | 15 minutos | Prevenir ataques de fuerza bruta por IP |
| Email (Login) | 3 intentos | 1 hora | Prevenir spam de magic links |
| Email Cooldown | 1 envío | 60 segundos | Evitar envíos duplicados |
| API DEFAULT | 100 solicitudes | 1 minuto | Uso normal de API |
| API EXPORT | 10 solicitudes | 1 minuto | Exportaciones (más costosas) |

### Flujo de Rate Limiting en Login

```mermaid
flowchart TD
    Start[Inicio Request Login] --> CheckCaptcha{CAPTCHA Válido?}
    CheckCaptcha -->|No| RejectCaptcha[Rechazar - CAPTCHA inválido]
    CheckCaptcha -->|Sí| CheckIP{Rate Limit IP OK?}
    
    CheckIP -->|No| RejectIP[Rechazar - 429 Too Many Requests]
    CheckIP -->|Sí| CheckEmail{Rate Limit Email OK?}
    
    CheckEmail -->|No| RejectEmail[Rechazar - 429 Too Many Requests]
    CheckEmail -->|Sí| CheckCooldown{Email Cooldown OK?}
    
    CheckCooldown -->|No| RejectCooldown[Rechazar - Esperar X segundos]
    CheckCooldown -->|Sí| LogAttempts[Registrar Intentos]
    
    LogAttempts --> UpdateCooldown[Actualizar Cooldown]
    UpdateCooldown --> SendEmail[Enviar Magic Link]
    SendEmail --> Success[Retornar Success]
```

## Middleware y Hooks

### hooks.server.ts

El archivo [`src/hooks.server.ts`](../src/hooks.server.ts) es el punto de entrada para todas las solicitudes al servidor.

```mermaid
sequenceDiagram
    participant C as Cliente
    participant H as hooks.server.ts
    participant A as authGuard
    participant R as Resolver

    C->>H: Request HTTP
    H->>A: Validar sesión
    
    alt Usuario Autenticado
        A-->>H: Datos del usuario
        H->>H: event.locals.user = userData
    else No Autenticado
        A-->>H: null
        H->>H: event.locals.user = null
    end

    H->>H: Verificar rutas protegidas
    
    alt Ruta protegida sin auth
        H-->>C: Redirect 303 /auth/login
    else Ruta admin sin rol ADMIN
        H-->>C: Redirect 303 /dashboard
    else Ruta investigador sin rol
        H-->>C: Redirect 303 /dashboard
    else Ruta login con auth
        H-->>C: Redirect 303 /dashboard
    end

    H->>R: resolve - event
    R-->>H: Response
    
    H->>H: Agregar headers de seguridad
    H-->>C: Response con headers
```

### Headers de Seguridad

Para todas las respuestas de API:

| Header | Valor | Propósito |
|--------|-------|-----------|
| `X-Content-Type-Options` | `nosniff` | Prevenir MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevenir clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Protección XSS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control de referrer |
| `Cache-Control` | `no-store, no-cache, must-revalidate` | No cachear datos sensibles |

## Estructura de Rutas y Layouts

### Sistema de Layouts de SvelteKit

```mermaid
graph TB
    subgraph Root [Raíz del Proyecto]
        RootLayout["+layout.svelte"]
        RootServer["+layout.server.ts"]
        RootPage["+page.svelte"]
    end

    subgraph AuthGroup [Grupo auth/]
        LoginPage["auth/login/+page.svelte"]
        LoginServer["auth/login/+page.server.ts"]
        CallbackServer["auth/callback/+server.ts"]
        LogoutServer["auth/logout/+server.ts"]
    end

    subgraph AppGroup [Grupo app/ - Requiere Auth]
        AppLayout["app/+layout.svelte"]
        AppLayoutServer["app/+layout.server.ts"]
        
        subgraph AppPages [Páginas de App]
            DashboardPage["dashboard/+page.svelte"]
            CentrosPage["centros/+page.svelte"]
            CiclosPage["ciclos/+page.svelte"]
            RegistrosPage["registros/+page.svelte"]
            GraficosPage["graficos/+page.svelte"]
            PerfilPage["perfil/+page.svelte"]
        end

        subgraph AdminGroup [Admin/]
            AdminPages["usuarios, origenes, tipos-medicion"]
        end

        subgraph InvGroup [Investigador/]
            InvPages["dashboard, centros, ciclos, registros, graficos"]
        end
    end

    subgraph ApiGroup [Grupo api/]
        ApiCentros["api/centros/+server.ts"]
        ApiCiclos["api/ciclos/+server.ts"]
        ApiRegistros["api/registros/+server.ts"]
        ApiExport["api/export-data/+server.ts"]
    end

    RootLayout --> AuthGroup
    RootLayout --> AppGroup
    RootLayout --> ApiGroup
    
    AppLayout --> AppPages
    AppLayout --> AdminGroup
    AppLayout --> InvGroup
```

### Protección de Rutas

| Patrón de Ruta | Protección | Implementación |
|----------------|------------|----------------|
| `/dashboard/*` | Autenticación | `hooks.server.ts` |
| `/centros/*` | Autenticación | `hooks.server.ts` |
| `/ciclos/*` | Autenticación | `hooks.server.ts` |
| `/registros/*` | Autenticación | `hooks.server.ts` |
| `/graficos/*` | Autenticación | `hooks.server.ts` |
| `/perfil/*` | Autenticación | `hooks.server.ts` |
| `/admin/*` | Rol ADMIN | `hooks.server.ts` |
| `/investigador/*` | Rol INVESTIGADOR o ADMIN | `hooks.server.ts` |
| `/api/*` | API Key o Sesión | Cada endpoint |
| `/auth/login` | Redirigir si autenticado | `hooks.server.ts` |

## Sistema de Auditoría

### Eventos Registrados

| Evento | Código | Descripción |
|--------|--------|-------------|
| Login exitoso | `LOGIN_SUCCESS` | Usuario inició sesión |
| Login fallido | `LOGIN_FAILED` | Intento de login fallido |
| Logout | `LOGOUT` | Usuario cerró sesión |
| Magic Link enviado | `MAGIC_LINK_SENT` | Email de magic link enviado |
| API Key generada | `API_KEY_GENERATED` | Usuario generó nueva API key |
| API Key revocada | `API_KEY_REVOKED` | Usuario revocó API key |
| Acceso a API | `API_ACCESS` | Solicitud a endpoint de API |
| Exportación de datos | `DATA_EXPORT` | Usuario exportó datos |
| Cambio de rol | `ROLE_CHANGE` | Admin cambió rol de usuario |
| Usuario creado | `USER_CREATED` | Nuevo usuario registrado |

### Estructura de Log

```typescript
interface AuditLogEntry {
  id: number;
  userId?: number;        // Usuario que realizó la acción
  accion: string;         // Código del evento
  entidad?: string;       // Entidad afectada (usuario, api_key, etc.)
  entidadId?: number;     // ID de la entidad
  ip?: string;            // Dirección IP
  userAgent?: string;     // User agent del cliente
  detalles?: string;      // JSON con información adicional
  createdAt: Date;        // Timestamp del evento
}
```

## Multi-Tenancy

El sistema implementa aislamiento de datos por usuario (multi-tenancy):

### Implementación

1. **Todas las tablas de datos incluyen `userId`**:
   - `lugares.userId`
   - `ciclos.userId`
   - `mediciones.userId`

2. **Consultas filtradas por usuario**:
   ```typescript
   // Ejemplo en centros
   const userCentros = await db
     .select()
     .from(lugares)
     .where(eq(lugares.userId, apiKeyRecord.userId));
   ```

3. **API Keys vinculadas a usuario**:
   - Cada API key está asociada a un único usuario
   - Las consultas API usan el userId de la API key

### Diagrama de Aislamiento

```mermaid
graph TB
    subgraph UsuarioA [Usuario A]
        CentrosA[Centros de A]
        CiclosA[Ciclos de A]
        MedicionesA[Mediciones de A]
    end

    subgraph UsuarioB [Usuario B]
        CentrosB[Centros de B]
        CiclosB[Ciclos de B]
        MedicionesB[Mediciones de B]
    end

    subgraph Admin [Administrador]
        GestiónUsuarios[Gestión de Usuarios]
        GestiónTipos[Gestión de Tipos]
    end

    UsuarioA --> |Solo ve sus datos| DB[(Base de Datos)]
    UsuarioB --> |Solo ve sus datos| DB
    Admin --> |Ve todos los usuarios| DB
```

## Decisiones Arquitectónicas

### 1. Autenticación Passwordless

**Decisión**: Usar Magic Links en lugar de contraseñas tradicionales.

**Justificación**:
- Elimina problemas de contraseñas débiles
- Reduce superficie de ataque (no hay contraseñas que robar)
- Mejor experiencia de usuario (no recordar contraseñas)
- Cumple con principios de seguridad moderna

### 2. Sesiones en Base de Datos

**Decisión**: Almacenar sesiones en BD en lugar de JWT stateless puro.

**Justificación**:
- Permite invalidar sesiones inmediatamente
- Control granular (logout, desactivación de usuario, cambio de rol)
- Auditoría de sesiones activas
- Trade-off: Mayor latencia en cada request, pero mayor seguridad

### 3. Rate Limiting en Base de Datos

**Decisión**: Usar BD para rate limiting en lugar de memoria.

**Justificación**:
- Funciona en entornos serverless/multi-instancia
- Persistencia entre reinicios
- Sin dependencia de Redis u otro servicio
- Trade-off: Mayor latencia, pero arquitectura más simple

### 4. Drizzle ORM

**Decisión**: Usar Drizzle en lugar de Prisma.

**Justificación**:
- SQL-like, más cercano a la base de datos
- Sin generación de código adicional
- Mejor rendimiento en serverless
- Migraciones más predecibles

### 5. SvelteKit sobre Next.js

**Decisión**: Usar SvelteKit como framework.

**Justificación**:
- Menor bundle size
- Sintaxis más simple y reactiva
- Mejor DX para proyectos pequeños/medianos
- Server-side rendering nativo

## Consideraciones de Escalabilidad

### Cuellos de Botella Potenciales

1. **Validación de sesión en BD**: Cada request autenticado consulta la BD
   - **Mitigación**: Caché de sesiones válidas con TTL corto

2. **Rate Limiting en BD**: Consultas en cada request
   - **Mitigación**: Implementar con Redis para alto tráfico

3. **Consultas de datos sin índices**: Tablas de mediciones pueden crecer mucho
   - **Mitigación**: Índices en `userId`, `fechaMedicion`, `cicloId`

### Recomendaciones para Producción

1. **Connection Pooling**: Configurar pool de conexiones PostgreSQL
2. **CDN**: Servir assets estáticos desde CDN
3. **Monitoring**: Implementar APM (Application Performance Monitoring)
4. **Logging**: Centralizar logs con servicio externo
5. **Backups**: Configurar backups automáticos de BD

## Próximos Pasos

Para más detalles sobre la API REST, consultar [api.md](./api.md).
