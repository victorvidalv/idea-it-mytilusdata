# Arquitectura del Sistema

Este documento describe las decisiones tecnológicas y patrones de diseño utilizados en el proyecto.

## Stack Tecnológico

- **Frontend/Backend**: [Next.js 15+](https://nextjs.org/) utilizando el **App Router**.
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) para asegurar robustez y tipado estático.
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/) (gestionado vía Neon).
- **ORM**: [Prisma](https://www.prisma.io/) para el modelado y consultas de base de datos.
- **Internacionalización**: `next-intl` para soportar múltiples idiomas (ES/EN).
- **Estilos**: Tailwind CSS y componentes de UI modernos.

## Decisiones Arquitectónicas

### 1. Services Pattern (Capa de Negocio)
Se implementó una capa de servicios en `lib/services` para desacoplar la lógica de negocio de las rutas de la API (`app/api`). Esto permite:
- Reutilización de código entre diferentes endpoints.
- Facilitar las pruebas unitarias.
- Centralizar la validación de datos.

### 2. Eliminación Lógica (Soft Delete)
Para mantener la integridad referencial y el historial de auditoría, el sistema utiliza un campo `deleted_at` en tablas clave (Mediciones, Lugares, Unidades). 
- **Decisión**: Nunca se ejecutan comandos `DELETE` directos en registros primarios.
- **Implementación**: Las consultas filtran automáticamente registros donde `deleted_at` es nulo.

### 3. Internacionalización (i18n)
El sistema está diseñado para ser multilingüe desde su núcleo. La configuración reside en `i18n.ts` y utiliza middlewares para detectar y persistir el idioma del usuario.

### 4. Gestión de Estado y UI
Se prioriza el uso de **Server Components** para la recuperación de datos inicial y **Client Components** solo donde la interactividad es estrictamente necesaria, optimizando los tiempos de carga y el SEO.

## Estructura de Directorios Clave

- `/app`: Rutas del sistema, layouts y APIs.
- `/components`: Componentes de interfaz reutilizables.
- `/lib/services`: Lógica de negocio y acceso a datos.
- `/prisma`: Esquema de base de datos y migraciones.
- `/messages`: Archivos de traducción JSON.
