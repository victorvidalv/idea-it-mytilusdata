# Sistema de Registro de Mediciones (https://www.mytilusdata.cl)

Este proyecto es una aplicación web robusta diseñada para el registro, gestión y exportación de mediciones ambientales o técnicas. Está desplegado bajo la infraestructura de Vercel para garantizar máxima disponibilidad y rendimiento.

## Características Principales

- **Gestión Integral**: Registro de mediciones vinculadas a lugares, unidades, orígenes y tipos específicos.
- **Seguridad por Roles**: Control de acceso granular (Admin, Equipo, Público).
- **Internacionalización**: Soporte completo para múltiples idiomas (Español/Inglés).
- **Exportación de Datos**: Generación automática de reportes en formatos PDF y Excel.
- **Integridad de Datos**: Sistema de borrado lógico (Soft Delete) y auditoría de cambios.

## Documentación Detallada

Para comprender a fondo el funcionamiento del sistema, consulte las siguientes secciones:

- [📐 Arquitectura del Sistema](file:///Users/victor/work/calculadora/docs/ARQUITECTURA.md): Decisiones técnicas y patrones de diseño.
- [🗄️ Base de Datos](file:///Users/victor/work/calculadora/docs/BASE_DE_DATOS.md): Modelo de datos (Neon/Prisma), relaciones y optimizaciones.
- [🚀 Despliegue y CI/CD](file:///Users/victor/work/calculadora/docs/DESPLIEGUE.md): Información sobre el entorno de producción en Vercel.
- [🔐 Autenticación y Seguridad](file:///Users/victor/work/calculadora/docs/AUTENTICACION.md): Gestión de roles y protección de rutas.
- [🛠️ Capa de Servicios](file:///Users/victor/work/calculadora/docs/SERVICIOS.md): Lógica de negocio y abstracción de datos.
- [🔌 Documentación de la API](file:///Users/victor/work/calculadora/docs/API.md): Guía de endpoints y convenciones de respuesta.

## Comenzando

### Requisitos Previos

- Node.js 18.x o superior.
- Una instancia de PostgreSQL (Neon para producción).

### Instalación Local

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar las variables de entorno (`.env`).
4. Ejecutar migraciones de Prisma:
   ```bash
   npx prisma migrate dev
   ```
5. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

Visite [http://localhost:3000](http://localhost:3000) para el desarrollo local o [https://www.mytilusdata.cl](https://www.mytilusdata.cl) para acceder a la plataforma oficial.

---
Desarrollado con ❤️ para la gestión eficiente de datos.
