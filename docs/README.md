# Documentación de MytilusData

**Última actualización:** 2026-04-24

Bienvenido a la documentación de MytilusData, una plataforma web especializada para la gestión de datos de mitilicultura (cultivo de mejillones).

---

## Navegación Rápida por Audiencia

### Para Desarrolladores Nuevos

| Documento                                            | Descripción                              | Tiempo de lectura |
| ---------------------------------------------------- | ---------------------------------------- | ----------------- |
| [Visión General](./overview.md)                      | Propósito, funcionalidades y tecnologías | 10 min            |
| [Instalación](./installation.md)                     | Configuración completa del entorno       | 15 min            |
| [Arquitectura](./architecture.md)                    | Diseño técnico y decisiones              | 20 min            |
| [Estándares de Calidad](./code-quality-standards.md) | Convenciones y métricas                  | 15 min            |

### Para Desarrolladores Activos

| Documento                      | Descripción                               | Tiempo de lectura |
| ------------------------------ | ----------------------------------------- | ----------------- |
| [API REST](./api.md)           | Endpoints y ejemplos de uso               | 20 min            |
| [Base de Datos](./database.md) | Esquema, migraciones y consultas          | 15 min            |
| [Componentes](./components.md) | Catálogo de componentes UI                | 15 min            |
| [Testing](./testing.md)        | Estrategia y ejecución de tests           | 15 min            |
| [Seguridad](./security.md)     | Autenticación, autorización, cumplimiento | 20 min            |

### Para Operadores y DevOps

| Documento                        | Descripción                                    | Tiempo de lectura |
| -------------------------------- | ---------------------------------------------- | ----------------- |
| [Runbook](./runbook.md)          | Operaciones, despliegue, troubleshooting       | 20 min            |
| [Instalación](./installation.md) | Variables de entorno, comandos                 | 15 min            |
| [Seguridad](./security.md)       | Cumplimiento normativo, respuesta a incidentes | 20 min            |

### Para Usuarios Finales

| Documento                          | Descripción            | Tiempo de lectura |
| ---------------------------------- | ---------------------- | ----------------- |
| [Guía de Usuario](./user-guide.md) | Manual completo de uso | 20 min            |
| [FAQ](./faq.md)                    | Preguntas frecuentes   | 10 min            |

### Para Integradores Externos

| Documento                  | Descripción                         | Tiempo de lectura |
| -------------------------- | ----------------------------------- | ----------------- |
| [API REST](./api.md)       | Documentación completa de endpoints | 20 min            |
| [Seguridad](./security.md) | Autenticación con API Keys          | 20 min            |

### Para Investigadores

| Documento                                                               | Descripción                                     | Tiempo de lectura |
| ----------------------------------------------------------------------- | ----------------------------------------------- | ----------------- |
| [Fundamentos del Modelo Predictivo](./fundamentos-modelo-predictivo.md) | Fundamentos, algoritmo, riesgo e implementación | 15 min            |
| [Guía de Usuario](./user-guide.md)                                      | Panel de investigador                           | 20 min            |
| [Modelo de Negocio](./business-model.md)                                | Contexto del proyecto                           | 10 min            |

---

## Navegación por Tema

### Arquitectura y Diseño

| Documento                            | Contenido principal                                      |
| ------------------------------------ | -------------------------------------------------------- |
| [architecture.md](./architecture.md) | Diagramas, capas, flujos de autenticación, rate limiting |
| [overview.md](./overview.md)         | Tecnologías, estructura de directorios, convenciones     |
| [database.md](./database.md)         | Esquema entidad-relación, migraciones Drizzle, PostGIS   |

### Desarrollo

| Documento                                                | Contenido principal                                   |
| -------------------------------------------------------- | ----------------------------------------------------- |
| [installation.md](./installation.md)                     | Setup, variables de entorno, comandos npm             |
| [api.md](./api.md)                                       | Endpoints GET, rate limiting, ejemplos cURL/Python/JS |
| [components.md](./components.md)                         | Componentes por dominio, patrones, testing            |
| [testing.md](./testing.md)                               | Vitest, Playwright, cobertura, mocks                  |
| [code-quality-standards.md](./code-quality-standards.md) | Métricas, principios DRY/KISS, convenciones           |

### Seguridad

| Documento                    | Contenido principal                              |
| ---------------------------- | ------------------------------------------------ |
| [security.md](./security.md) | Magic Links, JWT, RBAC, rate limiting, auditoría |
| [api.md](./api.md)           | Autenticación API Key, headers de seguridad      |

### Operaciones

| Documento                            | Contenido principal                            |
| ------------------------------------ | ---------------------------------------------- |
| [runbook.md](./runbook.md)           | Despliegue, monitoreo, backup, troubleshooting |
| [installation.md](./installation.md) | Comandos de base de datos, scripts de utilidad |

### Negocio

| Documento                                                              | Contenido principal                                          |
| ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| [business-model.md](./business-model.md)                               | Modelo Canvas, segmentos, propuesta de valor                 |
| [fundamentos-modelo-predictivo.md](./fundamentos-modelo-predictivo.md) | Fundamentos, riesgo, visualización y funciones implementadas |

### Usuario

| Documento                        | Contenido principal                                |
| -------------------------------- | -------------------------------------------------- |
| [user-guide.md](./user-guide.md) | Gestión de centros, ciclos, registros, exportación |
| [faq.md](./faq.md)               | Preguntas por categoría, solución de problemas     |

---

## Navegación por Nivel

### Introductorio

Empezar aquí si eres nuevo en el proyecto:

1. [Visión General](./overview.md) - Entender qué es MytilusData
2. [Instalación](./installation.md) - Configurar el entorno
3. [Guía de Usuario](./user-guide.md) - Usar la aplicación

### Intermedio

Para profundizar en aspectos técnicos:

1. [Arquitectura](./architecture.md) - Entender el diseño
2. [Base de Datos](./database.md) - Conocer el esquema
3. [API REST](./api.md) - Integrar con sistemas externos
4. [Componentes](./components.md) - Reutilizar componentes UI

### Avanzado

Para tareas especializadas:

1. [Seguridad](./security.md) - Implementar medidas de seguridad
2. [Testing](./testing.md) - Escribir y ejecutar tests
3. [Runbook](./runbook.md) - Operar en producción
4. [Fundamentos del Modelo Predictivo](./fundamentos-modelo-predictivo.md) - Comprender fundamentos, riesgo e interpretación
5. [Estándares de Calidad](./code-quality-standards.md) - Mantener calidad de código

---

## Informes y Análisis

| Documento                                                    | Descripción                                 |
| ------------------------------------------------------------ | ------------------------------------------- |
| [informe-tecnico-analisis.md](./informe-tecnico-analisis.md) | Análisis técnico completo del proyecto      |
| [informe-calidad-codigo.md](./informe-calidad-codigo.md)     | Métricas de calidad, archivos problemáticos |
| [evaluacion-documentacion.md](./evaluacion-documentacion.md) | Evaluación inicial de documentación         |
| [revision-documentacion.md](./revision-documentacion.md)     | Revisión final de completitud               |

---

## Referencias Externas

| Recurso        | Enlace                                    |
| -------------- | ----------------------------------------- |
| SvelteKit Docs | https://kit.svelte.dev/docs               |
| Svelte 5 Docs  | https://svelte-5-preview.vercel.app/docs  |
| Drizzle ORM    | https://orm.drizzle.team/docs/overview    |
| Neon Database  | https://neon.tech/docs/introduction       |
| Vercel Docs    | https://vercel.com/docs                   |
| Resend Docs    | https://resend.com/docs                   |
| MapLibre GL    | https://maplibre.org/maplibre-gl-js/docs/ |

---

## Convenciones de esta Documentación

### Formato

- **Idioma:** Español
- **Formato:** Markdown
- **Diagramas:** Mermaid
- **Código:** Bloques con syntax highlighting

### Estructura de Documentos

Cada documento incluye:

1. **Propósito:** Qué problema resuelve
2. **Audiencia:** A quién está dirigido
3. **Contenido:** Secciones organizadas jerárquicamente
4. **Referencias:** Enlaces a documentos relacionados

### Iconos de Estado

| Icono | Significado               |
| ----- | ------------------------- |
| ✅    | Completo / Actualizado    |
| ⚠️    | Requiere atención         |
| ❌    | Faltante / Desactualizado |

---

## Mantenimiento

### Actualización de Documentación

La documentación debe actualizarse cuando:

- Se agrega nueva funcionalidad
- Se modifica comportamiento existente
- Se detectan errores o imprecisiones
- Cambian dependencias o versiones principales

### Proceso de Revisión

1. Verificar precisión técnica
2. Comprobar referencias cruzadas
3. Validar ejemplos de código
4. Revisar consistencia terminológica

---

## Contacto

Para consultas sobre el proyecto:

- **Institución ejecutora:** Universidad Santo Tomás
- **Brazo tecnológico:** INTEMIT
- **Gremio mandante:** AmiChile
