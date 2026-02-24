# Guía de Instalación - MytilusData

Esta guía proporciona instrucciones detalladas para configurar y ejecutar el proyecto MytilusData en un entorno de desarrollo o producción.

## Requisitos Previos

### Software Necesario

| Software       | Versión Mínima | Versión Recomendada | Verificación     |
| -------------- | -------------- | ------------------- | ---------------- |
| **Node.js**    | 20.x           | 24.x                | `node --version` |
| **npm**        | 10.x           | 11.x                | `npm --version`  |
| **PostgreSQL** | 15.x           | 16.x                | `psql --version` |
| **Git**        | 2.x            | último              | `git --version`  |

### Cuentas de Servicios Externos

1. **Neon Database** (o PostgreSQL propio)
   - Crear cuenta en [neon.tech](https://neon.tech)
   - Obtener cadena de conexión

2. **Resend** (para emails)
   - Crear cuenta en [resend.com](https://resend.com)
   - Obtener API Key

3. **Cloudflare Turnstile** (CAPTCHA)
   - Crear cuenta en [Cloudflare](https://dash.cloudflare.com)
   - Obtener Site Key y Secret Key desde Turnstile

## Variables de Entorno

### Archivo .env

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env
```

### Descripción de Variables

| Variable                    | Requerido | Descripción                                    | Ejemplo                                               |
| --------------------------- | --------- | ---------------------------------------------- | ----------------------------------------------------- |
| `DATABASE_URL`              | ✅        | URL de conexión a PostgreSQL                   | `postgresql://user:pass@host:5432/db?sslmode=require` |
| `RESEND_API_KEY`            | ✅        | API Key de Resend para envío de emails         | `re_123456789...`                                     |
| `JWT_SECRET`                | ✅        | Secreto para firmar JWT (mínimo 32 caracteres) | `tu-secreto-muy-seguro-de-32-chars-minimo`            |
| `EMAIL_FROM`                | ✅        | Email remitente para Magic Links               | `MytilusData <noreply@tudominio.com>`                 |
| `INITIAL_ADMIN_EMAIL`       | ⚠️        | Email del administrador inicial                | `admin@tudominio.com`                                 |
| `TURNSTILE_SECRET_KEY`      | 🔶        | Clave secreta de Cloudflare Turnstile          | `0x4AAAA...`                                          |
| `PUBLIC_TURNSTILE_SITE_KEY` | 🔶        | Clave pública de Cloudflare Turnstile          | `0x4AAAA...`                                          |

> **Leyenda**: ✅ Requerido | ⚠️ Requerido para setup inicial | 🔶 Opcional (recomendado para producción)

### Generar JWT_SECRET

```bash
# Usando Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Usando OpenSSL
openssl rand -hex 64
```

### Configuración por Ambiente

#### Desarrollo Local

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mytilusdata"
RESEND_API_KEY="re_dev_..."
JWT_SECRET="dev-secret-key-no-usar-en-produccion-32chars"
EMAIL_FROM="MytilusData <onboarding@resend.dev>"
INITIAL_ADMIN_EMAIL="admin@localhost.com"
# CAPTCHA opcional en desarrollo
```

#### Producción

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
RESEND_API_KEY="re_live_..."
JWT_SECRET="[generar-con-openssl-rand-hex-64]"
EMAIL_FROM="MytilusData <noreply@tudominio.com>"
INITIAL_ADMIN_EMAIL="admin@tudominio.com"
TURNSTILE_SECRET_KEY="0x4AAAA..."
PUBLIC_TURNSTILE_SITE_KEY="0x4AAAA..."
```

## Pasos de Instalación

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd plataforma_idea2025
```

### 2. Instalar Dependencias

```bash
npm install
```

Esto instalará todas las dependencias listadas en [`package.json`](../package.json).

### 3. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores
nano .env  # o tu editor preferido
```

### 4. Configurar Base de Datos

#### Opción A: Usar Drizzle Push (Desarrollo)

Sincroniza el esquema directamente con la base de datos:

```bash
npm run db:push
```

#### Opción B: Usar Migraciones (Producción)

Generar y aplicar migraciones:

```bash
# Generar migraciones (si hay cambios en schema.ts)
npm run db:generate

# Aplicar migraciones
npm run db:migrate
```

#### Verificar Esquema

Para abrir Drizzle Studio y verificar las tablas:

```bash
npm run db:studio
```

### 5. Crear Administrador Inicial

El sistema utiliza RBAC dinámico donde todos los usuarios nuevos comienzan como `USUARIO`. Para crear el primer administrador:

```bash
# Asegúrate de que INITIAL_ADMIN_EMAIL esté configurado en .env
npm run create-admin
```

Este comando:

1. Busca el usuario con el email especificado
2. Si existe, actualiza su rol a `ADMIN`
3. Si no existe, muestra un error indicando que el usuario debe registrarse primero

**Flujo recomendado:**

1. Configura `INITIAL_ADMIN_EMAIL` con tu email
2. Inicia la aplicación: `npm run dev`
3. Regístrate en la aplicación con ese email
4. Ejecuta: `npm run create-admin`
5. Vuelve a iniciar sesión para obtener los nuevos permisos

### 6. Poblar Datos de Ejemplo (Opcional)

Para desarrollo o pruebas, puedes poblar la base de datos con datos de ejemplo:

```bash
npm run poblar
```

Esto creará:

- Tipos de registro (talla, biomasa, temperatura agua, etc.)
- Orígenes de datos (manual, satelital, PSMB)
- Usuario administrador de prueba

Para limpiar los datos:

```bash
npm run limpiar
```

## Comandos Disponibles

### Desarrollo

| Comando           | Descripción                                              |
| ----------------- | -------------------------------------------------------- |
| `npm run dev`     | Inicia servidor de desarrollo en `http://localhost:5173` |
| `npm run build`   | Compila la aplicación para producción                    |
| `npm run preview` | Previsualiza la build de producción                      |

### Calidad de Código

| Comando               | Descripción                            |
| --------------------- | -------------------------------------- |
| `npm run check`       | Verificación de tipos con svelte-check |
| `npm run check:watch` | Verificación en modo watch             |
| `npm run lint`        | Ejecuta ESLint y Prettier check        |
| `npm run format`      | Formatea código con Prettier           |

### Testing

| Comando             | Descripción                          |
| ------------------- | ------------------------------------ |
| `npm run test:unit` | Ejecuta tests unitarios con Vitest   |
| `npm run test:e2e`  | Ejecuta tests E2E con Playwright     |
| `npm run test`      | Ejecuta todos los tests (unit + e2e) |

### Base de Datos

| Comando               | Descripción                                |
| --------------------- | ------------------------------------------ |
| `npm run db:push`     | Sincroniza esquema con BD (desarrollo)     |
| `npm run db:generate` | Genera migraciones desde cambios en schema |
| `npm run db:migrate`  | Aplica migraciones pendientes              |
| `npm run db:studio`   | Abre Drizzle Studio                        |

### Scripts de Utilidad

| Comando                | Descripción                   |
| ---------------------- | ----------------------------- |
| `npm run poblar`       | Pobla BD con datos de ejemplo |
| `npm run limpiar`      | Limpia datos de ejemplo       |
| `npm run create-admin` | Crea administrador inicial    |

## Configuración de Base de Datos con Drizzle

### Estructura del Esquema

El esquema de la base de datos está definido en [`src/lib/server/db/schema.ts`](../src/lib/server/db/schema.ts).

#### Tablas Principales

```typescript
// Sistema de Acceso
usuarios; // Usuarios del sistema
magicLinkTokens; // Tokens para autenticación passwordless
sesiones; // Sesiones activas

// Estructura Productiva
lugares; // Centros de cultivo (con coordenadas)
ciclos; // Ciclos productivos

// Tablas Maestras
tiposRegistro; // Tipos de medición (talla, biomasa, etc.)
origenDatos; // Origen de datos (manual, satelital, PSMB)

// Hechos
mediciones; // Mediciones registradas

// Seguridad y Auditoría
rateLimitLogs; // Logs de rate limiting
emailCooldowns; // Control de envío de emails
auditLogs; // Registro de auditoría
apiKeys; // Claves de API
consentimientos; // Consentimientos legales
```

### Archivo de Configuración

[`drizzle.config.ts`](../drizzle.config.ts):

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.DATABASE_URL!
	}
});
```

### Migraciones

Las migraciones se almacenan en el directorio `drizzle/`:

```
drizzle/
├── 0000_sharp_kylun.sql              # Migración inicial
├── 0001_neat_jane_foster.sql         # Migración 1
├── 0002_numerous_secret_warriors.sql # Migración 2
├── 0003_equal_loners.sql             # Migración 3
└── meta/
    ├── _journal.json                 # Índice de migraciones
    └── 000X_snapshot.json            # Snapshots del esquema
```

## Despliegue

### Preparación para Producción

1. **Variables de Entorno**: Configurar todas las variables con valores de producción
2. **Build**: Compilar la aplicación
   ```bash
   npm run build
   ```
3. **Migraciones**: Aplicar migraciones pendientes
   ```bash
   npm run db:migrate
   ```

### Plataformas Recomendadas

El proyecto está configurado con `@sveltejs/adapter-auto` que detecta automáticamente la plataforma:

- **Vercel**: Despliegue automático desde Git
- **Netlify**: Compatible con funciones serverless
- **Node.js**: Usar `@sveltejs/adapter-node` para servidor propio

### Consideraciones de Producción

1. **HTTPS**: Obligatorio en producción
2. **Secretos**: Usar gestor de secretos (no archivos .env)
3. **Base de Datos**: Usar conexión pool si hay alto tráfico
4. **CDN**: Configurar para assets estáticos
5. **Monitoreo**: Implementar logging y alertas

## Solución de Problemas

### Error: "No se puede conectar a la base de datos"

```bash
# Verificar conexión
psql $DATABASE_URL

# Verificar que DATABASE_URL esté configurada
echo $DATABASE_URL
```

### Error: "JWT_SECRET no configurado"

```bash
# Generar nuevo secreto
openssl rand -hex 64

# Agregar a .env
echo "JWT_SECRET=$(openssl rand -hex 64)" >> .env
```

### Error: "Rate limit excedido"

Los límites se almacenan en la base de datos. Para limpiar:

```sql
-- Limpiar rate limits (usar con cuidado en producción)
DELETE FROM rate_limit_logs;
DELETE FROM email_cooldowns;
```

### Error: "CAPTCHA fallido en desarrollo"

Si no configuraste Turnstile, el sistema omite la verificación en desarrollo. Si necesitas probar con CAPTCHA:

1. Obtener claves en [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Configurar en `.env`:
   ```env
   TURNSTILE_SECRET_KEY="0x4AAAA..."
   PUBLIC_TURNSTILE_SITE_KEY="0x4AAAA..."
   ```

### Tests Fallando

```bash
# Limpiar cache de Vitest
npm run test:unit -- --clearCache

# Reinstalar dependencias
rm -rf node_modules npm-lock.yaml
npm install
```

## Próximos Pasos

Después de completar la instalación:

1. **Verificar funcionamiento**: Acceder a `http://localhost:5173`
2. **Crear cuenta**: Usar el flujo de Magic Link
3. **Asignar rol admin**: Ejecutar `npm run create-admin`
4. **Configurar datos maestros**: Desde el panel de admin, configurar tipos de medición y orígenes
5. **Revisar arquitectura**: Consultar [architecture.md](./architecture.md)
6. **Explorar API**: Ver [api.md](./api.md)
