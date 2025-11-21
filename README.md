# 🦪 MytilusData - Sistema de Registro de Mediciones

<div align="center">

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)](https://www.mytilusdata.cl)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)](https://neon.tech/)

**Plataforma web para el registro, gestión y análisis de mediciones ambientales**

[Demo en Vivo](https://www.mytilusdata.cl) · [Documentación](#-documentación) · [Contribuir](#-contribución)

</div>

---

## ✨ Características

| Característica | Descripción |
|----------------|-------------|
| 📊 **Gestión de Mediciones** | Registro completo vinculado a lugares, unidades y orígenes de datos |
| 🗺️ **Mapas Interactivos** | Visualización geográfica con selector de coordenadas |
| 📈 **Análisis de Datos** | Gráficos interactivos con Recharts y modelo sigmoide |
| 🔐 **Control de Acceso** | Sistema RBAC con roles Admin, Equipo y Público |
| 🌐 **Multiidioma** | Soporte completo para Español e Inglés |
| 📥 **Exportación** | Descarga de datos en CSV con streaming |
| 🎨 **Tema Oscuro/Claro** | Interfaz adaptable a preferencias del usuario |

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS, Shadcn/UI
- **Base de Datos**: PostgreSQL (Neon) + Prisma ORM
- **Autenticación**: JWT con bcrypt
- **Gráficos**: Recharts
- **Despliegue**: Vercel

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [📐 Arquitectura](./docs/ARQUITECTURA.md) | Decisiones técnicas y patrones de diseño |
| [🗄️ Base de Datos](./docs/BASE_DE_DATOS.md) | Modelo de datos, relaciones e índices |
| [🚀 Despliegue](./docs/DESPLIEGUE.md) | CI/CD con GitHub y Vercel |
| [🔐 Autenticación](./docs/AUTENTICACION.md) | Roles, permisos y seguridad |
| [🛠️ Servicios](./docs/SERVICIOS.md) | Capa de lógica de negocio |
| [🔌 API](./docs/API.md) | Referencia de endpoints REST |

## 🚀 Comenzando

### Requisitos

- Node.js 18.x o superior
- PostgreSQL (o cuenta en [Neon](https://neon.tech))

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/victorvidalv/mytilusdata.git
cd mytilusdata

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 📝 Guía de Commits

Este proyecto utiliza **[Conventional Commits](https://www.conventionalcommits.org/)** para mantener un historial limpio y generar changelogs automáticos.

### Formato

```
<tipo>(<ámbito>): <descripción corta>

<cuerpo opcional>

<pie opcional>
```

### Tipos Permitidos

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat(auth): agregar login con Google` |
| `fix` | Corrección de bugs | `fix(api): corregir validación de fechas` |
| `docs` | Cambios en documentación | `docs: actualizar README` |
| `style` | Formato (sin cambio de lógica) | `style: aplicar prettier` |
| `refactor` | Refactorización de código | `refactor(db): optimizar queries` |
| `perf` | Mejoras de rendimiento | `perf: reducir bundle size` |
| `test` | Agregar o modificar tests | `test(api): agregar tests de mediciones` |
| `chore` | Tareas de mantenimiento | `chore: actualizar dependencias` |

### Ámbitos Comunes

- `api` - Endpoints y rutas de API
- `auth` - Autenticación y autorización
- `db` - Base de datos y migraciones
- `ui` - Componentes de interfaz
- `dashboard` - Panel de administración
- `mediciones` - Módulo de mediciones
- `lugares` - Módulo de lugares
- `export` - Exportación de datos
- `i18n` - Internacionalización

### Ejemplos

```bash
# Funcionalidad nueva
git commit -m "feat(mediciones): agregar filtro por rango de fechas"

# Corrección
git commit -m "fix(auth): corregir expiración de token JWT"

# Con cuerpo descriptivo
git commit -m "feat(análisis): implementar gráfico de tendencias

Agregar visualización de tendencias temporales:
- Gráfico de líneas con Recharts
- Selector de rango de fechas
- Exportación a PNG"

# Breaking change
git commit -m "feat(api)!: cambiar estructura de respuesta de mediciones

BREAKING CHANGE: El campo 'data' ahora es un array en lugar de objeto"
```

### Validación Automática

Se recomienda usar [commitlint](https://commitlint.js.org/) para validar mensajes:

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js
```

## 🤝 Contribución

1. Fork el repositorio
2. Crear rama feature (`git checkout -b feat/nueva-funcionalidad`)
3. Commit siguiendo la [guía de commits](#-guía-de-commits)
4. Push a la rama (`git push origin feat/nueva-funcionalidad`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto es privado y de uso exclusivo para el equipo de desarrollo.

---

<div align="center">

Desarrollado con ❤️ por el equipo de **MytilusData**

[🦪 mytilusdata.cl](https://www.mytilusdata.cl)

</div>
