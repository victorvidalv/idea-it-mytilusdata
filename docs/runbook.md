# Runbook - Manual de Operaciones de MytilusData

**Fecha:** 2026-03-19
**Versión:** 1.0
**Audiencia:** Operadores, DevOps, administradores de sistema

---

## Propósito

Este runbook proporciona procedimientos operativos para desplegar, monitorear, mantener y resolver incidentes en MytilusData. Permite a operadores ejecutar tareas críticas con pasos claros y verificables.

---

## Arquitectura de Despliegue

### Diagrama de Infraestructura

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL (Edge Network)                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              SvelteKit Application                       │   │
│  │  • Static Assets (CDN)                                   │   │
│  │  • Serverless Functions (Node.js)                        │   │
│  │  • Edge Middleware (Auth, Security)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NEON SERVERLESS (PostgreSQL)                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Base de Datos Principal                     │   │
│  │  • PostgreSQL 16 + PostGIS                               │   │
│  │  • Auto-suspend (scale to zero)                          │   │
│  │  • Branching para staging                                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                            │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │   Resend (Email) │  │ Cloudflare       │                    │
│  │   Magic Links    │  │ Turnstile        │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes

| Componente | Plataforma | Región | Responsabilidad |
|------------|------------|--------|-----------------|
| Frontend + API | Vercel | Auto (Edge) | Servir aplicación y endpoints |
| Base de datos | Neon Serverless | US East (AWS) | Almacenamiento persistente |
| Email | Resend | Global | Envío de magic links |
| CAPTCHA | Cloudflare Turnstile | Global | Protección contra bots |

---

## Variables de Entorno Críticas

### Producción

| Variable | Descripción | Rotación | Impacto si falta |
|----------|-------------|----------|------------------|
| `DATABASE_URL` | Conexión PostgreSQL | Admin BD | App no inicia |
| `JWT_SECRET` | Firma de tokens | Forza re-login | Sesiones inválidas |
| `RESEND_API_KEY` | Envío de emails | Panel Resend | Login imposible |
| `EMAIL_FROM` | Remitente emails | No aplica | Emails no envían |
| `TURNSTILE_SECRET_KEY` | Validación CAPTCHA | Panel CF | Bots sin filtro |
| `PUBLIC_TURNSTILE_SITE_KEY` | Widget CAPTCHA | Panel CF | Widget no carga |
| `INITIAL_ADMIN_EMAIL` | Admin inicial | No aplica | Solo setup inicial |

### Verificar configuración

```bash
# En Vercel CLI
vercel env ls

# Verificar variables críticas
vercel env pull .env.production
```

---

## Procedimientos de Despliegue

### Despliegue a Producción

**Prerrequisitos:**
- Rama `main` actualizada
- Tests pasando (`npm run test`)
- Variables de entorno configuradas en Vercel

**Pasos:**

```bash
# 1. Verificar tests localmente
npm run test:unit -- --run

# 2. Verificar build
npm run build

# 3. Aplicar migraciones pendientes
npm run db:migrate

# 4. Push a main (trigger automático en Vercel)
git push origin main
```

**Verificación post-despliegue:**

1. Acceder a la URL de producción
2. Verificar login con magic link
3. Comprobar endpoints API: `GET /api/centros`
4. Revisar logs en Vercel Dashboard

### Despliegue a Staging

**Usando Neon Branching:**

```bash
# 1. Crear branch de base de datos en Neon Console
#    https://console.neon.tech/app/projects/<project-id>

# 2. Configurar DATABASE_URL de staging en Vercel (Preview)

# 3. Crear PR (trigger automático de preview)
git checkout -b feature/nueva-funcionalidad
git push origin feature/nueva-funcionalidad
# Crear PR en GitHub

# 4. Vercel genera URL de preview automáticamente
```

### Rollback

**Opción 1: Re-deploy desde Vercel Dashboard**

1. Ir a Vercel Dashboard → Proyecto → Deployments
2. Encontrar deployment estable anterior
3. Clic en "..." → "Promote to Production"

**Opción 2: Git Revert**

```bash
# Revertir commit
git revert HEAD
git push origin main

# Vercel re-deploya automáticamente
```

**Opción 3: Migración de BD**

```bash
# Si migración causó problemas, revertir schema
# NOTA: Requiere backup previo
psql $DATABASE_URL < backup_$(date +%Y%m%d).sql
```

---

## Monitoreo y Alertas

### Métricas Clave

| Métrica | Umbral Normal | Umbral de Alerta | Acción |
|---------|---------------|------------------|--------|
| Response Time | < 500ms | > 2s | Investigar queries |
| Error Rate | < 1% | > 5% | Revisar logs |
| DB Connections | < 10 | > 80 | Escalar o optimizar |
| Failed Logins/min | < 5 | > 20 | Posible ataque |
| Email Bounce Rate | < 2% | > 10% | Verificar dominio |

### Dónde Monitorear

| Plataforma | Qué monitorear | URL |
|------------|----------------|-----|
| Vercel Dashboard | Deploys, Functions, Logs | `vercel.com/dashboard` |
| Neon Console | DB metrics, connections | `console.neon.tech` |
| Resend Dashboard | Email delivery, bounces | `resend.com/emails` |

### Configurar Alertas

**Vercel (Slack/Email):**

1. Project Settings → Notifications
2. Habilitar: "Failed Deployments", "Errors"
3. Configurar webhook de Slack

**Neon:**

1. Project Settings → Integrations
2. Configurar alertas de consumo y conexiones

---

## Procedimientos de Backup y Recuperación

### Backup Automático (Neon)

Neon Serverless incluye:
- **Point-in-time recovery (PITR):** Hasta 7 días
- **Snapshots automáticos:** Diarios
- **Branching:** Crear branch antes de cambios mayores

### Backup Manual

```bash
# Usando pg_dump
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Solo datos (sin schema)
pg_dump --data-only $DATABASE_URL > data_backup_$(date +%Y%m%d).sql

# Solo schema
pg_dump --schema-only $DATABASE_URL > schema_backup.sql
```

### Restaurar desde Backup

```bash
# Restaurar completo
psql $DATABASE_URL < backup_20260319.sql

# Restaurar a punto específico (Neon)
# Usar Neon Console → "Time Travel" → Seleccionar timestamp
```

### Crear Branch de Respaldo (Neon)

Antes de operaciones riesgosas:

1. Neon Console → Project → Branches
2. "Create Branch" → Nombrar: `backup-pre-cambio`
3. Realizar operación
4. Si hay problemas, promover branch a main

---

## Troubleshooting Común

### Error: "Database connection failed"

**Síntomas:**
- 500 Internal Server Error
- Logs: "Connection refused" o "SSL required"

**Diagnóstico:**

```bash
# Verificar conexión
psql $DATABASE_URL -c "SELECT 1"

# Verificar SSL
psql "$DATABASE_URL?sslmode=require" -c "SELECT 1"

# Verificar que Neon no esté suspendido
# Neon auto-suspend después de inactividad
```

**Solución:**

1. Verificar que `DATABASE_URL` incluye `?sslmode=require`
2. Verificar que IP no esté bloqueada (Neon no restringe IPs)
3. Si Neon está suspendido, cualquier request lo despierta (puede tardar 1-2s)

---

### Error: "JWT verification failed"

**Síntomas:**
- Usuarios desconectados
- 401 Unauthorized

**Diagnóstico:**

```bash
# Verificar que JWT_SECRET está configurado
vercel env ls | grep JWT_SECRET

# Decodificar JWT para debug
echo "eyJhbGc..." | base64 -d
```

**Solución:**

1. Verificar que `JWT_SECRET` es el mismo en todos los ambientes
2. Si se rotó el secreto, todos los usuarios deben re-login
3. Verificar que el reloj del servidor está sincronizado

---

### Error: "Rate limit exceeded"

**Síntomas:**
- 429 Too Many Requests
- Usuarios legítimos bloqueados

**Diagnóstico:**

```sql
-- Verificar rate limits activos
SELECT identifier, tipo, COUNT(*) as intentos, 
       MIN(created_at) as primero, MAX(created_at) as ultimo
FROM rate_limit_logs
WHERE created_at > NOW() - INTERVAL '15 minutes'
GROUP BY identifier, tipo
ORDER BY intentos DESC;

-- Verificar email cooldowns
SELECT email, last_sent_at 
FROM email_cooldowns 
WHERE last_sent_at > NOW() - INTERVAL '1 minute';
```

**Solución:**

```sql
-- Limpiar rate limits (usar con cuidado)
DELETE FROM rate_limit_logs WHERE identifier = 'ip-problematica';

-- Limpiar cooldown de email específico
DELETE FROM email_cooldowns WHERE email = 'usuario@ejemplo.com';
```

---

### Error: "Email not sent"

**Síntomas:**
- Magic links no llegan
- Sin errores en logs

**Diagnóstico:**

1. Verificar dashboard de Resend: https://resend.com/emails
2. Verificar que `EMAIL_FROM` tiene dominio verificado
3. Verificar que `RESEND_API_KEY` es válida

**Solución:**

1. Si emails están en "Sent" pero no llegan: verificar spam/folder promocional
2. Si hay bounces: verificar dirección de destino
3. Si API key expiró: generar nueva en Resend y actualizar en Vercel

---

### Error: "CAPTCHA validation failed"

**Síntomas:**
- Login rechazado con "Captcha error"
- Widget Turnstile no carga

**Diagnóstico:**

1. Verificar que `PUBLIC_TURNSTILE_SITE_KEY` está en el cliente
2. Verificar que `TURNSTILE_SECRET_KEY` está en el servidor
3. Verificar que las claves corresponden al mismo sitio

**Solución:**

1. Obtener nuevas claves: https://dash.cloudflare.com/?to=/:account/turnstile
2. Actualizar variables en Vercel
3. Re-deploy

---

### Error: "Build failed in Vercel"

**Síntomas:**
- Deployment falla en fase de build
- Error en logs de Vercel

**Diagnóstico:**

```bash
# Reproducir localmente
npm run build

# Verificar tipos
npm run check
```

**Solución:**

1. Revisar error específico en logs
2. Verificar que todas las dependencias están en `package.json`
3. Verificar que `NODE_VERSION` es compatible (20.x+)

---

## Escalamiento

### Cuándo Escalar

| Indicador | Umbral | Acción |
|-----------|--------|--------|
| Response time > 2s | 5 min sostenido | Investigar queries, considerar cache |
| DB connections > 80 | Sostenido | Escalar plan Neon |
| Vercel Functions timeout | Frecuente | Optimizar código o escalar plan |
| Errores 5xx > 5% | 5 min sostenido | Activar incidente |

### Contactos de Escalamiento

| Nivel | Contacto | Responsabilidad | Tiempo respuesta |
|-------|----------|-----------------|------------------|
| L1 | Equipo de desarrollo | Bugs, errores de código | 1 hora |
| L2 | DevOps / Infraestructura | Problemas de despliegue, BD | 30 min |
| L3 | Soporte de plataforma | Vercel/Neon/Resend issues | Según SLA |

**Contactos específicos:**
- **Soporte Vercel:** https://vercel.com/support
- **Soporte Neon:** https://neon.tech/docs/introduction/support
- **Soporte Resend:** https://resend.com/support

---

## Runbooks de Incidentes Comunes

### Incidente: Caída del Servicio

**Severidad:** Crítica
**Síntomas:** App no responde, 503 errors

**Pasos:**

1. **Verificar estado de servicios:**
   - Vercel Status: https://www.vercel-status.com/
   - Neon Status: https://neonstatus.com/

2. **Revisar logs:**
   ```bash
   vercel logs --follow
   ```

3. **Verificar base de datos:**
   ```bash
   psql $DATABASE_URL -c "SELECT 1"
   ```

4. **Si Vercel está caído:** Esperar resolución (fuera de control)
5. **Si Neon está caído:** Considerar activar branch de respaldo
6. **Si todo está up:** Revisar último deployment, considerar rollback

---

### Incidente: Ataque de Fuerza Bruta

**Severidad:** Alta
**Síntomas:** Múltiples intentos de login fallidos, rate limits activos

**Pasos:**

1. **Identificar IPs atacantes:**
   ```sql
   SELECT identifier, COUNT(*) as intentos
   FROM rate_limit_logs
   WHERE created_at > NOW() - INTERVAL '1 hour'
   GROUP BY identifier
   HAVING COUNT(*) > 20
   ORDER BY intentos DESC;
   ```

2. **Verificar que rate limiting funciona:**
   - Los intentos deberían estar bloqueados automáticamente

3. **Si rate limiting no es suficiente:**
   - Considerar bloqueo temporal de IP en Vercel (Firewall rules)
   - Habilitar modo "restrictivo" en Turnstile

4. **Post-incidente:**
   - Revisar audit_logs para cuentas comprometidas
   - Notificar usuarios afectados

---

### Incidente: Fuga de Datos

**Severidad:** Crítica
**Síntomas:** Acceso no autorizado a datos, reporte de usuario

**Pasos:**

1. **Contención inmediata:**
   ```sql
   -- Desactivar usuario comprometido
   UPDATE usuarios SET activo = false WHERE id = <user_id>;
   
   -- Invalidar todas las sesiones
   UPDATE sesiones SET invalidated_at = NOW() WHERE user_id = <user_id>;
   
   -- Rotar API key
   DELETE FROM api_keys WHERE user_id = <user_id>;
   ```

2. **Investigación:**
   ```sql
   -- Revisar actividad reciente
   SELECT * FROM audit_logs 
   WHERE user_id = <user_id> 
   ORDER BY created_at DESC 
   LIMIT 100;
   ```

3. **Notificación:**
   - Informar al equipo de seguridad
   - Preparar notificación a usuarios afectados (Ley 19.628)

4. **Remediación:**
   - Identificar vector de ataque
   - Aplicar parche
   - Actualizar documentación de seguridad

---

### Incidente: Corrupción de Datos

**Severidad:** Alta
**Síntomas:** Datos inconsistentes, errores de integridad

**Pasos:**

1. **Detener escrituras si es posible:**
   - Considerar modo mantenimiento

2. **Evaluar alcance:**
   ```sql
   -- Verificar integridad referencial
   SELECT * FROM mediciones m
   LEFT JOIN ciclos c ON m.ciclo_id = c.id
   WHERE m.ciclo_id IS NOT NULL AND c.id IS NULL;
   ```

3. **Restaurar desde backup:**
   - Usar PITR de Neon para punto específico
   - O restaurar desde backup manual

4. **Verificar integridad post-restauración:**
   - Ejecutar tests de integración
   - Verificar conteos de registros

---

## Checklist de Mantenimiento Regular

### Diario (Automatizado)

- [ ] Verificar logs de errores en Vercel
- [ ] Verificar tasa de entrega de emails en Resend
- [ ] Verificar conexiones de BD en Neon

### Semanal

- [ ] Revisar métricas de rendimiento
- [ ] Verificar backups recientes
- [ ] Revisar rate limits anómalos

### Mensual

- [ ] Rotar API keys de servicio (opcional)
- [ ] Revisar usuarios inactivos
- [ ] Verificar espacio en base de datos
- [ ] Actualizar dependencias críticas

### Trimestral

- [ ] Auditoría de seguridad
- [ ] Revisión de accesos y roles
- [ ] Prueba de restauración de backup
- [ ] Revisión de documentación

---

## Referencias

- [Guía de Instalación](./installation.md) - Setup inicial
- [Documentación de Seguridad](./security.md) - Políticas y procedimientos
- [Arquitectura](./architecture.md) - Diseño del sistema
- [API Reference](./api.md) - Endpoints disponibles
- [Neon Docs](https://neon.tech/docs/introduction) - Documentación de Neon
- [Vercel Docs](https://vercel.com/docs) - Documentación de Vercel
- [Resend Docs](https://resend.com/docs) - Documentación de Resend