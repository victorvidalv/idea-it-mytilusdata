# Documentación del Motor Predictivo - MytilusData

**Fecha:** 2026-03-19
**Versión:** 1.0
**Audiencia:** Desarrolladores, investigadores, científicos de datos

---

## Propósito

Este documento describe el sistema de modelado predictivo de MytilusData, diseñado para proyectar el crecimiento de *Mytilus chilensis* (chorito/mejillón) mediante curvas sigmoidales. Permite entender la arquitectura, algoritmos, datos requeridos y limitaciones del sistema.

---

## Visión General

### Objetivo del Sistema

El motor predictivo genera proyecciones de biomasa y talla para ciclos de cultivo de mitilidos, permitiendo:

1. **Planificación de cosecha:** Estimar fechas óptimas basadas en talla objetivo
2. **Comparación de centros:** Analizar diferencias en tasas de crecimiento
3. **Detección de anomalías:** Identificar desviaciones del crecimiento esperado

### Contexto Científico

El crecimiento de mitilidos sigue patrones sigmoidales característicos, donde la talla aumenta lentamente al inicio, se acelera en la fase media y se estabiliza al aproximarse a la talla máxima. Este comportamiento se modela mediante funciones como la **curva logística**, **Gompertz** y **von Bertalanffy**.

### Estado Actual

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Tabla `biblioteca` | ✅ Implementado | Almacena parámetros ajustados |
| Modelo logístico | ✅ Implementado | Algoritmo Levenberg-Marquardt |
| Extracción de datos | ✅ Implementado | Desde mediciones a biblioteca |
| API de predicción | ⚠️ Parcial | Sin endpoint dedicado |
| Integración frontend | ⚠️ Parcial | Visualización limitada |
| Modelos alternativos | ❌ Pendiente | Gompertz, von Bertalanffy |

---

## Tabla `biblioteca`

### Esquema

Definida en [`src/lib/server/db/schema/library.ts`](../src/lib/server/db/schema/library.ts):

```typescript
export const biblioteca = pgTable('biblioteca', {
  id: serial('id').primaryKey(),
  
  // Código de referencia legible
  codigoReferencia: text('codigo_referencia').notNull(),
  
  // Ciclo de origen
  cicloId: integer('ciclo_origen_id')
    .notNull()
    .references(() => ciclos.id),
  
  // Puntos de datos: {dia: talla}
  puntosJson: jsonb('puntos_json').$type<PuntosTalla>().notNull(),
  
  // Parámetros del modelo sigmoidal
  parametrosCalculados: jsonb('parametros_calculados')
    .$type<ParametrosSigmoidal>()
    .notNull(),
  
  // Tipo de fórmula utilizada
  formulaTipo: text('formula_tipo').notNull().default('LOGISTICO'),
  
  // Metadatos adicionales
  metadatos: jsonb('metadatos').$type<MetadatosBiblioteca>(),
  
  // Usuario propietario
  userId: integer('user_id')
    .notNull()
    .references(() => usuarios.id),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
```

### Tipos de Datos

```typescript
// Puntos de talla: {dia: talla}
type PuntosTalla = Record<string, number>;
// Ejemplo: {"0": 15.5, "30": 25.2, "60": 38.7, "90": 52.1}

// Parámetros del modelo sigmoidal
type ParametrosSigmoidal = {
  L: number;   // Asíntota superior (talla máxima en mm)
  k: number;   // Tasa de crecimiento (1/día)
  x0: number;  // Punto de inflexión (día de crecimiento medio)
  r2: number;  // Coeficiente de determinación
};
// Ejemplo: {L: 85.5, k: 0.0234, x0: 120.5, r2: 0.92}

// Metadatos opcionales
type MetadatosBiblioteca = {
  origen?: string;
  [key: string]: unknown;
};
```

### Relaciones

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   usuarios   │       │    ciclos    │       │  biblioteca  │
│──────────────│       │──────────────│       │──────────────│
│ id           │◀──────│ lugarId      │       │ id           │
│ email        │       │ nombre       │       │ cicloId      │──────▶ ciclos.id
│ rol          │       │ fechaSiembra │       │ userId       │──────▶ usuarios.id
└──────────────┘       └──────────────┘       │ parametros   │
                       │                      │ puntosJson   │
                       │                      │ formulaTipo  │
                       │                      └──────────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   mediciones     │
              │──────────────────│
              │ cicloId          │──────▶ ciclos.id
              │ valor (talla)    │
              │ fechaMedicion    │
              └──────────────────┘
```

---

## Algoritmos Utilizados

### Modelo Logístico

**Ecuación:**

```
f(t) = L / (1 + exp(-k * (t - x0)))
```

**Parámetros:**

| Parámetro | Descripción | Unidad | Restricciones |
|-----------|-------------|--------|---------------|
| L | Asíntota superior (talla máxima) | mm | 40 ≤ L ≤ 110 |
| k | Tasa de crecimiento | 1/día | 0.005 ≤ k ≤ 0.06 |
| x0 | Punto de inflexión | días | 0 ≤ x0 ≤ 500 |

**Interpretación:**

- **L:** Talla máxima esperada del organismo
- **k:** Velocidad con la que se alcanza la talla máxima
- **x0:** Día en que se alcanza el 50% de la talla máxima

### Algoritmo de Ajuste: Levenberg-Marquardt

El ajuste de parámetros se realiza mediante el algoritmo **Levenberg-Marquardt**, implementado en la librería [`ml-levenberg-marquardt`](https://www.npmjs.com/package/ml-levenberg-marquardt).

**Características:**

- Método de optimización no lineal
- Combina Gauss-Newton y descenso de gradiente
- Convergencia robusta para problemas mal condicionados

**Implementación:**

```typescript
// src/lib/server/biblioteca/modelado-utils.ts

export function ejecutarAjuste(
  dias: number[],
  tallas: number[],
  initialValues: number[]
): number[] | null {
  const resultado = levenbergMarquardt(
    { x: dias, y: tallas },
    crearModeloLogistico as ParameterizedFunction,
    {
      initialValues,
      minValues: [40, 0.005, 0],      // Bounds inferiores
      maxValues: [110, 0.06, 500],     // Bounds superiores
      maxIterations: 100,
      gradientDifference: 1e-4,
      damping: 1.5,
      errorTolerance: 1e-8
    }
  );

  return resultado.parameterValues;
}
```

### Restricciones Biológicas

Los bounds de parámetros están basados en restricciones biológicas de *Mytilus chilensis*:

| Parámetro | Mínimo | Máximo | Justificación |
|-----------|--------|--------|---------------|
| L (mm) | 40 | 110 | Tallas observadas en cultivo |
| k (1/día) | 0.005 | 0.06 | Tasas de crecimiento documentadas |
| x0 (días) | 0 | 500 | Rango típico de ciclos productivos |

### Validación del Ajuste

**Criterios de aceptación:**

1. **R² mínimo:** 0.85 (85% de varianza explicada)
2. **Puntos mínimos:** 5 mediciones por ciclo
3. **Convergencia:** El algoritmo debe converger en ≤ 100 iteraciones

```typescript
export const UMBRAL_R2 = 0.85;
export const MIN_PUNTOS = 5;
```

---

## Flujo de Datos para Predicciones

### Diagrama del Proceso

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EXTRACCIÓN                                    │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │ mediciones   │────▶│ Agrupar por  │────▶│ Calcular     │        │
│  │ (talla/día)  │     │ ciclo        │     │ días desde   │        │
│  └──────────────┘     └──────────────┘     │ siembra      │        │
│                                            └──────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        MODELADO                                      │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │ Validar      │────▶│ Calcular     │────▶│ Ejecutar     │        │
│  │ datos (≥5pt) │     │ valores      │     │ Levenberg-   │        │
│  └──────────────┘     │ iniciales    │     │ Marquardt    │        │
│                       └──────────────┘     └──────────────┘        │
│                                                    │                │
│                                                    ▼                │
│                                            ┌──────────────┐        │
│                                            │ Validar R²   │        │
│                                            │ (≥ 0.85)     │        │
│                                            └──────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        CARGA                                         │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │ Formatear    │────▶│ Insertar en  │────▶│ tabla        │        │
│  │ parámetros   │     │ biblioteca   │     │ biblioteca   │        │
│  └──────────────┘     └──────────────┘     └──────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

### Código del Flujo

```typescript
// 1. Extracción
import { extraerYTransformar } from '$lib/server/biblioteca';

const { datosPorCiclo, adminId } = await extraerYTransformar();

// 2. Modelado
import { procesarCiclos, filtrarExitosos } from '$lib/server/biblioteca';

const resultados = procesarCiclos(datosPorCiclo);
const exitosos = filtrarExitosos(resultados);

// 3. Carga
import { cargarBiblioteca } from '$lib/server/biblioteca';

await cargarBiblioteca(exitosos, adminId);
```

### Requisitos de Datos

Para que un ciclo sea procesado correctamente:

| Requisito | Descripción |
|-----------|-------------|
| Mínimo 5 mediciones | Necesario para ajuste estable |
| Mediciones de talla | Tipo de registro "talla" |
| Fecha de siembra | Para calcular días transcurridos |
| Variabilidad en días | Puntos distribuidos en el tiempo |

---

## API de Predicción

### Estado Actual

No existe un endpoint dedicado para predicciones. Los parámetros almacenados en `biblioteca` pueden consultarse mediante:

```http
GET /api/biblioteca
```

> **Nota:** Este endpoint no está implementado actualmente. Los datos se acceden mediante consultas directas a la base de datos.

### Consulta Directa

```typescript
import { getBibliotecaRecords } from '$lib/server/biblioteca';

const registros = await getBibliotecaRecords(userId);
```

### Predicción Manual

Dado un registro de biblioteca, la predicción se calcula como:

```typescript
function predecirTalla(parametros: ParametrosSigmoidal, dia: number): number {
  const { L, k, x0 } = parametros;
  const exponente = Math.max(-20, Math.min(20, -k * (dia - x0)));
  return L / (1 + Math.exp(exponente));
}

// Ejemplo: Predecir talla al día 150
const params = { L: 85.5, k: 0.0234, x0: 120.5, r2: 0.92 };
const talla = predecirTalla(params, 150); // ≈ 72.3 mm
```

### Inversión: Día para Talla Objetivo

```typescript
function diaParaTalla(parametros: ParametrosSigmoidal, tallaObjetivo: number): number {
  const { L, k, x0 } = parametros;
  
  if (tallaObjetivo >= L) {
    return Infinity; // Talla inalcanzable
  }
  
  // Despejar t de la ecuación logística
  const ratio = (L / tallaObjetivo) - 1;
  return x0 - Math.log(ratio) / k;
}

// Ejemplo: Día para alcanzar 70mm
const dia = diaParaTalla(params, 70); // ≈ 138 días
```

---

## Integración con el Frontend

### Estado Actual

La integración es limitada. Los parámetros de biblioteca no se visualizan directamente en la interfaz de usuario.

### Visualización Potencial

```
┌─────────────────────────────────────────────────────────────────┐
│  Gráfico de Crecimiento Predictivo                              │
│                                                                 │
│  Talla (mm)                                                     │
│  100 ┤                         ╭──────────────────────          │
│   90 ┤                     ╭────╯                               │
│   80 ┤                 ╭───╯                                    │
│   70 ┤             ╭───╯                                        │
│   60 ┤         ╭───╯                                            │
│   50 ┤     ╭───╯                                                │
│   40 ┤ ╭───╯                                                    │
│   30 ┤─╯                                                        │
│      └───────────────────────────────────────────────────────── │
│        0    30    60    90   120   150   180   210   240  Días  │
│                                                                 │
│  ● Datos reales   ─ Curva ajustada (R² = 0.92)                  │
│  L = 85.5mm  k = 0.0234  x₀ = 120.5 días                        │
└─────────────────────────────────────────────────────────────────┘
```

### Componentes Relacionados

| Componente | Ubicación | Estado |
|------------|-----------|--------|
| Gráficos de evolución | [`src/lib/components/graficos/`](../src/lib/components/graficos/) | Muestra datos reales |
| Panel de estadísticas | [`EstadisticasPanel.svelte`](../src/lib/components/graficos/EstadisticasPanel.svelte) | Sin predicciones |

---

## Limitaciones Actuales

### Técnicas

| Limitación | Impacto | Mitigación |
|------------|---------|------------|
| Solo modelo logístico | Menor precisión para algunos casos | Implementar Gompertz/von Bertalanffy |
| Sin API dedicada | Difícil integración externa | Crear endpoint `/api/prediccion` |
| Sin visualización | Usuario no ve predicciones | Integrar en gráficos existentes |
| Sin intervalos de confianza | Sin medida de incertidumbre | Implementar bootstrap |

### De Datos

| Limitación | Impacto | Mitigación |
|------------|---------|------------|
| Mínimo 5 puntos | Ciclos cortos excluidos | Reducir umbral con advertencia |
| Sin datos ambientales | Modelo sin temperatura/oxígeno | Integrar variables ambientales |
| Sin validación cruzada | Posible sobreajuste | Implementar validación |

### Operativas

| Limitación | Impacto | Mitigación |
|------------|---------|------------|
| ETL manual | No se actualiza automáticamente | Programar ejecución periódica |
| Sin notificaciones | Usuario no sabe de nuevos modelos | Implementar alertas |

---

## Roadmap de Mejora

### Corto Plazo (1-3 meses)

- [ ] Crear endpoint `GET /api/biblioteca` para consultar parámetros
- [ ] Integrar curvas de predicción en gráficos de evolución
- [ ] Mostrar parámetros L, k, x0 en panel de estadísticas

### Mediano Plazo (3-6 meses)

- [ ] Implementar modelo Gompertz como alternativa
- [ ] Añadir intervalos de confianza (bootstrap)
- [ ] Crear endpoint `POST /api/prediccion` para proyecciones

### Largo Plazo (6-12 meses)

- [ ] Integrar variables ambientales (temperatura, clorofila)
- [ ] Modelo mixto: combinar múltiples centros
- [ ] Validación cruzada automática
- [ ] Dashboard de comparación de modelos

---

## Proceso ETL

### Script ETL.py

Existe un script Python separado para la extracción, transformación y carga de datos de la biblioteca de parámetros.

**Ubicación:** [`ETL.py`](../ETL.py)

**Propósito:**
- Extraer mediciones de talla de la base de datos
- Calcular parámetros sigmoidales usando SciPy
- Cargar resultados en la tabla `biblioteca`

### Requisitos

```bash
# Dependencias Python necesarias
pip install pandas numpy scipy sqlalchemy psycopg2-binary
```

### Ejecución

```bash
# Configurar URL de base de datos en el script
python ETL.py
```

### Flujo del Proceso

1. **Extracción:**
   - Identifica usuario administrador
   - Extrae ciclos con mediciones de talla (`TALLA_LONGITUD`)
   - Calcula días transcurridos desde primera medición

2. **Transformación:**
   - Aplica modelo logístico con restricciones biológicas
   - Filtra ciclos con menos de 5 puntos
   - Calcula R² para validar calidad del ajuste
   - Descarta ajustes con R² < 0.85

3. **Carga:**
   - Trunca tabla `biblioteca`
   - Inserta parámetros calculados con metadatos

### Diferencias con Implementación TypeScript

| Aspecto | ETL.py | TypeScript (src/lib/server/biblioteca/) |
|---------|--------|----------------------------------------|
| Lenguaje | Python | TypeScript |
| Librería ML | scipy.optimize.curve_fit | ml-levenberg-marquardt |
| Ejecución | Manual | Integrada en la aplicación |
| Uso principal | Migración inicial, análisis batch | Operación continua |

### Consideraciones

- **Seguridad:** El script contiene credenciales de BD hardcodeadas. Mover a variables de entorno para producción.
- **Idempotencia:** El script trunca la tabla antes de insertar, eliminando datos previos.
- **Mantenimiento:** Considerar migrar la lógica a TypeScript para unificar el pipeline.

---

## Referencias

### Código Fuente

- [`src/lib/server/biblioteca/`](../src/lib/server/biblioteca/) - Módulo completo
- [`src/lib/server/biblioteca/modelado.ts`](../src/lib/server/biblioteca/modelado.ts) - Lógica de ajuste
- [`src/lib/server/biblioteca/modelado-utils.ts`](../src/lib/server/biblioteca/modelado-utils.ts) - Utilidades
- [`src/lib/server/db/schema/library.ts`](../src/lib/server/db/schema/library.ts) - Esquema de BD

### Documentación Relacionada

- [Base de Datos](./database.md) - Tablas relacionadas
- [API Reference](./api.md) - Endpoints disponibles
- [Arquitectura](./architecture.md) - Contexto del sistema

### Referencias Científicas

- **Crecimiento de mitilidos:** Figueras, A. et al. (2008). "Mussel cultivation in Galicia"
- **Modelos sigmoidales:** Zwietering, M.H. et al. (1990). "Modeling of the bacterial growth curve"
- **Levenberg-Marquardt:** Levenberg, K. (1944). "A method for the solution of certain non-linear problems"

### Librerías

- [ml-levenberg-marquardt](https://www.npmjs.com/package/ml-levenberg-marquardt) - Implementación JavaScript