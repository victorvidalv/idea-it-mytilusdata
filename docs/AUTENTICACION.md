# Autenticación y Seguridad

El sistema implementa un esquema de seguridad basado en roles y protección de rutas mediante middleware.

## Gestión de Roles

Existen tres niveles de permisos definidos en el sistema:

| Rol | Descripción | Permisos Clave |
| :--- | :--- | :--- |
| **ADMIN** | Administrador total | Gestión de usuarios, configuración del sistema, borrado de registros. |
| **EQUIPO** | Usuario operativo | Registro de mediciones, gestión de lugares y fuentes de datos. |
| **PUBLICO** | Observador | Consulta de datos y exportación de reportes predefinidos. |

## Implementación Técnica

### 1. Autenticación
- Basada en sesiones/tokens gestionados de forma segura.
- Las contraseñas se almacenan cifradas utilizando hashes (bcrypt).

### 2. Middleware de Protección
El archivo `middleware.ts` en la raíz del proyecto intercepta las solicitudes para:
- Validar la sesión del usuario.
- Verificar si el usuario tiene permiso para acceder a una ruta específica basada en su rol.
- Redirigir a la página de login si no hay una sesión activa.

### 3. Seguridad en la API
Todos los endpoints en `app/api` realizan una verificación de sesión antes de procesar cualquier lógica.
- **Validación de Inputs**: Se utiliza tipado estático y validaciones manuales para prevenir inyecciones y datos malformados.
- **Sanitización**: Los datos provenientes del cliente se limpian antes de persistirlos en la base de datos.

## Auditoría
Cada registro de medición (`Medicion`) incluye el ID del usuario que lo creó (`registrado_por_id`), permitiendo una trazabilidad completa de quién ingresó cada dato al sistema.
