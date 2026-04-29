# Estándares de Calidad de Código - MytilusData

**Audiencia:** Desarrolladores, revisores de código, mantenedores  
**Última actualización:** 2026-03-19

---

## Propósito

Este documento define los estándares de calidad de código obligatorios para el proyecto MytilusData. Establece métricas medibles, principios de diseño, convenciones y procesos de validación que aseguran código mantenible, legible y consistente.

---

## 1. Métricas y Umbrales

### 1.1 Límites Obligatorios

| Métrica | Límite | Excepción | Justificación |
|---------|--------|-----------|---------------|
| Líneas por archivo `.svelte` | < 200 | - | Legibilidad y mantenibilidad |
| Líneas por archivo `.ts` | < 200 | Tests: < 300 | Responsabilidad única |
| Complejidad ciclomática | < 10 | - | Umbral de mantenibilidad |
| Código duplicado | < 3% | - | Reducir deuda técnica |
| Funciones por archivo | < 10 | - | Cohesión |
| Longitud de funciones | < 30 líneas | - | Legibilidad |
| Profundidad de anidamiento | < 3 niveles | - | Evitar callback hell |
| Parámetros por función | < 4 | - | Claridad de API |

### 1.2 Estado Actual del Proyecto

Según el [informe de calidad](./informe-calidad-codigo.md):

| Métrica | Valor Actual | Objetivo | Estado |
|---------|--------------|----------|--------|
| Archivos Svelte analizados | 134 | - | - |
| Promedio líneas/archivo | 59.6 | < 200 | ✅ OK |
| Complejidad promedio | 3.5 | < 10 | ✅ OK |
| Código duplicado | 4.13% | < 3% | ⚠️ Mejorable |

### 1.3 Archivos en el Límite

Los siguientes archivos tienen complejidad 10 y requieren monitoreo:

- [`SvarDataGrid.svelte`](../src/lib/components/SvarDataGrid.svelte)
- [`DashboardGraficos.svelte`](../src/lib/components/graficos/DashboardGraficos.svelte)
- [`+page.svelte (admin/usuarios)`](../src/routes/(app)/admin/usuarios/+page.svelte)
- [`SearchableSelect.svelte`](../src/lib/components/SearchableSelect.svelte)

**Acción:** Si la complejidad aumenta, refactorizar inmediatamente.

---

## 2. Principios de Diseño

### 2.1 DRY (Don't Repeat Yourself)

Evitar duplicación de lógica. Si un código se repite 2+ veces, extraer a función reutilizable.

**Incorrecto:**
```typescript
// Repetido en múltiples archivos
function validateEmail(email: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

**Correcto:**
```typescript
// src/lib/utils/validation.ts
export function validateEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### 2.2 KISS (Keep It Simple, Stupid)

Preferir soluciones simples sobre complejas. Evitar sobre-ingeniería.

**Incorrecto:**
```typescript
// Patrón innecesariamente complejo
class EmailValidatorFactory {
	createValidator(type: string): IEmailValidator {
		if (type === 'regex') return new RegexEmailValidator();
		if (type === 'api') return new ApiEmailValidator();
		throw new Error('Unknown validator');
	}
}
```

**Correcto:**
```typescript
// Solución directa
function validateEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### 2.3 Separación de Responsabilidades

Un archivo = una responsabilidad principal. Un componente = una función.

**Estructura correcta:**
```
centros/
├── CentroCreateForm.svelte      # Formulario de creación
├── CentroEditForm.svelte        # Formulario de edición
├── CentroRow.svelte             # Fila de tabla
├── centro-form-utils.ts         # Utilidades de formulario
└── types.ts                     # Tipos específicos
```

### 2.4 Bajo Acoplamiento, Alta Cohesión

- **Acoplamiento:** Minimizar dependencias entre módulos
- **Cohesión:** Elementos relacionados deben estar juntos

**Indicadores de alto acoplamiento:**
- Imports circulares
- Modificar un archivo rompe otro
- Tests difíciles de aislar

### 2.5 Composición sobre Herencia

Preferir composición de funciones/componentes sobre herencia de clases.

**Incorrecto:**
```typescript
class BaseForm {
	validate() { /* ... */ }
	submit() { /* ... */ }
}

class UserForm extends BaseForm {
	// Hereda comportamiento
}
```

**Correcto:**
```typescript
function useFormValidation<T>(schema: ZodSchema<T>) {
	// Lógica de validación reutilizable
}

function useFormSubmission<T>(endpoint: string) {
	// Lógica de envío reutilizable
}

// Componer en el componente
```

---

## 3. Convenciones de Nomenclatura

### 3.1 Archivos

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes Svelte | PascalCase | `CentroCreateForm.svelte` |
| Utilidades TypeScript | kebab-case | `centro-form-utils.ts` |
| Tipos | kebab-case | `types.ts` |
| Tests | Mismo nombre + `.test.ts` | `CentroCreateForm.svelte.test.ts` |
| Páginas SvelteKit | Convención SvelteKit | `+page.svelte`, `+page.server.ts` |

### 3.2 Variables y Constantes

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Variables | camelCase, descriptivas | `userEmail`, `isLoading` |
| Constantes | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_BASE_URL` |
| Booleanos | Prefijo `is`, `has`, `should` | `isValid`, `hasPermission` |
| Arrays | Plural | `users`, `centros` |

### 3.3 Tipos e Interfaces

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Interfaces | PascalCase | `UserProfile`, `CentroData` |
| Types | PascalCase | `ApiResponse`, `FormState` |
| Props | Sufijo `Props` | `CentroFormProps` |
| Eventos | Sufijo `Event` | `FormSubmitEvent` |

**Preferencia:** Usar `interface` para objetos extensibles, `type` para uniones y primitivos.

```typescript
// Interface para objetos que pueden extenderse
interface User {
	id: string;
	email: string;
}

// Type para uniones y primitivos
type UserRole = 'admin' | 'investigador' | 'usuario';
type Maybe<T> = T | null;
```

### 3.4 Funciones

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Funciones | camelCase, verbos de acción | `validateEmail`, `fetchUserData` |
| Handlers | Prefijo `handle` | `handleSubmit`, `handleClick` |
| Getters | Prefijo `get` | `getUserById` |
| Setters | Prefijo `set` | `setCurrentUser` |
| Predicados | Prefijo `is`, `has`, `can` | `isValidEmail`, `hasPermission` |

---

## 4. Estructura de Archivos

### 4.1 Organización por Dominio

```
src/lib/
├── components/           # Componentes reutilizables
│   ├── auth/            # Componentes de autenticación
│   ├── centros/         # Componentes de centros
│   ├── ciclos/          # Componentes de ciclos
│   ├── datagrid/        # Componentes de grilla
│   └── layout/          # Componentes de layout
├── server/              # Lógica de servidor
│   ├── auth/            # Autenticación
│   ├── centros/         # Lógica de centros
│   └── db/              # Base de datos
└── utils/               # Utilidades compartidas
```

### 4.2 Archivos de Barril (index.ts)

Usar `index.ts` para exports limpios:

```typescript
// src/lib/components/centros/index.ts
export { default as CentroCreateForm } from './CentroCreateForm.svelte';
export { default as CentroEditForm } from './CentroEditForm.svelte';
export { default as CentroRow } from './CentroRow.svelte';
export * from './types';
```

**Importar desde barril:**
```typescript
import { CentroCreateForm, CentroRow } from '$lib/components/centros';
```

### 4.3 Estructura de Componente

```
componente/
├── Componente.svelte         # Componente principal
├── Componente.svelte.test.ts # Tests del componente
├── componente-utils.ts       # Utilidades extraídas
└── types.ts                  # Tipos específicos (si aplica)
```

---

## 5. TypeScript

### 5.1 Strict Mode Obligatorio

El proyecto tiene [`strict: true`](../tsconfig.json) habilitado. Esto incluye:

- `noImplicitAny`: Error en tipos implícitos `any`
- `strictNullChecks`: Verificación estricta de null/undefined
- `strictFunctionTypes`: Verificación de tipos en funciones
- `noUnusedLocals`: Error en variables no usadas
- `noUnusedParameters`: Error en parámetros no usados

### 5.2 Tipos Explícitos para Funciones Públicas

**Incorrecto:**
```typescript
export function validateEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

**Correcto:**
```typescript
export function validateEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### 5.3 Evitar `any`

**Preferencia de tipos:**
1. Tipo específico: `string`, `User`, `CentroData`
2. Unión: `'admin' | 'usuario'`
3. Genérico: `T extends Record<string, unknown>`
4. `unknown` con type guards
5. `any` solo como último recurso con justificación

**Uso de `unknown`:**
```typescript
function parseJson(input: string): unknown {
	return JSON.parse(input);
}

// Type guard para validar
function isUser(data: unknown): data is User {
	return (
		typeof data === 'object' &&
		data !== null &&
		'id' in data &&
		'email' in data
	);
}
```

### 5.4 Interfaces sobre Types para Objetos Extensibles

```typescript
// Usar interface para objetos que pueden extenderse
interface BaseEntity {
	id: string;
	createdAt: Date;
	updatedAt: Date;
}

interface User extends BaseEntity {
	email: string;
	role: UserRole;
}

// Usar type para uniones, mapeos, primitivos
type UserRole = 'admin' | 'investigador' | 'usuario';
type UserMap = Record<string, User>;
```

### 5.5 Orden de Imports

```typescript
// 1. Imports externos (Node, frameworks)
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// 2. Imports internos (proyecto)
import { validateEmail } from '$lib/utils/validation';
import { db } from '$lib/server/db';

// 3. Imports de tipos (con `type`)
import type { User, Centro } from '$lib/types';
import type { PageServerLoad } from './$types';
```

---

## 6. Svelte 5

### 6.1 Usar Runes

Svelte 5 introduce runes para reactividad explícita:

```svelte
<script lang="ts">
	// Estado reactivo
	let count = $state(0);
	
	// Valor derivado
	let doubled = $derived(count * 2);
	
	// Efectos secundarios
	$effect(() => {
		console.log(`Count changed to ${count}`);
	});
</script>
```

### 6.2 Props Tipadas con $props()

```svelte
<script lang="ts">
	interface Props {
		title: string;
		count?: number;
		onSave: (data: FormData) => void;
	}
	
	let { title, count = 0, onSave }: Props = $props();
</script>
```

### 6.3 Snippets sobre Slots

Preferir snippets cuando se necesita pasar lógica compleja:

```svelte
<!-- Componente padre -->
<DataTable {data}>
	{#snippet row(item)}
		<td>{item.name}</td>
		<td>{item.value}</td>
	{/snippet}
</DataTable>

<!-- DataTable.svelte -->
<script lang="ts">
	interface Props<T> {
		data: T[];
		row?: (item: T) => Snippet;
	}
	
	let { data, row }: Props = $props();
</script>

{#each data as item}
	{#if row}
		{@render row(item)}
	{/if}
{/each}
```

### 6.4 Componentes Pequeños y Enfocados

**Indicadores de componente demasiado grande:**
- Más de 200 líneas
- Más de 10 variables reactivas
- Múltiples responsabilidades (ej: fetch + render + validación)

**Solución:** Extraer subcomponentes y utilidades.

---

## 7. Testing

### 7.1 Cobertura Mínima

| Tipo | Cobertura Mínima |
|------|------------------|
| Global | 70% |
| Lógica de negocio | 80% |
| Utilidades críticas | 90% |

### 7.2 Tipos de Tests

| Tipo | Framework | Ubicación | Uso |
|------|-----------|-----------|-----|
| Unitarios | Vitest | `**/*.test.ts` | Lógica de negocio, utilidades |
| Componentes | Vitest + Playwright | `**/*.svelte.test.ts` | Renderizado, interacciones |
| Integración | Vitest | `src/__tests__/api/` | Endpoints API |
| E2E | Playwright | `e2e/**/*.test.ts` | Flujos críticos de usuario |

### 7.3 Tests Unitarios para Lógica de Negocio

```typescript
// src/lib/utils/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validateRut } from './validation';

describe('validateEmail', () => {
	it('debe retornar true para email válido', () => {
		expect(validateEmail('test@example.com')).toBe(true);
	});
	
	it('debe retornar false para email inválido', () => {
		expect(validateEmail('invalid-email')).toBe(false);
	});
});
```

### 7.4 Tests de Integración para API

```typescript
// src/__tests__/api/centros/centros.test.ts
import { describe, it, expect } from 'vitest';

describe('GET /api/centros', () => {
	it('debe retornar lista de centros para usuario autenticado', async () => {
		// Test de integración
	});
	
	it('debe retornar 401 para usuario no autenticado', async () => {
		// Test de seguridad
	});
});
```

### 7.5 Tests E2E para Flujos Críticos

```typescript
// e2e/auth.test.ts
import { test, expect } from '@playwright/test';

test('flujo de login completo', async ({ page }) => {
	await page.goto('/auth/login');
	await page.fill('input[name="email"]', 'test@example.com');
	await page.click('button[type="submit"]');
	await expect(page).toHaveURL('/dashboard');
});
```

### 7.6 Límites de Archivos de Test

| Métrica | Límite | Justificación |
|---------|--------|---------------|
| Líneas por archivo `.test.ts` | < 300 | Permitir tests comprehensivos |
| Tests por archivo | < 20 | Mantener legibilidad |

**Si excede:** Dividir por contexto (happy-path, error-cases, security).

---

## 8. Proceso de Validación

### 8.1 Validación Automática

Ejecutar antes de cada commit:

```bash
# Verificar linting
npm run lint

# Verificar formateo
npm run format

# Verificar tipos
npm run check

# Ejecutar tests
npm run test:unit
```

### 8.2 Validación Pre-PR

Antes de solicitar review:

1. **Verificar CI pasa** en la branch
2. **Ejecutar análisis de calidad:**
   ```bash
   # Análisis de Svelte
   npx svelteqa src/lib/components
   
   # Análisis de TypeScript
   npx tsskill src/lib/server
   ```
3. **Revisar métricas:**
   - Archivos < 200 líneas
   - Complejidad < 10
   - Sin código duplicado significativo

### 8.3 Validación Pre-Merge

Criterios obligatorios para merge:

- [ ] CI pasa (lint, test, build)
- [ ] Cobertura de tests ≥ 70%
- [ ] Sin regresiones en tests existentes
- [ ] Código revisado y aprobado
- [ ] Documentación actualizada (si aplica)

### 8.4 Monitoreo Continuo

**Métricas a monitorear:**
- Complejidad ciclomática promedio
- Porcentaje de código duplicado
- Cobertura de tests
- Tiempo de build

**Herramientas:**
- `svelteqa` para componentes Svelte
- `tsskill` para archivos TypeScript
- ESLint con reglas personalizadas

---

## 9. Checklist de Calidad

### 9.1 Antes de Cada Commit

- [ ] Archivo < 200 líneas (excepto tests < 300)
- [ ] Complejidad ciclomática < 10
- [ ] Sin código duplicado significativo
- [ ] Tipos TypeScript correctos
- [ ] `npm run lint` sin errores
- [ ] `npm run check` sin errores

### 9.2 Antes de Cada PR

- [ ] Tests para nueva funcionalidad
- [ ] Tests pasan localmente
- [ ] CI pasa
- [ ] Documentación actualizada (si aplica)
- [ ] Comentarios en lógica compleja
- [ ] Nomenclatura consistente

### 9.3 Review de Código

- [ ] Código sigue estándares del proyecto
- [ ] Principios de diseño aplicados
- [ ] Sin vulnerabilidades de seguridad
- [ ] Manejo de errores apropiado
- [ ] Tests cubren casos edge

---

## 10. Excepciones y Justificaciones

### 10.1 Cuándo Permitir Excepciones

Las excepciones a estos estándares deben:

1. Estar documentadas con justificación técnica
2. Ser aprobadas por un mantenedor
3. Incluir un comentario en el código explicando la razón

### 10.2 Formato de Excepción

```typescript
// @quality-exception: complejidad 12
// Justificación: Lógica de validación de RUT chileno que no puede
// simplificarse sin perder legibilidad. Refactorización pendiente.
function validateRut(rut: string): boolean {
	// ... lógica compleja
}
```

---

## 11. Referencias

- [Informe de Calidad de Código](./informe-calidad-codigo.md) - Análisis actual del proyecto
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guía de contribución
- [Svelte 5 Docs](https://svelte-5-preview.vercel.app/docs/runes) - Documentación de runes
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/) - Guía de TypeScript
- [Vitest Docs](https://vitest.dev/) - Documentación de testing

---

**Documento mantenido por el equipo de desarrollo de MytilusData**