# Plan: Finalizar Implementación de SvarDataGrid

## Objetivo
Reemplazar el componente [`DataTable.svelte`](src/lib/components/DataTable.svelte) por [`SvarDataGrid.svelte`](src/lib/components/SvarDataGrid.svelte) en todas las páginas, manteniendo las funcionalidades existentes: ordenamiento, paginación, búsqueda y edición inline.

---

## Análisis del Estado Actual

### DataTable.svelte - Funcionalidades actuales
- **Búsqueda**: Filtrado por claves específicas con debounce implícito
- **Ordenamiento**: Multi-columna con indicadores visuales (asc/desc/none)
- **Paginación**: Navegación completa con selector de filas por página
- **Slots**: Renderizado de filas personalizado vía `let:items`
- **Accesorios**: `accessor` para transformar valores antes de ordenar/mostrar

### SvarDataGrid.svelte - Estado actual
- **Búsqueda**: ✅ Implementado
- **Paginación**: ✅ Implementado
- **Ordenamiento**: ⚠️ Parcial - configuración `sort: true` en columnas pero sin lógica visible de control
- **Edición inline**: ✅ Implementado con callbacks `onCellEdit`/`onCellEditEnd`
- **Slots**: ❌ No soporta slots personalizados - usa `template` function
- **Templates**: Soporta `template` function para renderizado personalizado

---

## Gaps Identificados

### Gap 1: Renderizado de filas personalizadas
**Problema**: DataTable usa slots con `let:items` permitiendo componentes Row complejos (formularios de edición, acciones, etc.). SvarDataGrid usa `template` que solo renderiza HTML string.

**Componentes afectados**:
- [`RegistroRow.svelte`](src/lib/components/registros/RegistroRow.svelte) - Edición inline con formularios
- [`CentroRow.svelte`](src/lib/components/centros/CentroRow.svelte) - Edición inline con mapas
- [`CicloRow.svelte`](src/lib/components/ciclos/CicloRow.svelte) - Acciones de toggle/eliminar

**Solución propuesta**: Agregar soporte de slots a SvarDataGrid manteniendo compatibilidad con template.

### Gap 2: Ordenamiento client-side
**Problema**: SvarDataGrid configura `sort: true` pero el wx-svelte-grid maneja el ordenamiento internamente. Necesita exponer el estado de ordenamiento y permitir control externo.

**Solución propuesta**: 
- Implementar `bind:sortState` para exponer columna/dirección actual
- Emitir eventos `onsort` cuando cambia el ordenamiento

### Gap 3: Edición inline compleja
**Problema**: La edición actual de SvarDataGrid es a nivel celda con editores simples. Los componentes Row actuales tienen formularios de edición completos que ocupan toda la fila.

**Solución propuesta**: Mantener el patrón de edición externa (slot para filas en modo edición) en lugar de edición por celda.

---

## Páginas a Migrar

| Página | Tipo de Edición | Complejidad |
|--------|-----------------|-------------|
| [`registros/+page.svelte`](src/routes/(app)/registros/+page.svelte) | Inline con formulario | Alta |
| [`centros/+page.svelte`](src/routes/(app)/centros/+page.svelte) | Inline con mapa | Alta |
| [`ciclos/+page.svelte`](src/routes/(app)/ciclos/+page.svelte) | Acciones inline | Media |
| [`investigador/registros/+page.svelte`](src/routes/(app)/investigador/registros/+page.svelte) | Solo lectura | Baja |
| [`investigador/centros/+page.svelte`](src/routes/(app)/investigador/centros/+page.svelte) | Solo lectura | Baja |
| [`investigador/ciclos/+page.svelte`](src/routes/(app)/investigador/ciclos/+page.svelte) | Solo lectura | Baja |

---

## Tareas de Implementación

### Fase 1: Completar SvarDataGrid con modo híbrido
- [ ] **T1.1**: Agregar propiedad `mode: 'table' | 'grid'` (default: 'table')
- [ ] **T1.2**: Implementar modo table con `<table>` nativa y soporte de slots `let:items`
- [ ] **T1.3**: Implementar ordenamiento client-side en modo table (copiar lógica de DataTable)
- [ ] **T1.4**: Mantener modo grid actual para datos simples con edición por celda
- [ ] **T1.5**: Unificar barra de búsqueda y paginación para ambos modos

### Fase 2: Migración de páginas admin
- [ ] **T2.1**: Migrar `registros/+page.svelte` - usar modo table con RegistroRow
- [ ] **T2.2**: Migrar `centros/+page.svelte` - usar modo table con CentroRow
- [ ] **T2.3**: Migrar `ciclos/+page.svelte` - usar modo table con CicloRow

### Fase 3: Migración de páginas investigador
- [ ] **T3.1**: Migrar `investigador/registros/+page.svelte` - modo table
- [ ] **T3.2**: Migrar `investigador/centros/+page.svelte` - modo table
- [ ] **T3.3**: Migrar `investigador/ciclos/+page.svelte` - modo table

### Fase 4: Limpieza y validación
- [ ] **T4.1**: Actualizar test de DataTable para SvarDataGrid
- [ ] **T4.2**: Ejecutar tests unitarios y validar funcionamiento
- [ ] **T4.3**: Eliminar DataTable.svelte (ya no se usa)

---

## Decisiones Técnicas

### D1: Soporte de slots vs template
**Decisión**: Soportar AMBOS. Usar slot cuando existe, usar template como fallback.

```svelte
{#if $$slots.row}
  <slot name="row" {item} />
{:else if col.template}
  {#html col.template(value, item, col)}
{/if}
```

### D2: Manejo de edición inline
**Decisión**: Mantener el patrón actual de componentes Row externos con estado `editingId`. SvarDataGrid solo provee el contenedor y ordenamiento/paginación.

### D3: API de ordenamiento
**Decisión**: Exponer `sortConfig` como bindable:
```ts
export let sortConfig: { key: string; direction: 'asc' | 'desc' } | null = null;
```

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| wx-svelte-grid no soporta slots nativos | Media | Alto | Usar capa de abstracción sobre el grid |
| Pérdida de funcionalidad en migración | Baja | Medio | Tests de regresión antes/después |
| Performance con muchos datos | Baja | Medio | SvarDataGrid ya usa paginación client-side |
| Incompatibilidad de estilos | Media | Bajo | Reutilizar CSS existente de DataTable |

---

## Hallazgo Crítico: Limitación de wx-svelte-grid

**wx-svelte-grid NO soporta slots de Svelte** para renderizar componentes. Solo soporta `template` que retorna strings HTML.

Esto significa que NO es posible usar el Grid de wx-svelte-grid para los componentes Row actuales que:
- Tienen formularios de edición inline con componentes Svelte (SearchableSelect, MapLibreMap)
- Usan `use:enhance` para formularios
- Tienen lógica de estado compleja

### Solución: Modo Híbrido

SvarDataGrid soportará **dos modos de operación**:

1. **Modo Grid** (`mode="grid"`): Usa wx-svelte-grid para datos simples con edición por celda
2. **Modo Table** (`mode="table"`): Usa `<table>` nativa con slots para filas personalizadas

```svelte
<!-- Modo Table (default para compatibilidad) -->
<SvarDataGrid
  mode="table"
  data={data.registros}
  columns={columns}
  let:items
>
  {#each items as reg (reg.id)}
    <RegistroRow {reg} ... />
  {/each}
</SvarDataGrid>

<!-- Modo Grid para datos simples -->
<SvarDataGrid
  mode="grid"
  data={data.simple}
  columns={columns}
  onCellEdit={handleEdit}
/>
```

### Implicaciones
- **Ordenamiento**: En modo Table, se implementa client-side igual que DataTable actual
- **Edición**: En modo Table, se mantiene el patrón de componentes Row externos
- **Paginación/Búsqueda**: Compartida entre ambos modos

---

## Supuestos

1. El modo Table es el default para mantener compatibilidad con DataTable
2. Los componentes Row actuales funcionan sin cambios mayores
3. No se requiere ordenamiento server-side (todos los datos se cargan inicialmente)
4. El tamaño de datos es manejable en client-side (paginación local es suficiente)

---

## Criterios de Éxito

- [ ] Todas las páginas funcionan con SvarDataGrid
- [ ] Ordenamiento funciona igual que en DataTable
- [ ] Edición inline mantiene funcionalidad completa
- [ ] Tests pasan sin modificaciones mayores
- [ ] No hay regresiones visuales
- [ ] Performance similar o mejor