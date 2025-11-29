# Capa de Servicios

La carpeta `lib/services` contiene la lógica de negocio central del sistema. Los servicios actúan como intermediarios entre los controladores de la API y el ORM Prisma.

## Estructura de un Servicio

Cada módulo de servicio (ej. `mediciones.service.ts`) sigue un patrón estándar de métodos asíncronos:

- **Listar/Buscar**: Métodos para recuperar colecciones de datos con filtros complejos y paginación.
- **Crear**: Encapsula la validación de entrada antes de persistir nuevos registros.
- **Actualizar**: Gestiona las actualizaciones parciales o totales.
- **Eliminar (Soft Delete)**: Cambia el estado del registro a "eliminado" sin borrarlo físicamente.

## Ventajas del Patrón de Servicios

### 1. Reutilización
Un mismo servicio puede ser llamado desde una ruta de API convencional, una Server Action o incluso un script de línea de comandos.

### 2. Validaciones Centralizadas
Toda la lógica de validación de negocio (ej. "un usuario solo puede editar mediciones que él registró si no es ADMIN") reside en el servicio, no en las rutas.

### 3. Abstracción del ORM
Si los nombres de los modelos de Prisma cambian, solo es necesario actualizar el código dentro del servicio correspondiente, manteniendo las rutas de la API intactas.

## Ejemplo de Uso

```typescript
// En una ruta de API:
import { MedicionesService } from '@/lib/services/mediciones/mediciones.service';

const medicion = await MedicionesService.create({
  valor: 25.5,
  lugar_id: 1,
  // ...otros datos
});

## Validación con Zod

Los servicios se integran con validadores Zod para garantizar la integridad de los datos antes de persistirlos en la base de datos. Esta arquitectura sigue el patrón:

```
API Route → Zod Validator → Service Layer → Prisma ORM
```

### Patrón de Integración

Cada servicio recibe datos ya validados por Zod, lo que permite:

1. **Validación temprana**: Los errores se detectan antes de llegar a la capa de negocio
2. **Tipado automático**: Zod infiere tipos TypeScript que se utilizan en los servicios
3. **Mensajes de error claros**: Zod proporciona mensajes de error descriptivos en español
4. **Transformación de datos**: Zod puede transformar y coercionar tipos automáticamente

### Ejemplo de Integración

```typescript
// En app/api/lugares/route.ts
import { createLugarSchema } from '@/lib/validators/lugares.validator';
import { LugaresService } from '@/lib/services/lugares/lugares.service';

export async function POST(request: Request) {
  const body = await request.json();
  
  // Validar con Zod
  const validatedData = createLugarSchema.parse(body);
  
  // Pasar datos validados al servicio
  const lugar = await LugaresService.create(validatedData);
  
  return Response.json(lugar);
}
```

## Servicios Implementados

### 1. Lugares Service
**Archivo**: [`lib/services/lugares/lugares.service.ts`](lib/services/lugares/lugares.service.ts:1) (210 líneas)

**Funcionalidades**:
- CRUD completo de lugares
- Búsqueda con filtros
- Paginación
- Validación de coordenadas geográficas

**Query Module**: [`lib/services/lugares/queries/lugares-queries.ts`](lib/services/lugares/queries/lugares-queries.ts:1)

**Validator**: [`lib/validators/lugares.validator.ts`](lib/validators/lugares.validator.ts:1)

**Schemas disponibles**:
- `createLugarSchema`: Validación para crear lugares
- `updateLugarSchema`: Validación para actualizar lugares
- `filterLugaresSchema`: Validación de filtros de búsqueda
- `lugarIdSchema`: Validación de IDs

### 2. Unidades Service
**Archivo**: [`lib/services/unidades/unidades.service.ts`](lib/services/unidades/unidades.service.ts:1) (178 líneas)

**Funcionalidades**:
- CRUD completo de unidades de medida
- Búsqueda por nombre y sigla
- Paginación

**Query Module**: [`lib/services/unidades/queries/unidades-queries.ts`](lib/services/unidades/queries/unidades-queries.ts:1)

**Validator**: [`lib/validators/unidades.validator.ts`](lib/validators/unidades.validator.ts:1)

**Schemas disponibles**:
- `createUnidadSchema`: Validación para crear unidades
- `updateUnidadSchema`: Validación para actualizar unidades
- `filterUnidadesSchema`: Validación de filtros de búsqueda
- `unidadIdSchema`: Validación de IDs

### 3. Ciclos Service
**Archivo**: [`lib/services/ciclos/ciclos.service.ts`](lib/services/ciclos/ciclos.service.ts:1)

**Funcionalidades**:
- CRUD completo de ciclos de cultivo
- Filtros por lugar y estado activo
- Gestión de fechas de siembra y finalización

**Query Module**: [`lib/services/ciclos/queries/ciclos-queries.ts`](lib/services/ciclos/queries/ciclos-queries.ts:1)

**Validator**: [`lib/validators/ciclos.validator.ts`](lib/validators/ciclos.validator.ts:1)

**Schemas disponibles**:
- `createCicloSchema`: Validación para crear ciclos
- `updateCicloSchema`: Validación para actualizar ciclos
- `filterCiclosSchema`: Validación de filtros de búsqueda
- `cicloIdSchema`: Validación de IDs

### 4. API Keys Service
**Archivo**: [`lib/services/api-keys.ts`](lib/services/api-keys.ts:1)

**Funcionalidades**:
- Generación de claves API únicas
- Gestión de permisos granulares
- Validación de claves en middleware

**Validator**: [`lib/validators/api-keys.validator.ts`](lib/validators/api-keys.validator.ts:1)

**Schemas disponibles**:
- `createApiKeySchema`: Validación para crear API keys
- `apiKeyIdSchema`: Validación de IDs

**Permisos disponibles**:
- `lugares:read` / `lugares:write`
- `ciclos:read` / `ciclos:write`
- `mediciones:read` / `mediciones:write`
- `unidades:read` / `unidades:write`

## Ejemplo Completo: Servicio + Validator

```typescript
// lib/validators/lugares.validator.ts
import { z } from 'zod';

export const createLugarSchema = z.object({
  nombre: z.string().min(1).max(200).trim(),
  nota: z.string().max(1000).optional().nullable(),
  latitud: z.coerce.number().min(-90).max(90).nullable().optional(),
  longitud: z.coerce.number().min(-180).max(180).nullable().optional(),
});

export type CreateLugarInput = z.infer<typeof createLugarSchema>;

// lib/services/lugares/lugares.service.ts
import { prisma } from '@/lib/prisma';
import type { CreateLugarInput } from '@/lib/validators/lugares.validator';

export const LugaresService = {
  async create(data: CreateLugarInput) {
    // Los datos ya están validados y tipados por Zod
    return await prisma.lugar.create({
      data: {
        nombre: data.nombre,
        nota: data.nota,
        latitud: data.latitud,
        longitud: data.longitud,
      },
    });
  },
  
  async findAll(filters: FilterLugaresInput) {
    // Implementación con filtros validados
    const { q, page, limit } = filters;
    // ... lógica de búsqueda
  },
};

// app/api/lugares/route.ts
import { createLugarSchema } from '@/lib/validators/lugares.validator';
import { LugaresService } from '@/lib/services/lugares/lugares.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validar con Zod - lanza error si es inválido
    const validatedData = createLugarSchema.parse(body);
    
    // Crear lugar con datos validados
    const lugar = await LugaresService.create(validatedData);
    
    return Response.json({ success: true, data: lugar }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Retornar errores de validación de Zod
      return Response.json(
        { success: false, errors: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

## Ventajas de la Integración Service + Validator

1. **Separación de responsabilidades**: Validación separada de lógica de negocio
2. **Reutilización**: Validadores pueden usarse en múltiples endpoints
3. **Tipado automático**: Tipos inferidos automáticamente de los schemas
4. **Documentación viva**: Los schemas sirven como documentación de la API
5. **Testing más fácil**: Validadores y servicios pueden testearse independientemente
6. **Consistencia**: Todos los endpoints usan el mismo esquema de validación
```
