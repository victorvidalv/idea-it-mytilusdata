# MytilusData

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

| Comando               | Descripción                                           |
| --------------------- | ----------------------------------------------------- |
| `npm run check`       | Verificación de tipos                                 |
| `npm run lint`        | ESLint y Prettier                                     |
| `npm run format`      | Formatear código                                      |
| `npm run analyze`     | Analizar calidad del código y generar reporte         |

### Nivel de Calidad Actual

> 🟢 **AVANZADO** — Código bien organizado, baja complejidad y duplicación. Buena cobertura de pruebas.

| Métrica                  | Valor  | Umbral Profesional |
| ------------------------ | ------ | ------------------ |
| Complejidad promedio     | 3.5    | ≤ 4                |
| Código duplicado         | 9.81%  | ≤ 8%               |
| Ratio tests/fuente       | 8.6%   | ≥ 15%              |
| Archivos con advertencia | 2.4%   | 0%                 |

Ejecuta `npm run analyze` para regenerar el reporte completo en `code-quality-report.txt`.

**Escala de niveles:**
- ⭐ **Profesional** — Alta calidad, mínima complejidad/duplicación, tests sólidos
- 🟢 **Avanzado** — Buena calidad, complejidad controlada, tests presentes
- 🟡 **Intermedio** — Calidad aceptable, margen de mejora
- 🔴 **Básico** — Requiere refactorización importante

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

- **Framework**: SvelteKit 2 + Svelte 5
- **Lenguaje**: TypeScript 5
- **Base de datos**: PostgreSQL (Neon) + Drizzle ORM
- **UI**: TailwindCSS 4 + shadcn-svelte
- **Visualización**: Leaflet + LayerChart
- **Email**: Resend
- **Testing**: Vitest + Playwright

## Documentación

| Documento                                   | Descripción                     |
| ------------------------------------------- | ------------------------------- |
| [Visión General](./docs/overview.md)        | Propósito y funcionalidades     |
| [Instalación](./docs/installation.md)       | Guía detallada de instalación   |
| [Arquitectura](./docs/architecture.md)      | Arquitectura técnica del sistema|
| [API REST](./docs/api.md)                   | Documentación de endpoints      |

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
