# Validadores con Zod

El sistema utiliza **Zod** como librería principal para validación de esquemas y tipado de datos. Zod proporciona validación robusta, inferencia automática de tipos TypeScript y mensajes de error claros en español.

## ¿Por qué Zod?

Zod fue elegido por las siguientes ventajas:

- **Validación robusta**: Garantiza que los datos cumplan con esquemas estrictos
- **Tipado automático**: Infiere tipos TypeScript automáticamente de los schemas
- **Mensajes en español**: Todos los mensajes de error están localizados
- **Transformación de datos**: Permite coercionar tipos automáticamente
- **Integración con TypeScript**: Tipado end-to-end desde la validación hasta la base de datos
- **Documentación viva**: Los schemas sirven como documentación de la API

## Patrón de Validación

El flujo de validación sigue este patrón:

```
Request → Zod Validator → Validated Data → Service Layer → Prisma
```

### Ejemplo Básico

```typescript
import { z } from 'zod';

// Definir schema
const userSchema = z.object({
  email: z.string().email('El email no es válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

// Inferir tipo TypeScript
type UserInput = z.infer<typeof userSchema>;

// Validar datos
const validatedData = userSchema.parse({ email: 'user@example.com', password: 'secure123' });
// validatedData está tipado como UserInput
```

## Validadores Implementados

### 1. Auth Validator
**Archivo**: [`lib/validators/auth.validator.ts`](lib/validators/auth.validator.ts:1)

#### Schemas Disponibles

##### loginSchema
Valida credenciales de inicio de sesión:

```typescript
{
  email: string; // Email válido, requerido
  password: string; // Mínimo 6 caracteres, requerido
}
```

**Reglas de validación**:
- `email`: Requerido, formato email válido
- `password`: Requerido, mínimo 6 caracteres

##### registroSchema
Valida registro de nuevos usuarios:

```typescript
{
  nombre: string; // 2-100 caracteres, requerido
  email: string; // Email válido, requerido
  password: string; // Mínimo 8 caracteres, mayúscula, minúscula, número, requerido
}
```

**Reglas de validación**:
- `nombre`: Requerido, mínimo 2 caracteres, máximo 100 caracteres
- `email`: Requerido, formato email válido
- `password`: Requerido, mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número

##### passwordStrengthSchema
Valida fortaleza de contraseña:

```typescript
{
  password: string; // Mínimo 8 caracteres, mayúscula, minúscula, número
}
```

**Reglas de validación**:
- `password`: Requerido, mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número

**Tipos inferidos**:
- `LoginInput`
- `RegistroInput`
- `PasswordStrengthInput`

### 2. Lugares Validator
**Archivo**: [`lib/validators/lugares.validator.ts`](lib/validators/lugares.validator.ts:1)

#### Schemas Disponibles

##### createLugarSchema
Valida creación de lugares:

```typescript
{
  nombre: string; // 1-200 caracteres, requerido, trim
  nota?: string | null; // Máximo 1000 caracteres, opcional
  latitud?: number | null; // -90 a 90, opcional
  longitud?: number | null; // -180 a 180, opcional
}
```

**Reglas de validación**:
- `nombre`: Requerido, máximo 200 caracteres, elimina espacios en blanco
- `nota`: Opcional, máximo 1000 caracteres, elimina espacios en blanco
- `latitud`: Opcional, número entre -90 y 90
- `longitud`: Opcional, número entre -180 y 180

##### updateLugarSchema
Similar a `createLugarSchema` pero todos los campos son opcionales.

##### filterLugaresSchema
Valida filtros de búsqueda:

```typescript
{
  q?: string; // Término de búsqueda, opcional
  page?: number; // Página actual, default 1, mínimo 1
  limit?: number; // Registros por página, default 50, 1-100
}
```

##### lugarIdSchema
Valida ID de lugar:

```typescript
{
  id: number; // Entero positivo, requerido
}
```

**Tipos inferidos**:
- `CreateLugarInput`
- `UpdateLugarInput`
- `FilterLugaresInput`
- `LugarIdInput`

### 3. Unidades Validator
**Archivo**: [`lib/validators/unidades.validator.ts`](lib/validators/unidades.validator.ts:1)

#### Schemas Disponibles

##### createUnidadSchema
Valida creación de unidades:

```typescript
{
  nombre: string; // 1-100 caracteres, requerido, trim
  sigla: string; // 1-20 caracteres, requerido, trim
}
```

**Reglas de validación**:
- `nombre`: Requerido, máximo 100 caracteres, elimina espacios en blanco
- `sigla`: Requerido, máximo 20 caracteres, elimina espacios en blanco

##### updateUnidadSchema
Similar a `createUnidadSchema` pero todos los campos son opcionales.

##### filterUnidadesSchema
Valida filtros de búsqueda:

```typescript
{
  q?: string; // Término de búsqueda, opcional
  page?: number; // Página actual, default 1, mínimo 1
  limit?: number; // Registros por página, default 50, 1-100
}
```

##### unidadIdSchema
Valida ID de unidad:

```typescript
{
  id: number; // Entero positivo, requerido
}
```

**Tipos inferidos**:
- `CreateUnidadInput`
- `UpdateUnidadInput`
- `FilterUnidadesInput`
- `UnidadIdInput`

### 4. Ciclos Validator
**Archivo**: [`lib/validators/ciclos.validator.ts`](lib/validators/ciclos.validator.ts:1)

#### Schemas Disponibles

##### createCicloSchema
Valida creación de ciclos:

```typescript
{
  nombre: string; // Mínimo 3 caracteres, requerido
  fecha_siembra: Date; // Fecha válida, requerido
  fecha_finalizacion?: Date | null; // Fecha válida, opcional
  lugar_id: number; // Entero positivo, requerido
  activo?: boolean; // Default true
  notas?: string; // Opcional
}
```

**Reglas de validación**:
- `nombre`: Requerido, mínimo 3 caracteres
- `fecha_siembra`: Requerido, fecha válida (transforma string a Date)
- `fecha_finalizacion`: Opcional, fecha válida (transforma string a Date)
- `lugar_id`: Requerido, entero positivo
- `activo`: Opcional, default true
- `notas`: Opcional

##### updateCicloSchema
Similar a `createCicloSchema` pero todos los campos son opcionales, más `id`.

##### filterCiclosSchema
Valida filtros de búsqueda:

```typescript
{
  lugar_id?: number; // Entero positivo, opcional
  activo?: boolean; // true/false, opcional
  page?: number; // Página actual, default 1
  limit?: number; // Registros por página, default 20
}
```

##### cicloIdSchema
Valida ID de ciclo:

```typescript
{
  id: number; // Entero positivo, requerido
}
```

**Tipos inferidos**:
- `CreateCicloInput`
- `UpdateCicloInput`
- `FilterCiclosInput`

### 5. Mediciones Validator
**Archivo**: [`lib/validators/mediciones.validator.ts`](lib/validators/mediciones.validator.ts:1)

#### Schemas Disponibles

##### createMedicionSchema
Valida creación de mediciones:

```typescript
{
  valor: number; // Positivo, requerido
  fecha_medicion: Date; // No futura, requerido
  lugar_id: number; // Entero positivo, requerido
  unidad_id: number; // Entero positivo, requerido
  tipo_id: number; // Entero positivo, requerido
  origen_id: number; // Entero positivo, requerido
  notas?: string; // Máximo 1000 caracteres, opcional
  ciclo_id?: number; // Entero positivo, opcional
}
```

**Reglas de validación**:
- `valor`: Requerido, número positivo
- `fecha_medicion`: Requerido, fecha válida, no puede ser futura
- `lugar_id`: Requerido, entero positivo
- `unidad_id`: Requerido, entero positivo
- `tipo_id`: Requerido, entero positivo
- `origen_id`: Requerido, entero positivo
- `notas`: Opcional, máximo 1000 caracteres
- `ciclo_id`: Opcional, entero positivo

**Validación personalizada**:
- `fecha_medicion`: No puede ser una fecha futura

##### updateMedicionSchema
Similar a `createMedicionSchema` pero todos los campos son opcionales.

##### filterMedicionesSchema
Valida filtros de búsqueda:

```typescript
{
  page?: number; // Página actual, default 1
  limit?: number; // Registros por página, default 20, 1-100
  lugar_id?: number; // Entero positivo, opcional
  unidad_id?: number; // Entero positivo, opcional
  tipo_id?: number; // Entero positivo, opcional
  ciclo_id?: number; // Entero positivo, opcional
  autor_id?: number; // Entero positivo, opcional
  fecha_desde?: Date; // Fecha válida, opcional
  fecha_hasta?: Date; // Fecha válida, opcional
}
```

**Validación personalizada**:
- `fecha_hasta` debe ser posterior o igual a `fecha_desde` si ambas están presentes

##### medicionIdSchema
Valida ID de medición:

```typescript
{
  id: number; // Entero positivo, requerido
}
```

**Tipos inferidos**:
- `CreateMedicionInput`
- `UpdateMedicionInput`
- `FilterMedicionesInput`
- `MedicionIdInput`

### 6. API Keys Validator
**Archivo**: [`lib/validators/api-keys.validator.ts`](lib/validators/api-keys.validator.ts:1)

#### Schemas Disponibles

##### createApiKeySchema
Valida creación de API keys:

```typescript
{
  nombre: string; // 1-100 caracteres, requerido, trim
  permisos: string[]; // Array de permisos válidos, requerido
}
```

**Reglas de validación**:
- `nombre`: Requerido, máximo 100 caracteres, elimina espacios en blanco
- `permisos`: Requerido, array de permisos válidos, mínimo 1 permiso

**Permisos disponibles**:
- `lugares:read`
- `lugares:write`
- `ciclos:read`
- `ciclos:write`
- `mediciones:read`
- `mediciones:write`
- `unidades:read`
- `unidades:write`

##### apiKeyIdSchema
Valida ID de API key:

```typescript
{
  id: number; // Entero positivo, requerido
}
```

**Tipos inferidos**:
- `CreateApiKeyInput`
- `ApiKeyIdInput`

## Uso en API Routes

### Ejemplo 1: Crear Lugar

```typescript
// app/api/lugares/route.ts
import { createLugarSchema } from '@/lib/validators/lugares.validator';
import { LugaresService } from '@/lib/services/lugares/lugares.service';
import { z } from 'zod';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validar con Zod
    const validatedData = createLugarSchema.parse(body);
    
    // Crear lugar con datos validados
    const lugar = await LugaresService.create(validatedData);
    
    return Response.json({ success: true, data: lugar }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Retornar errores de validación de Zod
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

### Ejemplo 2: Filtrar Mediciones

```typescript
// app/api/mediciones/route.ts
import { filterMedicionesSchema } from '@/lib/validators/mediciones.validator';
import { MedicionesService } from '@/lib/services/mediciones/mediciones.service';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Convertir searchParams a objeto
    const params = Object.fromEntries(searchParams.entries());
    
    // Validar parámetros con Zod
    const validatedParams = filterMedicionesSchema.parse(params);
    
    // Buscar mediciones con parámetros validados
    const result = await MedicionesService.findAll(validatedParams);
    
    return Response.json({ success: true, ...result });
  } catch (error) {
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

### Ejemplo 3: Validación de ID en Ruta Dinámica

```typescript
// app/api/lugares/[id]/route.ts
import { lugarIdSchema } from '@/lib/validators/lugares.validator';
import { LugaresService } from '@/lib/services/lugares/lugares.service';
import { z } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validar ID con Zod
    const { id } = lugarIdSchema.parse({ id: params.id });
    
    // Buscar lugar con ID validado
    const lugar = await LugaresService.findById(id);
    
    if (!lugar) {
      return Response.json(
        { success: false, message: 'Lugar no encontrado' },
        { status: 404 }
      );
    }
    
    return Response.json({ success: true, data: lugar });
  } catch (error) {
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

## Características Avanzadas de Zod

### 1. Coerción de Tipos

Zod puede coercionar tipos automáticamente:

```typescript
const schema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

// "5" → 5
// "10" → 10
```

### 2. Transformación de Datos

Zod puede transformar datos durante la validación:

```typescript
const schema = z.object({
  fecha: z.string().transform((val) => new Date(val)),
});

// "2025-01-14" → Date object
```

### 3. Validaciones Personalizadas

Puedes crear validaciones personalizadas:

```typescript
const fechaNoFutura = (fecha: Date) => {
  const ahora = new Date();
  return fecha <= ahora;
};

const schema = z.object({
  fecha_medicion: z.coerce.date().refine(fechaNoFutura, 'La fecha no puede ser futura'),
});
```

### 4. Preprocesamiento

Puedes preprocesar valores antes de la validación:

```typescript
const schema = z.object({
  valor: z.preprocess(
    (val) => (val === null || val === "" ? undefined : val),
    z.coerce.number().optional()
  ),
});
```

### 5. Validaciones Condicionales

Puedes crear validaciones que dependen de otros campos:

```typescript
const schema = z.object({
  fecha_desde: z.coerce.date().optional(),
  fecha_hasta: z.coerce.date().optional(),
}).refine((data) => {
  if (data.fecha_desde && data.fecha_hasta) {
    return data.fecha_hasta >= data.fecha_desde;
  }
  return true;
}, {
  message: 'La fecha hasta debe ser posterior a la fecha desde',
  path: ['fecha_hasta']
});
```

## Test Coverage

Los validadores están cubiertos por tests en las suites de tests correspondientes:

- **Auth**: Tests en [`lib/__tests__/auth.test.ts`](lib/__tests__/auth.test.ts:1)
- **API Routes**: Tests en [`app/__tests__/api/`](app/__tests__/api/1)
- **Validators**: Tests específicos para cada validador

### Ejecutar Tests de Validadores

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests de autenticación
npm test lib/__tests__/auth.test.ts

# Ejecutar tests de API routes
npm test app/__tests__/api/
```

## Mejores Prácticas

1. **Usar tipos inferidos**: Siempre usa `z.infer<typeof schema>` para obtener tipos TypeScript
2. **Mensajes en español**: Todos los mensajes de error deben estar en español
3. **Validación temprana**: Valida los datos lo antes posible en el flujo de la API
4. **Manejo de errores**: Captura errores `ZodError` y retorna mensajes claros al cliente
5. **Transformación de datos**: Usa `z.coerce` y `transform` para convertir tipos automáticamente
6. **Validaciones personalizadas**: Usa `refine` para validaciones complejas
7. **Preprocesamiento**: Usa `preprocess` para manejar valores nulos o vacíos
8. **Reutilización**: Define schemas reutilizables y combínalos con `extend` o `merge`

## Referencias

- [Documentación oficial de Zod](https://zod.dev/)
- [Zod en GitHub](https://github.com/colinhacks/zod)
- [TypeScript](https://www.typescriptlang.org/)
