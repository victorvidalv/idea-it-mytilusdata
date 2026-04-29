# Documentación de Seguridad - MytilusData

**Fecha:** 2026-03-19  
**Versión:** 1.0  
**Audiencia:** Desarrolladores, DevOps, auditores de seguridad

---

## Propósito

Este documento describe la arquitectura de seguridad de MytilusData, incluyendo mecanismos de autenticación, autorización, protección de datos y cumplimiento normativo. Permite a desarrolladores y operadores entender, implementar y auditar las medidas de seguridad del sistema.

---

## Visión General

### Principios de Seguridad

1. **Defense in depth:** Múltiples capas de protección
2. **Least privilege:** Acceso mínimo necesario por rol
3. **Fail-closed:** Denegar acceso ante incertidumbre
4. **Audit trail:** Trazabilidad de todas las acciones
5. **Data isolation:** Multi-tenancy estricto por usuario

### Componentes de Seguridad

| Componente | Tecnología | Propósito |
|------------|------------|-----------|
| Autenticación | Magic Links + JWT | Acceso passwordless |
| Autorización | RBAC | Control por roles |
| Protección CSRF | SvelteKit CSRF | Tokens en formularios |
| Rate Limiting | DB-based | Prevención de abuso |
| CAPTCHA | Cloudflare Turnstile | Protección contra bots |
| Headers HTTP | Security headers | Protección XSS, clickjacking |

---

## Autenticación

### Flujo de Autenticación

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Usuario   │     │   Frontend  │     │   Backend   │     │   Resend    │
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
       │                   │                   │    (hash SHA-256) │
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
       │                   │                   │    (JWT + BD)     │
       │                   │                   │ 10. Set cookie    │
       │                   │                   │    HttpOnly       │
       │                   │                   │                   │
       │ 11. Redirect a    │                   │                   │
       │     dashboard     │                   │                   │
       │◀──────────────────────────────────────│                   │
```

### Magic Links

**Características:**
- Token de un solo uso
- Expiración: 15 minutos
- Hash SHA-256 almacenado en BD (no el token original)
- Invalidación automática tras uso

**Implementación:**

```typescript
// src/lib/server/auth/magic-links/core.ts

// Generar token
const token = randomBytes(32).toString('hex');
const tokenHash = createHash('sha256').update(token).digest('hex');

// Almacenar hash
await db.insert(magicLinkTokens).values({
  userId,
  tokenHash,
  expiresAt: new Date(Date.now() + 15 * 60 * 1000)
});

// Validar token
const storedToken = await db.select()
  .from(magicLinkTokens)
  .where(eq(magicLinkTokens.tokenHash, tokenHash));

if (storedToken.usedAt || storedToken.expiresAt < new Date()) {
  throw new Error('Token inválido o expirado');
}
```

### Sesiones JWT

**Características:**
- Duración: 7 días
- Almacenamiento: Cookie HttpOnly, Secure, SameSite
- Validación en cada request contra BD
- Permite invalidación inmediata

**Estructura del JWT:**

```json
{
  "sessionId": 123,
  "userId": 456,
  "iat": 1708346400,
  "exp": 1708951200
}
```

**Validación de sesión:**

```typescript
// src/lib/server/auth/sessions.ts

export async function validateSession(sessionId: number, tokenHash: string) {
  const result = await db.select()
    .from(sesiones)
    .innerJoin(usuarios, eq(sesiones.userId, usuarios.id))
    .where(eq(sesiones.id, sessionId));

  // Verificar hash, invalidación, expiración, usuario activo
  if (session.tokenHash !== tokenHash) return null;
  if (session.invalidatedAt) return null;
  if (session.expiresAt < new Date()) return null;
  if (!user.activo) return null;

  return { session, user };
}
```

### Cookie de Sesión

| Atributo | Valor | Propósito |
|----------|-------|-----------|
| `HttpOnly` | true | Prevenir acceso JavaScript |
| `Secure` | true | Solo HTTPS |
| `SameSite` | Lax | Protección CSRF |
| `Path` | / | Disponible en toda la app |
| `Max-Age` | 604800 | 7 días en segundos |

---

## Autorización (RBAC)

### Roles del Sistema

| Rol | Nivel | Permisos |
|-----|-------|----------|
| USUARIO | 0 | Gestión de sus propios datos |
| INVESTIGADOR | 1 | Acceso a gráficos y análisis |
| ADMIN | 2 | Acceso completo, gestión de usuarios |

### Jerarquía de Roles

```typescript
// src/lib/server/auth/roles.ts

const ROLE_LEVEL = {
  USUARIO: 0,
  INVESTIGADOR: 1,
  ADMIN: 2
};

export function requireRole(userRol: Rol | undefined, minRole: Rol): void {
  if (!isValidRol(userRol) || ROLE_LEVEL[userRol] < ROLE_LEVEL[minRole]) {
    throw redirect(303, '/dashboard');
  }
}
```

### Protección de Rutas

| Ruta | Rol Mínimo | Descripción |
|------|------------|-------------|
| `/admin/*` | ADMIN | Panel de administración |
| `/investigador/*` | INVESTIGADOR | Vista de investigador |
| `/dashboard/*` | USUARIO | Dashboard de usuario |
| `/api/*` | USUARIO | Endpoints API |
| `/auth/login` | Público | Autenticación |

**Implementación en hooks:**

```typescript
// src/hooks.server.ts

const PROTECTED_ROUTES = {
  '/admin': 'ADMIN',
  '/investigador': 'INVESTIGADOR'
};

checkRoleAuthorization(event.url.pathname, event.locals.user);
```

---

## Multi-Tenancy

### Aislamiento de Datos

Todas las tablas productivas incluyen `user_id` como foreign key. Las consultas siempre filtran por el usuario autenticado.

**Tablas con multi-tenancy:**

- `lugares`
- `ciclos`
- `mediciones`
- `biblioteca`
- `api_keys`
- `consentimientos`

**Ejemplo de consulta segura:**

```typescript
// Siempre filtrar por userId
const centros = await db
  .select()
  .from(lugares)
  .where(eq(lugares.userId, event.locals.user.id));
```

### Validación en Server Actions

```typescript
// Verificar propiedad antes de operaciones
const centro = await db
  .select()
  .from(lugares)
  .where(and(
    eq(lugares.id, centroId),
    eq(lugares.userId, userId)  // Siempre verificar
  ));

if (!centro.length) {
  throw error(404, 'Recurso no encontrado');
}
```

---

## Rate Limiting

### Configuración

| Tipo | Límite | Ventana | Propósito |
|------|--------|---------|-----------|
| Login por IP | 10 intentos | 15 minutos | Prevenir fuerza bruta |
| Login por email | 5 intentos | 15 minutos | Proteger cuentas |
| API general | 100 solicitudes | 1 minuto | Uso normal |
| Exportación | 5 solicitudes | 1 hora | Recursos intensivos |
| Email cooldown | 1 email | 60 segundos | Prevenir spam |

### Implementación

```typescript
// src/lib/server/rateLimiter.ts

export async function checkRateLimit(
  identifier: string,
  tipo: 'IP' | 'EMAIL'
): Promise<RateLimitResult> {
  const windowStart = new Date(Date.now() - 15 * 60 * 1000);
  
  const attempts = await db
    .select()
    .from(rateLimitLogs)
    .where(and(
      eq(rateLimitLogs.identifier, identifier),
      gte(rateLimitLogs.createdAt, windowStart)
    ));

  const limit = tipo === 'IP' ? 10 : 5;
  
  if (attempts.length >= limit) {
    return { allowed: false, resetIn: ... };
  }

  // Registrar intento
  await db.insert(rateLimitLogs).values({ identifier, tipo });
  return { allowed: true };
}
```

### Headers de Rate Limiting

Las respuestas API incluyen:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708346400
```

---

## API Keys

### Características

- Una clave por usuario
- Prefijo `myt_` para identificación
- Hash SHA-256 almacenado
- Rotación manual por el usuario

### Generación

```typescript
// Generar API key
const rawKey = `myt_${randomBytes(32).toString('hex')}`;
const keyHash = createHash('sha256').update(rawKey).digest('hex');

await db.insert(apiKeys).values({
  key: keyHash,
  userId
});

// Retornar clave raw UNA sola vez
return rawKey;
```

### Uso

```bash
curl -H "Authorization: Bearer myt_xxxx..." \
  https://api.mytilusdata.cl/api/centros
```

### Validación

```typescript
// src/lib/server/hooks.ts

export async function authenticateApiRequest(event: RequestEvent) {
  const authHeader = event.request.headers.get('Authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    const key = authHeader.slice(7);
    const keyHash = createHash('sha256').update(key).digest('hex');
    
    const apiKey = await db.select()
      .from(apiKeys)
      .where(eq(apiKeys.key, keyHash));
    
    if (apiKey.length) {
      event.locals.user = await getUser(apiKey[0].userId);
      return true;
    }
  }
  
  return false;
}
```

### Rotación

El usuario puede regenerar su API key desde `/perfil`. La clave anterior se invalida inmediatamente.

---

## Cloudflare Turnstile (CAPTCHA)

### Propósito

Protección contra bots en el formulario de login.

### Configuración

| Variable | Descripción |
|----------|-------------|
| `TURNSTILE_SECRET_KEY` | Clave secreta para validación server-side |
| `PUBLIC_TURNSTILE_SITE_KEY` | Clave pública para widget client-side |

### Implementación Client

```svelte
<!-- src/lib/components/auth/turnstile.ts -->
<script>
  import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
  
  // Cargar widget de Turnstile
  const widget = turnstile.render('#turnstile-container', {
    sitekey: PUBLIC_TURNSTILE_SITE_KEY,
    callback: (token) => { /* token listo */ }
  });
</script>
```

### Validación Server

```typescript
// Validar token de Turnstile
const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
  method: 'POST',
  body: JSON.stringify({
    secret: TURNSTILE_SECRET_KEY,
    response: turnstileToken
  })
});

const { success } = await response.json();
if (!success) {
  return fail(400, { captchaError: true });
}
```

---

## Headers de Seguridad HTTP

### Headers Aplicados

```typescript
// src/lib/server/hooks.ts

export function applyApiSecurityHeaders(response: Response) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=()');
}
```

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.resend.com;
  frame-src https://challenges.cloudflare.com;
">
```

### Headers en HTML

```typescript
export function transformPageWithSecurityMeta(html: string): string {
  return html
    .replace('<html', '<html lang="es"')
    .replace('<head>', `<head>
      <meta http-equiv="X-Content-Type-Options" content="nosniff">
      <meta http-equiv="X-Frame-Options" content="DENY">
      <!-- CSP y otros headers -->
    `);
}
```

---

## Auditoría y Logging

### Eventos Registrados

| Evento | Descripción |
|--------|-------------|
| `LOGIN_SUCCESS` | Login exitoso |
| `LOGIN_FAILED` | Intento fallido |
| `LOGOUT` | Cierre de sesión |
| `API_KEY_CREATED` | Creación de API key |
| `API_KEY_REVOKED` | Revocación de API key |
| `USER_CREATED` | Nuevo usuario |
| `USER_DEACTIVATED` | Usuario desactivado |
| `ROLE_CHANGED` | Cambio de rol |

### Estructura de Log

```typescript
// src/lib/server/db/schema/audit.ts

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => usuarios.id),
  accion: text('accion').notNull(),
  entidad: text('entidad'),
  entidadId: integer('entidad_id'),
  ip: text('ip'),
  userAgent: text('user_agent'),
  detalles: text('detalles'),
  createdAt: timestamp('created_at').defaultNow()
});
```

### Registro de Eventos

```typescript
await db.insert(auditLogs).values({
  userId: user.id,
  accion: 'LOGIN_SUCCESS',
  entidad: 'usuario',
  entidadId: user.id,
  ip: event.getClientAddress(),
  userAgent: event.request.headers.get('user-agent'),
  detalles: JSON.stringify({ method: 'magic_link' })
});
```

---

## Manejo de Secretos

### Variables de Entorno

| Variable | Uso | Rotación |
|----------|-----|----------|
| `DATABASE_URL` | Conexión BD | Admin de BD |
| `JWT_SECRET` | Firma de tokens | Re-login todos los usuarios |
| `RESEND_API_KEY` | Envío de emails | Panel de Resend |
| `TURNSTILE_SECRET_KEY` | Validación CAPTCHA | Panel de Cloudflare |
| `EMAIL_FROM` | Email remitente | No aplica |

### Almacenamiento

- **Desarrollo:** Archivo `.env` (excluido de Git)
- **Producción:** Variables de entorno de Vercel
- **Nunca:** Commitear secretos al repositorio

### Rotación de JWT_SECRET

1. Generar nuevo secreto: `openssl rand -hex 32`
2. Actualizar en Vercel
3. Redeploy
4. Todas las sesiones existentes se invalidan automáticamente

---

## Cumplimiento Normativo

### Ley 19.628 (Protección de Datos Personales - Chile)

**Implementación:**
- Consentimiento explícito registrado en `consentimientos`
- Derecho de acceso: exportación de datos desde `/perfil`
- Derecho de eliminación: "Zona de peligro" en perfil

### Ley 20.285 (Transparencia - Chile)

**Implementación:**
- Términos de servicio accesibles en `/condiciones-servicios`
- Información de contacto del responsable

### NCh-ISO IEC 27001:2020

**Controles implementados:**
- Control de acceso (RBAC)
- Criptografía (hash SHA-256, HTTPS)
- Registro de auditoría
- Gestión de incidentes

---

## Consideraciones de Producción

### Checklist Pre-Deploy

- [ ] Variables de entorno configuradas
- [ ] HTTPS habilitado
- [ ] Dominio configurado en cookies
- [ ] Rate limiting activo
- [ ] Turnstile en modo "managed"
- [ ] Logs de auditoría funcionando
- [ ] Backup de BD configurado

### Monitoreo Recomendado

- Intentos de login fallidos (posible ataque)
- Requests con rate limit excedido
- Errores de validación de Turnstile
- Accesos desde IPs inusuales

### Respuesta a Incidentes

1. **Compromiso de cuenta:**
   - Invalidar todas las sesiones del usuario
   - Rotar API key
   - Registrar en audit_logs

2. **Compromiso de JWT_SECRET:**
   - Rotar secreto inmediatamente
   - Forzar re-login de todos los usuarios
   - Revisar audit_logs de las últimas 24h

3. **Ataque de fuerza bruta:**
   - Verificar rate limiting activo
   - Considerar bloqueo temporal de IP
   - Revisar patrones en audit_logs

---

## Vulnerabilidades Conocidas y Mitigaciones

### Sin Offline Support

**Riesgo:** Usuarios en terreno sin conectividad no pueden usar el sistema.

**Mitigación:** Documentar requisito de conectividad. Futuro: implementar PWA con sync.

### ETL Python Separado

**Riesgo:** Script externo no sigue las mismas validaciones.

**Mitigación:** Ejecutar solo en ambiente controlado. Futuro: integrar en el pipeline principal.

### Columnas Legacy en `lugares`

**Riesgo:** `latitud`/`longitud` pueden desincronizarse de `geom`.

**Mitigación:** Usar `geom` como fuente de verdad. Mantener columnas legacy solo para rollback.

---

## Checklist de Seguridad

### Desarrollo

- [ ] Validar todas las entradas con Zod
- [ ] Usar parámetros en consultas SQL (Drizzle lo hace automático)
- [ ] Verificar `userId` en todas las operaciones
- [ ] No exponer información sensible en logs
- [ ] Usar `fail` en lugar de `error` para errores esperados

### Code Review

- [ ] Verificar autenticación en endpoints
- [ ] Revisar autorización por rol
- [ ] Comprobar rate limiting
- [ ] Validar sanitización de inputs
- [ ] Verificar manejo de errores

### Pre-Producción

- [ ] Secrets configurados
- [ ] HTTPS obligatorio
- [ ] Headers de seguridad presentes
- [ ] CSP configurado
- [ ] Rate limiting activo

---

## Referencias

- [Documentación de API](./api.md) - Endpoints y autenticación
- [Arquitectura](./architecture.md) - Contexto del sistema
- [Base de Datos](./database.md) - Tablas de seguridad
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [SvelteKit Security](https://svelte.dev/docs/kit/security)
- [JWT Best Practices](https://auth0.com/blog/jwt-authentication-best-practices/)