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
- **Validación de Inputs**: Se utiliza **Zod** para validación de esquemas robusta y tipada.
- **Sanitización**: Los datos provenientes del cliente se limpian antes de persistirlos en la base de datos.

## Auditoría
Cada registro de medición (`Medicion`) incluye el ID del usuario que lo creó (`registrado_por_id`), permitiendo una trazabilidad completa de quién ingresó cada dato al sistema.

## Cobertura de Tests

El sistema cuenta con una suite de tests exhaustiva para autenticación ubicada en [`lib/__tests__/auth.test.ts`](lib/__tests__/auth.test.ts:1) (577 líneas, 43 tests).

### Test Suite de Autenticación

La suite de tests cubre exhaustivamente las siguientes funciones:

#### hashPassword (8 tests)
- Hashing exitoso de contraseñas
- Producción de hashes diferentes del original
- Generación de hashes únicos (debido al salt)
- Manejo de strings vacíos
- Manejo de contraseñas muy largas (1000+ caracteres)
- Manejo de caracteres especiales
- Manejo de caracteres Unicode
- Verificación de formato bcrypt

#### verifyPassword (10 tests)
- Verificación correcta de contraseñas
- Rechazo de contraseñas incorrectas
- Manejo de contraseñas vacías
- Manejo de hashes inválidos
- Verificación contra hashes creados por hashPassword
- Sensibilidad a mayúsculas/minúsculas
- Manejo de contraseñas muy largas
- Rechazo de contraseñas ligeramente diferentes
- Verificación de múltiples formatos de contraseña
- Verificación de contraseñas con caracteres especiales y Unicode

#### generateToken (12 tests)
- Generación de tokens JWT válidos
- Contenido correcto del payload (userId, email, rol)
- Manejo de diferentes roles de usuario
- Manejo de caracteres especiales en email
- Manejo de caracteres Unicode en email
- Manejo de userId numéricos
- Manejo de strings vacíos
- Verificación de tokens generados
- Generación de tokens únicos por usuario
- Manejo de múltiples formatos de email
- Verificación de estructura JWT (3 partes)
- Generación de tokens diferentes para usuarios diferentes

#### verifyToken (14 tests)
- Verificación correcta de tokens válidos
- Rechazo de tokens expirados
- Rechazo de tokens malformados
- Rechazo de tokens con firmas inválidas
- Rechazo de strings vacíos
- Rechazo de tokens con payload manipulado
- Rechazo de tokens firmados con secret incorrecto
- Manejo de tokens con campos faltantes
- Manejo de tokens con campos extra
- Verificación de tokens con diferentes roles
- Verificación de tokens con caracteres especiales
- Manejo de casos edge de userId numérico
- Verificación de estructura de payload
- Manejo de tokens con emails complejos

### Tests de Integración

La suite incluye tests de integración que verifican:

1. **Flujo de autenticación con contraseñas**:
   - Hashing durante el registro
   - Verificación durante el login
   - Rechazo de contraseñas incorrectas

2. **Flujo de autenticación con JWT**:
   - Generación de token tras autenticación exitosa
   - Verificación de token en solicitudes subsiguientes
   - Rechazo de tokens manipulados

### Casos Edge Cubiertos

Los tests cubren exhaustivamente casos edge como:
- Tokens expirados
- Firmas inválidas
- Payloads manipulados
- Caracteres especiales y Unicode
- Strings vacíos
- Valores numéricos extremos
- Múltiples formatos de email
- Contraseñas con longitud extrema
- Hashes con formatos inválidos

### Ejecución de Tests

```bash
# Ejecutar todos los tests de autenticación
npm test lib/__tests__/auth.test.ts

# Ejecutar tests en modo watch
npm test -- --watch lib/__tests__/auth.test.ts

# Ejecutar tests con cobertura
npm test -- --coverage lib/__tests__/auth.test.ts
```

### Cobertura Actual

- **Total de tests**: 43
- **Líneas de código**: 577
- **Funciones probadas**: 4 (hashPassword, verifyPassword, generateToken, verifyToken)
- **Casos edge cubiertos**: 40+
- **Tests de integración**: 4
