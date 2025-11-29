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

## Arquitectura

La API v1 sigue una arquitectura en capas que garantiza seguridad, validación y separación de responsabilidades:

```
┌─────────────────────────────────────────────────────────────┐
│                     Cliente / Sensor IoT                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Middleware withApiKey                    │
│  - Valida header X-API-Key                                 │
│  - Verifica permisos granulares                            │
│  - Retorna 401/403 si inválido                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Zod Schema Validation                     │
│  - Valida estructura de datos                              │
│  - Coerciona tipos automáticamente                         │
│  - Retorna 400 con errores descriptivos                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                          │
│  - Lógica de negocio centralizada                          │
│  - Abstracción de Prisma ORM                              │
│  - Reutilización entre endpoints                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Prisma ORM                            │
│  - Genera queries SQL optimizadas                          │
│  - Maneja transacciones                                    │
│  - Tipado end-to-end                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                      │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Request

1. **Middleware withApiKey**
   - Intercepta todas las requests a `/api/v1/*`
   - Valida presencia y formato del header `X-API-Key`
   - Busca la API key en la base de datos
   - Verifica que la key esté activa
   - Valida que la key tenga los permisos necesarios
   - Retorna `401 Unauthorized` si la key es inválida
   - Retorna `403 Forbidden` si faltan permisos

2. **Zod Schema Validation**
   - Cada endpoint tiene su propio schema de validación
   - Zod valida estructura, tipos y restricciones
   - Coerciona tipos automáticamente (string → number, etc.)
   - Transforma datos cuando es necesario (string → Date)
   - Retorna `400 Bad Request` con errores detallados en español

3. **Service Layer**
   - Contiene toda la lógica de negocio
   - Recibe datos ya validados y tipados
   - Abstrae la complejidad de Prisma
   - Implementa reglas de negocio específicas
   - Maneja transacciones cuando es necesario

4. **Prisma ORM**
   - Genera queries SQL optimizadas
   - Maneja relaciones entre modelos
   - Proporciona tipado TypeScript completo
   - Maneja migraciones y schema de base de datos

### Ejemplo de Implementación

```typescript
// app/api/v1/lugares/route.ts
import { withApiKey } from '@/lib/middleware/with-api-key';
import { createLugarSchema } from '@/lib/validators/lugares.validator';
import { LugaresService } from '@/lib/services/lugares/lugares.service';

// Middleware de autenticación
export { withApiKey as middleware };

export async function POST(request: Request) {
  try {
    // 1. Obtener datos del request
    const body = await request.json();
    
    // 2. Validar con Zod
    const validatedData = createLugarSchema.parse(body);
    // validatedData está tipado como CreateLugarInput
    
    // 3. Llamar al servicio
    const lugar = await LugaresService.create(validatedData);
    
    // 4. Retornar respuesta
    return Response.json({ success: true, data: lugar }, { status: 201 });
  } catch (error) {
    // Manejar errores de validación de Zod
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          success: false,
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

### Ventajas de esta Arquitectura

1. **Seguridad en capas**: Cada capa valida sus responsabilidades
2. **Separación de concerns**: Validación, lógica de negocio y acceso a datos están separados
3. **Reutilización**: Los servicios pueden usarse desde múltiples endpoints
4. **Tipado end-to-end**: Desde la validación hasta la base de datos
5. **Testing fácil**: Cada capa puede testearse independientemente
6. **Escalabilidad**: Fácil agregar nuevas capas o modificar existentes
7. **Mantenibilidad**: Cambios en una capa no afectan a las otras

### Servicios Utilizados en API v1

Los siguientes servicios se utilizan en los endpoints de API v1:

- [`LugaresService`](lib/services/lugares/lugares.service.ts:1): Gestión de lugares
- [`UnidadesService`](lib/services/unidades/unidades.service.ts:1): Gestión de unidades de medida
- [`CiclosService`](lib/services/ciclos/ciclos.service.ts:1): Gestión de ciclos de cultivo
- [`MedicionesService`](lib/services/mediciones/mediciones.service.ts:1): Gestión de mediciones

Cada servicio está documentado en [`docs/SERVICIOS.md`](docs/SERVICIOS.md:1).

### Validadores Utilizados en API v1

Los siguientes validadores Zod se utilizan en los endpoints de API v1:

- [`createLugarSchema`](lib/validators/lugares.validator.ts:11) / [`updateLugarSchema`](lib/validators/lugares.validator.ts:46)
- [`createUnidadSchema`](lib/validators/unidades.validator.ts:11) / [`updateUnidadSchema`](lib/validators/unidades.validator.ts:27)
- [`createCicloSchema`](lib/validators/ciclos.validator.ts:11) / [`updateCicloSchema`](lib/validators/ciclos.validator.ts:26)
- [`createMedicionSchema`](lib/validators/mediciones.validator.ts:15) / [`updateMedicionSchema`](lib/validators/mediciones.validator.ts:61)

Cada validador está documentado en [`docs/VALIDADORES.md`](docs/VALIDADORES.md:1).

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
