# MytilusData

[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.55-FF3E00?style=flat&logo=svelte)](https://kit.svelte.dev/)
[![Svelte](https://img.shields.io/badge/Svelte-5-FF3E00?style=flat&logo=svelte)](https://svelte.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Privado-red)](LICENSE)

Plataforma web especializada para la gestión de datos de mitilicultura (cultivo de mejillones). Permite a investigadores y administradores registrar, visualizar y exportar datos de centros de cultivo, ciclos productivos y mediciones ambientales y biológicas.

## Características Principales

- **Autenticación passwordless** mediante Magic Links
- **Gestión de centros de cultivo** con coordenadas geográficas y visualización en mapa
- **Control de ciclos productivos** desde siembra hasta cosecha
- **Registro de mediciones** con tipología configurable y normalización de unidades
- **Visualización de datos** con gráficos y mapas interactivos
- **Exportación a Excel** con formato profesional
- **API REST** para integración con sistemas externos
- **Multi-tenancy** con aislamiento de datos por usuario
- **RBAC** con roles USUARIO, INVESTIGADOR y ADMIN

## Requisitos

| Software       | Versión Mínima |
| -------------- | -------------- |
| Node.js        | 20.x           |
| npm            | 10.x           |
| PostgreSQL     | 15.x           |

## Inicio Rápido

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd plataforma_idea2025

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# Sincronizar base de datos
npm run db:push

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

## Configuración

### Variables de Entorno Requeridas

| Variable          | Descripción                              |
| ----------------- | ---------------------------------------- |
| `DATABASE_URL`    | URL de conexión a PostgreSQL             |
| `RESEND_API_KEY`  | API Key de Resend para envío de emails   |
| `JWT_SECRET`      | Secreto para JWT (mínimo 32 caracteres)  |
| `EMAIL_FROM`      | Email remitente para Magic Links         |

### Variables Opcionales

| Variable                    | Descripción                    |
| --------------------------- | ------------------------------ |
| `TURNSTILE_SECRET_KEY`      | Clave secreta de Cloudflare    |
| `PUBLIC_TURNSTILE_SITE_KEY` | Clave pública de Cloudflare    |
| `INITIAL_ADMIN_EMAIL`       | Email del administrador inicial |

## Comandos Disponibles

### Desarrollo

| Comando           | Descripción                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Servidor de desarrollo (localhost:5173)  |
| `npm run build`   | Compilar para producción                 |
| `npm run preview` | Previsualizar build de producción        |

### Calidad de Código

| Comando               | Descripción                       |
| --------------------- | --------------------------------- |
| `npm run check`       | Verificación de tipos             |
| `npm run lint`        | ESLint y Prettier                 |
| `npm run format`      | Formatear código                  |

### Testing

| Comando             | Descripción                |
| ------------------- | -------------------------- |
| `npm run test:unit` | Tests unitarios (Vitest)   |
| `npm run test:e2e`  | Tests E2E (Playwright)     |

### Base de Datos

| Comando               | Descripción                        |
| --------------------- | ---------------------------------- |
| `npm run db:push`     | Sincronizar esquema (desarrollo)   |
| `npm run db:generate` | Generar migraciones                |
| `npm run db:migrate`  | Aplicar migraciones                |
| `npm run db:studio`   | Abrir Drizzle Studio               |

### Utilidades

| Comando                | Descripción                  |
| ---------------------- | ---------------------------- |
| `npm run poblar`       | Poblar BD con datos de prueba|
| `npm run limpiar`      | Limpiar datos de prueba      |
| `npm run create-admin` | Asignar rol ADMIN a usuario  |

## Tecnologías

- **Framework**: SvelteKit 2.55 + Svelte 5
- **Lenguaje**: TypeScript 5.9
- **Base de datos**: PostgreSQL (Neon) + Drizzle ORM
- **UI**: TailwindCSS 4 + shadcn-svelte
- **Mapas**: MapLibre GL + svelte-maplibre
- **Visualización**: LayerChart
- **Email**: Resend
- **Testing**: Vitest + Playwright

## Documentación

### Índice Central

La documentación completa está organizada en [`docs/README.md`](./docs/README.md), que incluye navegación por audiencia, tema y nivel.

### Documentación Técnica

| Documento | Descripción |
| --------- | ----------- |
| [Visión General](./docs/overview.md) | Propósito y funcionalidades del sistema |
| [Instalación](./docs/installation.md) | Guía detallada de instalación y configuración |
| [Arquitectura](./docs/architecture.md) | Arquitectura técnica del sistema |
| [Base de Datos](./docs/database.md) | Esquema y migraciones de base de datos |
| [API REST](./docs/api.md) | Documentación de endpoints |
| [Seguridad](./docs/security.md) | Arquitectura de seguridad y autenticación |
| [Componentes](./docs/components.md) | Catálogo de componentes UI reutilizables |
| [Testing](./docs/testing.md) | Guía de testing unitario y E2E |

### Documentación Operativa

| Documento | Descripción |
| --------- | ----------- |
| [Guía de Usuario](./docs/user-guide.md) | Manual para operadores |
| [Runbook](./docs/runbook.md) | Guía de operación y troubleshooting |
| [FAQ](./docs/faq.md) | Preguntas frecuentes |

### Documentación de Negocio

| Documento | Descripción |
| --------- | ----------- |
| [Modelo de Negocio](./docs/business-model.md) | Contexto de mercado, modelo de negocio y estrategia del proyecto |
| [Modelo Predictivo](./docs/modelado-predictivo.md) | Documentación del modelo de predicción de crecimiento |

## Estructura del Proyecto

```
src/
├── lib/
│   ├── components/       # Componentes Svelte
│   ├── server/           # Lógica de servidor
│   │   ├── db/          # Esquema y conexión BD
│   │   └── auth/        # Autenticación y sesiones
│   ├── validations/      # Esquemas Zod
│   └── utils/            # Utilidades
├── routes/
│   ├── (app)/           # Rutas autenticadas
│   ├── api/             # Endpoints REST
│   └── auth/            # Autenticación
└── hooks.server.ts      # Hooks de servidor
```

## Licencia

Privado - Todos los derechos reservados.
