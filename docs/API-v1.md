# API Pública v1 - MytilusData

## Descripción General

La API v1 de MytilusData permite el acceso programático a los recursos de la plataforma mediante claves API. Está diseñada para integraciones con aplicaciones externas, sensores IoT y sistemas de terceros.

## Base URL

```
https://mytilusdata.cl/api/v1
```

Para desarrollo local:
```
http://localhost:3000/api/v1
```

---

## Autenticación

Todas las peticiones requieren una clave API válida en el header `X-API-Key`.

### Obtener una clave API

1. Inicia sesión como administrador en la plataforma
2. Ve a **Configuración → API Keys**
3. Crea una nueva clave seleccionando los permisos necesarios
4. Guarda la clave generada (solo se muestra una vez)

### Uso del header

```http
GET /api/v1/lugares HTTP/1.1
Host: mytilusdata.cl
X-API-Key: myt_tu_clave_secreta
Content-Type: application/json
```

---

## Permisos

Cada clave API tiene permisos granulares:

| Permiso | Descripción |
|---------|-------------|
| `lugares:read` | Leer información de lugares |
| `lugares:write` | Crear y editar lugares |
| `ciclos:read` | Leer información de ciclos |
| `ciclos:write` | Crear y editar ciclos |
| `mediciones:read` | Leer mediciones |
| `mediciones:write` | Crear y editar mediciones |
| `unidades:read` | Leer unidades de medida |
| `unidades:write` | Crear y editar unidades |

---

## Endpoints

### Lugares

#### Listar lugares
```http
GET /api/v1/lugares
```

**Parámetros de query:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | number | Número de página (default: 1) |
| `limit` | number | Registros por página (max: 100) |
| `q` | string | Búsqueda por nombre |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Centro Marítimo A1",
      "latitud": "-41.469358",
      "longitud": "-72.942352"
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 15, "totalPages": 1 }
}
```

#### Crear lugar
```http
POST /api/v1/lugares
```

**Body:**
```json
{
  "nombre": "Nuevo Centro",
  "latitud": "-41.500000",
  "longitud": "-72.900000",
  "nota": "Descripción opcional"
}
```

#### Actualizar lugar
```http
PUT /api/v1/lugares/{id}
```

---

### Ciclos

#### Listar ciclos
```http
GET /api/v1/ciclos
```

**Parámetros:** `lugar_id`, `activo`

#### Crear ciclo
```http
POST /api/v1/ciclos
```

**Body:**
```json
{
  "nombre": "Ciclo 2025-B",
  "lugar_id": 1,
  "fecha_inicio": "2025-06-01T00:00:00Z"
}
```

---

### Mediciones

#### Listar mediciones
```http
GET /api/v1/mediciones
```

**Parámetros:** `lugar_id`, `ciclo_id`, `fecha_desde`, `fecha_hasta`, `page`, `limit`

#### Crear medición
```http
POST /api/v1/mediciones
```

**Body (campos requeridos):**
```json
{
  "valor": 16.2,
  "fecha_medicion": "2025-01-14T10:00:00Z",
  "lugar_id": 1,
  "unidad_id": 1,
  "tipo_id": 1,
  "origen_id": 1,
  "ciclo_id": 1
}
```

---

### Unidades

#### Listar unidades
```http
GET /api/v1/unidades
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Parámetros inválidos |
| 401 | API Key inválida o faltante |
| 403 | Sin permisos para esta operación |
| 404 | Recurso no encontrado |
| 500 | Error interno del servidor |

---

## Ejemplos

### cURL
```bash
curl -H "X-API-Key: myt_tu_clave" https://mytilusdata.cl/api/v1/lugares
```

### Python
```python
import requests
headers = {"X-API-Key": "myt_tu_clave"}
response = requests.get("https://mytilusdata.cl/api/v1/lugares", headers=headers)
```

### JavaScript
```javascript
const response = await fetch("https://mytilusdata.cl/api/v1/lugares", {
  headers: { "X-API-Key": "myt_tu_clave" }
});
```

---

## Documentación Interactiva

Disponible en `/dashboard/api-docs` para usuarios administradores.
