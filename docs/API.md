# Documentación de la API

El sistema ofrece una API RESTful organizada bajo el prefijo `/api`.

## Endpoints Principales

### 1. Mediciones (`/api/mediciones`)
- **GET**: Recupera la lista de mediciones activas. Soporta filtros por lugar, fecha y tipo.
- **POST**: Registra una nueva medición.
- **PATCH /:id**: Actualiza una medición existente.
- **DELETE /:id**: Realiza un borrado lógico de la medición.

### 2. Catálogos
- `/api/lugares`: Gestión de ubicaciones.
- `/api/unidades`: Gestión de unidades de medida.
- `/api/origen-datos`: Gestión de fuentes de información.
- `/api/tipos-registro`: Gestión de tipos de datos.

### 3. Exportación (`/api/mediciones/export`)
- **GET**: Genera un archivo (PDF/Excel) con los datos filtrados de las mediciones seleccionadas.

## Autenticación de API
Todas las peticiones a la API requieren una sesión activa. Los errores comunes incluyen:
- `401 Unauthorized`: No hay sesión activa.
- `403 Forbidden`: El usuario no tiene el rol necesario para esta acción.
- `404 Not Found`: El recurso solicitado no existe o está marcado como eliminado.

## Convenciones de Respuesta
El sistema devuelve siempre objetos JSON con una estructura predecible:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operación completada"
}
```
o en caso de error:
```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```
