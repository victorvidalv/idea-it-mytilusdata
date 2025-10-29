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
```
