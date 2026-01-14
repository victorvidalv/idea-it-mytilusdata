# Cambios Introducidos al Modelo Predictivo: Gestión de Incertidumbre y Degradación Temporal

**Fecha:** 2026-04-23
**Versión:** 2.0
**Autor:** Ingeniería de Software — MytilusData
**Audiencia:** Desarrolladores, científicos de datos, equipo de producto

---

## Resumen Ejecutivo

Se implementaron **tres mejoras críticas** en el motor predictivo de *Mytilus chilensis* para elevar el TRL (Technology Readiness Level) desde un modelo determinista puro hacia un sistema que cuantifica el riesgo, modela la estacionalidad ambiental y mide la degradación de la predicción en el tiempo.

Estas mejoras responden a la necesidad real de los centros de cultivo: no solo saber "cuánto crecerá el mejillón", sino **con qué confianza** y **hasta cuándo** esa predicción es fiable antes de que el error acumulado la vuelva referencial.

| Mejora | Estado | Archivos Principales |
|--------|--------|---------------------|
| Bootstrap Paramétrico | ✅ Implementado | `src/lib/server/biblioteca/modelado-utils.ts` |
| Estacionalidad Armónica | ✅ Implementado | `src/lib/server/biblioteca/modelado-utils.ts` |
| Validación Walk-Forward | ✅ Implementado | `src/lib/server/biblioteca/modelado.ts` |
| Visualización Cono de Incertidumbre | ✅ Implementado | `src/lib/components/proyeccion/ProyeccionResultados.svelte` |
| Indicador de Confiabilidad Temporal | ✅ Implementado | `src/lib/components/proyeccion/IndicadorConfiabilidadTemporal.svelte` |

---

## 1. Bootstrap Paramétrico (Cuantificación de Riesgo)

### ¿Qué se hizo?

Se creó la función `calcularProyeccionBootstrap(dias, longitudes, horizonteDias)` que ejecuta **1.000 iteraciones** de re-muestreo con reemplazo sobre los datos de entrada. En cada iteración:

1. Se remuestrean los pares (día, talla) con reemplazo.
2. Se ajusta el modelo logístico mediante Levenberg-Marquardt en modo rápido (`maxIterations: 40`, semilla = parámetros originales).
3. Se proyecta al horizonte solicitado.
4. Se calculan los percentiles **2.5, 50 (mediana) y 97.5** para cada día proyectado.

### Optimización Computacional

Para evitar bloquear el event loop de Node.js durante las 1.000 iteraciones:

- **Batching asincrónico:** Las iteraciones se procesan en lotes de 50. Entre cada lote se cede el control al event loop mediante `await new Promise(r => setImmediate(r))`.
- **LM acelerado:** Durante el bootstrap se usa una configuración relajada de Levenberg-Marquardt (menos iteraciones, mayor tolerancia de error) y se parte de los parámetros del ajuste original como semilla, logrando convergencia ~3× más rápida.

**Resultado de rendimiento:** ~150–170 ms para 1.000 ajustes + proyección (por debajo del umbral crítico de 300 ms).

### Justificación

En acuicultura, tomar decisiones de cosecha con un punto único de proyección es riesgoso. El bootstrap paramétrico permite:

- **Cuantificar la incertidumbre** sin depender de supuestos distribucionales estrictos.
- **Generar bandas de confianza** que los productores puedan interpretar visualmente.
- **Mantener la eficiencia** sin migrar a Python ni instalar librerías de ML pesadas.

---

## 2. Estacionalidad vía Armónicos Simples

### ¿Qué se hizo?

Se extendió el modelo logístico base para que la tasa de crecimiento `k` deje de ser una constante estática y se convierta en una función dependiente del tiempo:

```
k(t) = k₀ + k₁·sin(2πt/365) + k₂·cos(2πt/365)
```

- **Nuevos parámetros:** `k₁` (coeficiente senoidal) y `k₂` (coeficiente cosenoidal).
- **Vector de parámetros:** De 3 a 5 dimensiones `[L, k₀, k₁, k₂, x₀]`.
- **Bounds estrictos:** `k₁` y `k₂` están acotados en `[-0.02, 0.02]` para evitar oscilaciones espurias y garantizar que la estacionalidad sea una perturbación suave sobre la tasa base.
- **Semilla inteligente:** El ajuste estacional parte de la solución base con `k₁=0, k₂=0`, acelerando la convergencia.

### Justificación

El crecimiento de *Mytilus chilensis* en Chile está fuertemente modulado por la **temperatura del agua** y la **productividad primaverano-otoñal** (upwelling costero). En invierno austral, el crecimiento se detiene o decae. Un modelo con `k` constante no captura este efecto, lo que genera sesgos sistemáticos en las proyecciones de cosecha durante los meses de menor actividad biológica.

Los armónicos simples (seno/coseno con período anual) son la forma más parsimoniosa de introducir estacionalidad sin aumentar excesivamente la dimensionalidad del problema ni comprometer la estabilidad numérica del ajuste LM.

---

## 3. Validación Walk-Forward (Medición de Degradación)

### ¿Qué se hizo?

Se implementó `validarDegradacionTemporal(dias, tallas)` en `modelado.ts`:

1. Agrupa los datos históricos por mes aproximado (`dia / 30`).
2. Para cada mes `t` con datos suficientes (`≥ MIN_PUNTOS`):
   - Entrena el modelo con todos los datos hasta el mes `t`.
   - Predice los valores para los meses `t+1`, `t+2` y `t+3`.
   - Calcula el **RMSE** comparando las predicciones con los datos reales de esos meses futuros.
3. Retorna tres arrays de RMSE, uno por horizonte de proyección.

### Justificación

Todo modelo predictivo se degrada al extrapolar más lejos en el tiempo. Medir esa degradación es esencial para:

- **Establecer horizontes de confianza:** Saber hasta qué mes la proyección es operativa y a partir de cuándo es solo referencial.
- **Detectar deriva del modelo:** Si el RMSE crece abruptamente en ventanas recientes, indica que el modelo base ya no representa bien la dinámica del cultivo (cambio ambiental, enfermedad, etc.).
- **Cumplir con estándares de calidad predictiva** en contextos productivos de TRL 7.

---

## 4. Visualización Frontend: Cono de Incertidumbre

### ¿Qué se hizo?

Se actualizó el componente `ProyeccionResultados.svelte` para renderizar un **área de confianza** alrededor de la mediana proyectada:

- **Componente gráfico:** `AreaChart` de `layerchart` (en lugar de `LineChart`) cuando el backend entrega datos de incertidumbre.
- **Serie de banda:** `Area` configurada con `y0 = limiteInferior` y `y1 = limiteSuperior`, `fill: rgba(59, 130, 246, 0.2)` y `stroke: none`. Esto genera un halo azul semitransparente sin bordes duros.
- **Serie de mediana:** `Area` con `line` visible y `fill: transparent`, dibujada encima de la banda.
- **Fallback graceful:** Si el backend no envía `incertidumbre`, el componente sigue usando `LineChart` exactamente como antes.

### Justificación

Una banda de confianza visual permite al usuario no técnico (productor, técnico de campo) entender de un vistazo que la proyección no es un número exacto, sino un rango probable. La opacidad del 20% evita que el área opaque la línea de mediana u otras series (datos reales, curvas de referencia).

---

## 5. Indicador de Confiabilidad Temporal (Semáforo UI)

### ¿Qué se hizo?

Se creó el componente `IndicadorConfiabilidadTemporal.svelte` y se integró en `ProyeccionResultadosTabla.svelte`:

| Horizonte | Color Tailwind | Texto |
|-----------|---------------|-------|
| ≤ 2 meses | `text-emerald-600 / bg-emerald-100` | Alta Confiabilidad |
| ≤ 4 meses | `text-amber-600 / bg-amber-100` | Confiabilidad Media |
| > 4 meses | `text-rose-600 / bg-rose-100` | Baja Confiabilidad (Referencial) |

El indicador es responsivo, usa utilidades puras de Tailwind CSS y muestra el RMSE promedio y el horizonte máximo evaluado.

### Justificación

En la toma de decisiones de cosecha, los productores necesitan saber **cuándo confiar** en la proyección. Un semáforo visual reduce la carga cognitiva y alinea el lenguaje del modelo con el lenguaje operativo del campo. La categorización por meses (corto/mediano/largo plazo) refleja directamente la degradación medida por el walk-forward.

---

## Archivos Modificados y Creados

### Backend (Algoritmos)

| Archivo | Cambio |
|---------|--------|
| `src/lib/server/biblioteca/modelado-utils.ts` | Añadidas: `crearModeloLogisticoEstacional`, `ejecutarAjusteEstacional`, `ejecutarAjusteRapido`, `calcularProyeccionBootstrap`, `calcularR2Generico`, tipos extendidos. |
| `src/lib/server/biblioteca/modelado.ts` | Añadida: `validarDegradacionTemporal` con cálculo de RMSE por horizonte mensual. |
| `src/lib/server/biblioteca/modelado-test-helpers.ts` | **Creado.** Mock data determinista de 18 puntos para testing puro. |
| `src/lib/server/biblioteca/modelado-utils.spec.ts` | **Creado.** 7 tests: bootstrap, estacionalidad, mock data. |
| `src/lib/server/biblioteca/modelado.spec.ts` | **Creado.** 3 tests: walk-forward con asserts de partición y realidad física. |

### Frontend (Visualización)

| Archivo | Cambio |
|---------|--------|
| `src/lib/components/proyeccion/ProyeccionComponentTypes.ts` | Añadidos: `IncertidumbreProyeccion`, `DegradacionRMSE`. |
| `src/lib/components/proyeccion/proyeccion-tipos.ts` | Extendido: `SerieData` con `value` y `props` para `layerchart`. |
| `src/lib/components/proyeccion/proyeccionUtils.ts` | Modificado: `construirSeriesProyeccion` genera series de área cuando hay incertidumbre. |
| `src/lib/components/proyeccion/ProyeccionResultados.svelte` | Modificado: renderiza `AreaChart` con banda de confianza condicionalmente. |
| `src/lib/components/proyeccion/IndicadorConfiabilidadTemporal.svelte` | **Creado.** Semáforo de confiabilidad basado en horizonte RMSE. |
| `src/lib/components/proyeccion/ProyeccionResultadosTabla.svelte` | Modificado: integra el indicador de confiabilidad sobre la tabla. |

---

## Testing y Validación

- **21 tests unitarios** pasan en la suite de `src/lib/server/biblioteca/` (0 dependencias de PostgreSQL/Drizzle).
- **Rendimiento bootstrap:** Validado por test automático (< 300 ms para 1.000 remuestreos).
- **Realidad física walk-forward:** Validado por test automático (`RMSE(t+3) ≥ RMSE(t+1)` en todas las ventanas evaluadas).
- **Estabilidad estacional:** Validado por test automático (sin `NaN`/`Infinity`, `R² > 0.8`).
- **TypeScript:** `svelte-check` no reporta errores nuevos en los archivos modificados.

---

## Próximos Pasos Sugeridos

1. **Integrar endpoint tRPC:** Exponer `calcularProyeccionBootstrap` y `validarDegradacionTemporal` vía el router de tRPC para que el frontend consuma datos reales de incertidumbre.
2. **Persistencia de degradación:** Almacenar los resultados walk-forward en la tabla `biblioteca` (campo `metadatos`) para auditoría histórica.
3. **A/B testing de estacionalidad:** Comparar métricas de ajuste (`R²`, `AIC`) entre el modelo base de 3 parámetros y el estacional de 5 parámetros en producción.
