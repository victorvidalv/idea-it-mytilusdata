# Documentación de Componentes Frontend - MytilusData

## Propósito

Este documento describe la arquitectura de componentes del frontend de MytilusData, organizados por dominio funcional. Está dirigido a desarrolladores que necesiten entender, mantener o extender la interfaz de usuario.

## Audiencia

- Desarrolladores frontend
- Mantenedores del código
- Nuevos integrantes del equipo técnico

## Visión General

El frontend utiliza **Svelte 5** con el paradigma de runes (`$state`, `$derived`, `$effect`) y componentes compilados. La arquitectura sigue el principio de **composición sobre herencia**, con componentes pequeños y enfocados en una única responsabilidad.

### Estructura de Directorios

```
src/lib/components/
├── ui/                    # Componentes base shadcn-svelte
├── layout/                # Estructura de la aplicación
├── auth/                  # Autenticación y login
├── centros/               # Gestión de centros de cultivo
├── ciclos/                # Gestión de ciclos productivos
├── registros/             # Registro de mediciones
├── graficos/              # Visualización de datos
├── datagrid/              # Componentes de tabla reutilizables
├── dashboard/             # Panel de control
├── home/                  # Página de inicio
├── legal/                 # Términos y condiciones
├── origenes/              # Gestión de orígenes de datos
├── perfil/                # Perfil de usuario
├── tipos-medicion/        # Gestión de tipos de medición
├── usuarios/              # Gestión de usuarios (admin)
├── acerca-de/             # Sección informativa
└── [componentes raíz]     # MapContainer, SearchableSelect, SvarDataGrid
```

---

## Componentes Compartidos (Raíz)

Estos componentes se encuentran directamente en `src/lib/components/` y son utilizados por múltiples dominios.

### MapContainer, MapLibreMap, MapMarkers

**Ubicación:** [`src/lib/components/`](../src/lib/components/)

**Propósito:** Visualización de mapas interactivos para selección de coordenadas geográficas.

| Componente            | Responsabilidad                          |
| --------------------- | ---------------------------------------- |
| `MapContainer.svelte` | Contenedor wrapper con estilos y layout  |
| `MapLibreMap.svelte`  | Inicialización del mapa MapLibre GL      |
| `MapMarkers.svelte`   | Renderizado de marcadores en el mapa     |

**Uso principal:** Selección de ubicación de centros de cultivo.

**Utilidades:** [`map-utils.ts`](../src/lib/components/map-utils.ts) - Funciones de conversión de coordenadas.

### SearchableSelect

**Ubicación:** [`src/lib/components/SearchableSelect.svelte`](../src/lib/components/SearchableSelect.svelte)

**Propósito:** Selector desplegable con búsqueda integrada para listas extensas.

**Componentes relacionados:**
- `SearchableSelectButton.svelte` - Botón que dispara el dropdown
- `SearchableSelectDropdown.svelte` - Panel desplegable con opciones
- `SearchableSelectOption.svelte` - Opción individual

**Utilidades:** [`searchable-select-utils.ts`](../src/lib/components/searchable-select-utils.ts)

**Uso principal:** Selección de centros, ciclos, tipos de medición y orígenes en formularios.

### SvarDataGrid

**Ubicación:** [`src/lib/components/SvarDataGrid.svelte`](../src/lib/components/SvarDataGrid.svelte)

**Propósito:** Tabla de datos con funcionalidades de ordenamiento, paginación y edición inline.

**Características:**
- Ordenamiento por columnas
- Paginación integrada
- Edición inline de celdas
- Soporte para tipos de datos personalizados

---

## Componentes UI Base (shadcn-svelte)

**Ubicación:** [`src/lib/components/ui/`](../src/lib/components/ui/)

Componentes primitivos de UI basados en shadcn-svelte y bits-ui. No documentados individualmente por ser componentes de librería.

| Directorio  | Componentes                     | Uso principal                    |
| ----------- | ------------------------------- | -------------------------------- |
| `button/`   | Button                          | Acciones y formularios           |
| `input/`    | Input                           | Campos de texto                  |
| `label/`    | Label                           | Etiquetas de formulario          |
| `card/`     | Card, CardHeader, CardContent   | Contenedores visuales            |
| `sonner/`   | Sonner (toast)                  | Notificaciones                   |

---

## Dominio: Auth

**Ubicación:** [`src/lib/components/auth/`](../src/lib/components/auth/)

**Propósito:** Gestión del flujo de autenticación mediante Magic Links.

### Estructura del Formulario de Login

El login está compuesto por múltiples componentes que manejan diferentes estados del flujo:

| Componente                   | Responsabilidad                                |
| ---------------------------- | ---------------------------------------------- |
| `LoginHeader.svelte`         | Título y descripción del formulario            |
| `LoginEmailForm.svelte`      | Campo de entrada de email                      |
| `LoginFormContent.svelte`    | Contenedor del formulario                      |
| `LoginSubmitButton.svelte`   | Botón de envío con estado de carga             |
| `LoginFooter.svelte`         | Enlaces e información adicional                |
| `LoginVisualPanel.svelte`    | Panel visual lateral (desktop)                 |
| `LoginBackLink.svelte`       | Enlace para volver al inicio                   |

### Estados del Login

| Componente                   | Estado que representa                           |
| ---------------------------- | ----------------------------------------------- |
| `LoginDefaultState.svelte`   | Estado inicial del formulario                   |
| `LoginSuccessState.svelte`   | Confirmación de email enviado                   |
| `LoginRateLimitWarning.svelte` | Advertencia de rate limiting activo           |
| `LoginCaptchaError.svelte`   | Error de verificación CAPTCHA                   |
| `LoginRegistrationForm.svelte` | Formulario de registro para nuevos usuarios   |

### Lógica de Estado

**Archivo:** [`loginFormState.ts`](../src/lib/components/auth/loginFormState.ts)

Maneja la máquina de estados del formulario:
- `idle` → Estado inicial
- `submitting` → Enviando solicitud
- `success` → Email enviado
- `error` → Error en el envío

### Integración con Turnstile

**Archivo:** [`turnstile.ts`](../src/lib/components/auth/turnstile.ts)

Funciones para renderizar y validar el widget de Cloudflare Turnstile.

---

## Dominio: Layout

**Ubicación:** [`src/lib/components/layout/`](../src/lib/components/layout/)

**Propósito:** Estructura visual principal de la aplicación autenticada.

### Header

**Archivo:** [`Header.svelte`](../src/lib/components/layout/Header.svelte)

**Responsabilidades:**
- Logo y nombre de la aplicación
- Navegación de usuario
- Menú desplegable de perfil
- Toggle de tema claro/oscuro
- Indicador de rol de usuario

### Sidebar

**Archivo:** [`Sidebar.svelte`](../src/lib/components/layout/Sidebar.svelte)

**Responsabilidades:**
- Navegación principal de la aplicación
- Menú colapsable/expandible
- Indicador de sección activa
- Enlaces condicionales según rol

**Secciones del menú:**
- Dashboard
- Centros
- Ciclos
- Registros
- Gráficos
- Perfil
- Admin (solo rol ADMIN)
- Investigador (solo rol INVESTIGADOR o ADMIN)

---

## Dominio: Centros

**Ubicación:** [`src/lib/components/centros/`](../src/lib/components/centros/)

**Propósito:** Gestión de centros de cultivo (lugares de producción).

### Formularios

| Componente                  | Responsabilidad                              |
| --------------------------- | -------------------------------------------- |
| `CentroCreateForm.svelte`   | Formulario completo de creación              |
| `CentroEditForm.svelte`     | Formulario de edición                        |
| `CentroFormFields.svelte`   | Campos del formulario (nombre, coordenadas)  |
| `CentroFormActions.svelte`  | Botones de acción (guardar, cancelar)        |
| `CentroMapSelector.svelte`  | Selector de ubicación en mapa interactivo    |

### Visualización

| Componente              | Responsabilidad                          |
| ----------------------- | ---------------------------------------- |
| `CentroRow.svelte`      | Fila de tabla con datos del centro       |
| `CentroRowDisplay.svelte` | Visualización de datos del centro      |
| `CentroRowActions.svelte` | Acciones por fila (editar, eliminar)   |
| `CentroDeleteButton.svelte` | Botón de eliminación con confirmación |

### Utilidades

**Archivo:** [`centro-form-utils.ts`](../src/lib/components/centros/centro-form-utils.ts)

Funciones de validación y transformación de datos del formulario.

---

## Dominio: Ciclos

**Ubicación:** [`src/lib/components/ciclos/`](../src/lib/components/ciclos/)

**Propósito:** Gestión de ciclos productivos (períodos de cultivo).

### Componentes

| Componente                  | Responsabilidad                              |
| --------------------------- | -------------------------------------------- |
| `CicloCreateForm.svelte`    | Formulario de creación de ciclo              |
| `CicloRow.svelte`           | Fila de tabla con datos del ciclo            |
| `CiclosGrid.svelte`         | Grid de visualización de ciclos              |
| `CiclosPageHeader.svelte`   | Encabezado de la página de ciclos            |
| `CiclosEmptyState.svelte`   | Estado vacío cuando no hay ciclos            |
| `CiclosNoCentrosAlert.svelte` | Alerta cuando no hay centros creados       |

### Utilidades

**Archivo:** [`ciclo-utils.ts`](../src/lib/components/ciclos/ciclo-utils.ts)

Funciones de formato y cálculo de fechas de ciclo.

---

## Dominio: Registros

**Ubicación:** [`src/lib/components/registros/`](../src/lib/components/registros/)

**Propósito:** Registro y gestión de mediciones (datos de producción).

### Formularios

| Componente                      | Responsabilidad                          |
| ------------------------------- | ---------------------------------------- |
| `RegistroCreateForm.svelte`     | Formulario de creación de registro       |
| `RegistroEditForm.svelte`       | Formulario de edición de registro        |
| `RegistroFormMedicion.svelte`   | Campos de medición (valor, tipo)         |
| `RegistroFormContexto.svelte`   | Campos de contexto (centro, ciclo, fecha)|
| `RegistroEditMedicionFields.svelte` | Campos de medición en edición       |
| `RegistroEditContextoFields.svelte` | Campos de contexto en edición       |

### Visualización

| Componente                  | Responsabilidad                          |
| --------------------------- | ---------------------------------------- |
| `RegistroRow.svelte`        | Fila de tabla con datos del registro     |
| `RegistroRowContent.svelte` | Contenido expandido de la fila           |
| `RegistroRowActions.svelte` | Acciones por fila (editar, eliminar)     |
| `RegistroRowCentro.svelte`  | Visualización del centro asociado        |
| `RegistroRowOrigen.svelte`  | Visualización del origen de datos        |

### Utilidades

| Archivo                      | Propósito                               |
| ---------------------------- | --------------------------------------- |
| `registro-edit-utils.ts`     | Utilidades para edición de registros    |
| `registro-row-types.ts`      | Tipos TypeScript para filas             |
| `registros-page-utils.ts`    | Utilidades generales de la página       |

### Estados Especiales

| Componente                      | Propósito                               |
| ------------------------------- | --------------------------------------- |
| `RegistrosNoCentrosAlert.svelte`| Alerta cuando no hay centros            |
| `RegistrosPageHeader.svelte`    | Encabezado de la página de registros    |

---

## Dominio: Gráficos

**Ubicación:** [`src/lib/components/graficos/`](../src/lib/components/graficos/)

**Propósito:** Visualización de datos mediante gráficos de series temporales.

### Componentes Principales

| Componente                  | Responsabilidad                          |
| --------------------------- | ---------------------------------------- |
| `DashboardGraficos.svelte`  | Contenedor principal de gráficos         |
| `GraficoEvolucion.svelte`   | Gráfico de evolución temporal            |
| `EstadisticasPanel.svelte`  | Panel de estadísticas resumidas          |
| `FiltrosPanel.svelte`       | Panel de filtros para gráficos           |
| `FiltrosPanelHeader.svelte` | Encabezado del panel de filtros          |

### Filtros y Selección

| Componente                  | Responsabilidad                          |
| --------------------------- | ---------------------------------------- |
| `TipoMedicionButton.svelte` | Botón de selección de tipo de medición   |
| `GraficoEmptyState.svelte`  | Estado vacío cuando no hay datos         |

### Utilidades y Tipos

| Archivo                      | Propósito                               |
| ---------------------------- | --------------------------------------- |
| `dashboardUtils.ts`          | Utilidades para el dashboard            |
| `filtroEntidades.ts`         | Lógica de filtrado por entidad          |
| `filtroRegistros.ts`         | Lógica de filtrado de registros         |
| `validacionSelecciones.ts`   | Validación de selecciones de usuario    |
| `seriesColors.ts`            | Paleta de colores para series           |
| `types.ts`                   | Tipos TypeScript para gráficos          |

---

## Dominio: Datagrid

**Ubicación:** [`src/lib/components/datagrid/`](../src/lib/components/datagrid/)

**Propósito:** Componentes reutilizables para visualización de datos en tabla.

### Componentes

| Componente                    | Responsabilidad                          |
| ----------------------------- | ---------------------------------------- |
| `DataGridTableView.svelte`    | Vista de tabla tradicional               |
| `DataGridGridView.svelte`     | Vista de tarjetas/grid                   |
| `DataGridPagination.svelte`   | Controles de paginación                  |
| `DataGridSearchBar.svelte`    | Barra de búsqueda                        |
| `DataGridTableHeader.svelte`  | Encabezado de tabla con ordenamiento     |
| `DataGridEmptyState.svelte`   | Estado vacío                             |

### Utilidades

| Archivo                      | Propósito                               |
| ---------------------------- | --------------------------------------- |
| `datagrid-types.ts`          | Tipos TypeScript para datagrid          |
| `filter-utils.ts`            | Utilidades de filtrado                  |
| `sort-utils.ts`              | Utilidades de ordenamiento              |
| `sort-comparator.ts`         | Comparadores para ordenamiento          |
| `svar-column-converter.ts`   | Conversión de columnas para SvarDataGrid|
| `svar-editor-config.ts`      | Configuración de editores inline        |
| `svar-grid-api.ts`           | API programática del grid               |

---

## Dominio: Dashboard

**Ubicación:** [`src/lib/components/dashboard/`](../src/lib/components/dashboard/)

**Propósito:** Panel de control principal del usuario autenticado.

### Componentes

| Componente                      | Responsabilidad                          |
| ------------------------------- | ---------------------------------------- |
| `DashboardStatCard.svelte`      | Tarjeta de estadística individual        |
| `DashboardActivityAlerts.svelte`| Alertas de actividad reciente            |
| `DashboardChartPlaceholder.svelte` | Placeholder para gráficos             |

### Exports

**Archivo:** [`index.ts`](../src/lib/components/dashboard/index.ts)

Exporta todos los componentes del dominio para importación centralizada.

---

## Dominio: Home

**Ubicación:** [`src/lib/components/home/`](../src/lib/components/home/)

**Propósito:** Componentes de la página de inicio pública.

### Componentes

| Componente                    | Responsabilidad                          |
| ----------------------------- | ---------------------------------------- |
| `HomeEntitiesSection.svelte`  | Sección de entidades/organizaciones      |
| `HomeEntityCard.svelte`       | Tarjeta de entidad individual            |

---

## Dominio: Legal

**Ubicación:** [`src/lib/components/legal/`](../src/lib/components/legal/)

**Propósito:** Términos y condiciones de servicio.

### Componentes

| Componente                | Responsabilidad                          |
| ------------------------- | ---------------------------------------- |
| `TermSection.svelte`      | Sección individual de términos           |

### Secciones Específicas

| Componente                          | Contenido                        |
| ----------------------------------- | -------------------------------- |
| `SectionIdentidad.svelte`           | Identificación del responsable   |
| `SectionGobernanza.svelte`          | Gobernanza de datos              |
| `SectionLegitimacion.svelte`        | Base legal y legitimación        |
| `SectionDerechosArcop.svelte`       | Derechos ARCO                    |
| `SectionSeguridad.svelte`           | Medidas de seguridad             |
| `SectionPropiedadIntelectual.svelte`| Propiedad intelectual            |
| `SectionProteccionConsumidor.svelte`| Protección al consumidor         |

---

## Dominio: Orígenes

**Ubicación:** [`src/lib/components/origenes/`](../src/lib/components/origenes/)

**Propósito:** Gestión de orígenes de datos (manual, satelital, PSMB, etc.).

### Componentes

| Componente                    | Responsabilidad                          |
| ----------------------------- | ---------------------------------------- |
| `OrigenCreateForm.svelte`     | Formulario de creación de origen         |
| `OrigenesTable.svelte`        | Tabla de orígenes                        |
| `OrigenRow.svelte`            | Fila de tabla de origen                  |
| `OrigenesPageHeader.svelte`   | Encabezado de la página                  |

---

## Dominio: Perfil

**Ubicación:** [`src/lib/components/perfil/`](../src/lib/components/perfil/)

**Propósito:** Gestión del perfil de usuario.

### Secciones

| Componente                        | Responsabilidad                          |
| --------------------------------- | ---------------------------------------- |
| `PerfilInfoSection.svelte`        | Información personal del usuario         |
| `PerfilApiKeysSection.svelte`     | Gestión de API Keys                      |
| `PerfilExportSection.svelte`      | Exportación de datos del usuario         |
| `PerfilDangerZoneSection.svelte`  | Zona de peligro (eliminación de cuenta)  |

---

## Dominio: Tipos de Medición

**Ubicación:** [`src/lib/components/tipos-medicion/`](../src/lib/components/tipos-medicion/)

**Propósito:** Gestión de tipos de medición (talla, biomasa, temperatura, etc.).

### Componentes

| Componente                        | Responsabilidad                          |
| --------------------------------- | ---------------------------------------- |
| `TipoMedicionCreateForm.svelte`   | Formulario de creación                   |
| `TiposMedicionTable.svelte`       | Tabla de tipos de medición               |
| `TipoMedicionRow.svelte`          | Fila de tabla                            |
| `TiposMedicionPageHeader.svelte`  | Encabezado de la página                  |
| `AccessDenied.svelte`             | Mensaje de acceso denegado               |

---

## Dominio: Usuarios (Admin)

**Ubicación:** [`src/lib/components/usuarios/`](../src/lib/components/usuarios/)

**Propósito:** Gestión de usuarios (solo administradores).

### Componentes

| Componente                    | Responsabilidad                          |
| ----------------------------- | ---------------------------------------- |
| `UsuarioRow.svelte`           | Fila de tabla de usuario                 |
| `UsuariosSummaryCards.svelte` | Tarjetas resumen de usuarios por rol     |

### Configuración

**Archivo:** [`rolConfig.ts`](../src/lib/components/usuarios/rolConfig.ts)

Configuración de roles y permisos para la UI.

---

## Dominio: Acerca de

**Ubicación:** [`src/lib/components/acerca-de/`](../src/lib/components/acerca-de/)

**Propósito:** Sección informativa sobre el proyecto.

### Componentes

| Componente                    | Responsabilidad                          |
| ----------------------------- | ---------------------------------------- |
| `AcercaDeSection.svelte`      | Sección contenedora                      |
| `SectionPropuestaValor.svelte`| Propuesta de valor del proyecto          |
| `SectionEjeTecnico.svelte`    | Eje técnico                              |
| `SectionEjeEconomico.svelte`  | Eje económico                            |
| `SectionEjeOperativo.svelte`  | Eje operativo                            |

---

## Patrones Utilizados

### Composición de Componentes

Los componentes se diseñan para ser compuestos, no heredados. Ejemplo típico:

```svelte
<!-- LoginForm.svelte compone múltiples componentes -->
<LoginHeader />
<LoginFormContent>
  <LoginEmailForm />
  <LoginSubmitButton />
</LoginFormContent>
<LoginFooter />
```

### Manejo de Estado con Runes

Svelte 5 utiliza runes para reactividad:

- `$state()` - Estado reactivo local
- `$derived()` - Valores derivados de otros estados
- `$effect()` - Efectos secundarios

### Props Principales por Convención

| Prop         | Uso                                       |
| ------------ | ----------------------------------------- |
| `data`       | Datos principales del componente          |
| `onSave`     | Callback para acción de guardar           |
| `onCancel`   | Callback para cancelar operación          |
| `onDelete`   | Callback para eliminación                 |
| `disabled`   | Deshabilitar interacciones                |
| `loading`    | Estado de carga                           |
| `error`      | Mensaje de error                          |

### Eventos

Los componentes emiten eventos usando `createEventDispatcher`:

```typescript
// Patrón típico de eventos
dispatch('save', data);
dispatch('cancel');
dispatch('delete', { id });
```

---

## Testing

Los componentes con tests unitarios están identificados por archivos `.test.ts` o `.svelte.test.ts` adyacentes:

| Componente                    | Archivo de Test                              |
| ----------------------------- | -------------------------------------------- |
| `SearchableSelect.svelte`     | `SearchableSelect.svelte.test.ts`            |
| `SvarDataGrid.svelte`         | `SvarDataGrid.svelte.test.ts`                |
| `CentroCreateForm.svelte`     | `CentroCreateForm.svelte.test.ts`            |
| `CentroRow.svelte`            | `CentroRow.svelte.test.ts`                   |
| `CicloCreateForm.svelte`      | `CicloCreateForm.svelte.test.ts`             |
| `CicloRow.svelte`             | `CicloRow.svelte.test.ts`                    |
| `RegistroCreateForm.svelte`   | `RegistroCreateForm.svelte.test.ts`          |
| `RegistroEditForm.svelte`     | `RegistroEditForm.svelte.test.ts`            |
| `RegistroRow.svelte`          | `RegistroRow.svelte.test.ts`                 |
| `Header.svelte`               | `Header.svelte.test.ts`                      |

---

## Referencias

- [architecture.md](./architecture.md) - Arquitectura general del sistema
- [api.md](./api.md) - Documentación de API REST
- [testing.md](./testing.md) - Guía de testing