# Fundamentos del Modelo Predictivo de Crecimiento Valvar

**Proyecto:** MytilusData  
**Dominio:** Mitilicultura, crecimiento valvar de _Mytilus chilensis_  
**Audiencia:** investigadores, desarrolladores, analistas de datos y equipos técnicos  
**Estado:** Documento consolidado y actualizado

---

## 1. Propósito

El modelo predictivo de MytilusData estima la evolución de la talla valvar a lo largo del ciclo productivo y proyecta el día probable en que se alcanzará una talla objetivo. Su propósito no es entregar una certeza absoluta, sino una estimación técnicamente justificada, acompañada de medidas de ajuste, riesgo e incertidumbre.

La lógica central combina dos enfoques:

1. **Ajuste local:** cuando existen suficientes datos del ciclo actual, se ajusta una curva sigmoidal directamente a esas mediciones.
2. **Comparación con perfiles históricos:** cuando los datos son escasos o el ajuste local no es confiable, se compara el ciclo actual con una biblioteca de curvas históricas y se adapta la curva más similar.

Esta arquitectura permite operar en escenarios reales de campo, donde las mediciones pueden ser pocas, irregulares o estar concentradas en etapas tempranas del cultivo.

---

## 2. Contexto Biológico y Productivo

El crecimiento de organismos cultivados no suele ser lineal. En mitilicultura, la talla tiende a seguir una trayectoria con tres fases generales:

1. **Fase inicial:** crecimiento relativamente lento.
2. **Fase media:** aceleración del crecimiento, asociada a mejores condiciones fisiológicas y ambientales.
3. **Fase de estabilización:** reducción progresiva de la velocidad al aproximarse a una talla máxima esperada.

Este comportamiento justifica el uso de curvas sigmoidales. En términos productivos, el modelo ayuda a:

- estimar fechas probables de cosecha;
- comparar el desempeño de un ciclo contra patrones históricos;
- detectar desviaciones tempranas del crecimiento esperado;
- comunicar la incertidumbre de una predicción mediante rangos mínimos y máximos esperados.

---

## 3. Modelo Matemático Base

La función principal es la logística sigmoidal:

```text
f(t) = L / (1 + exp(-k · (t - x0)))
```

Donde:

| Parámetro | Unidad | Interpretación técnica | Interpretación biológica                                |
| --------- | ------ | ---------------------- | ------------------------------------------------------- |
| `L`       | mm     | Asíntota superior      | talla máxima teórica esperada                           |
| `k`       | 1/día  | tasa de crecimiento    | rapidez de transición entre fase lenta y fase acelerada |
| `x0`      | día    | punto de inflexión     | día de máxima velocidad de crecimiento                  |

La velocidad máxima ocurre en `x0` y se calcula como:

```text
vmax = L · k / 4
```

La talla objetivo `y` se transforma en día objetivo mediante la inversa logística:

```text
t = x0 - (1/k) · ln(L/y - 1)
```

Esta solución solo existe si:

```text
0 < y < L
```

Si la talla objetivo es mayor o igual que `L`, el modelo indica que esa meta no es alcanzable bajo los parámetros estimados.

---

## 4. Fundamento del Uso de Perfiles Históricos de Referencia

Con pocas mediciones, estimar libremente `L`, `k` y `x0` puede ser inestable. Por ejemplo, con tres o cuatro puntos tempranos puede haber muchas curvas sigmoidales compatibles con los datos observados, pero con proyecciones futuras muy distintas.

Para reducir ese riesgo, el sistema usa una biblioteca de ciclos históricos. La hipótesis operativa es:

```text
Si el ciclo actual tiene una forma temporal similar a un ciclo histórico,
la forma histórica puede servir como perfil de referencia, ajustando su escala a los datos actuales.
```

La separación conceptual es:

| Elemento         | Qué representa                         | Cómo se estima                                        |
| ---------------- | -------------------------------------- | ----------------------------------------------------- |
| Forma temporal   | patrón de aceleración y estabilización | `k` y `x0` de perfil de referencia o del ajuste local |
| Escala biológica | talla máxima esperada                  | `L` ajustado a los datos actuales                     |

Esto evita sobreajustar la forma de crecimiento cuando hay pocos datos, pero permite adaptar la magnitud de la curva al ciclo observado.

---

## 5. Flujo del Algoritmo

### 5.1 Entrada y Validación

El sistema recibe pares:

```text
(día de cultivo, talla observada)
```

Ejemplo:

```text
dias   = [60, 90, 120, 150]
tallas = [18, 25, 34, 43]
```

La validación revisa:

- que los días y tallas tengan la misma longitud;
- que los días sean válidos;
- que las tallas sean positivas;
- que exista un mínimo de puntos para ajuste local.

Implementación:

- `validarDatosUsuario` en `src/lib/server/biblioteca/similitud-validation.ts`
- `validarDatosEntrada` en `src/lib/server/biblioteca/modelado-utils.ts`

### 5.2 Ajuste Local

Si existen suficientes puntos, el sistema intenta ajustar una curva logística directamente al ciclo actual mediante Levenberg-Marquardt.

El objetivo es minimizar:

```text
SSE = sum((y_i - f(t_i))^2)
```

El ajuste se acepta si supera un umbral de calidad definido por `R²`.

Implementación:

- `ajustarCiclo` en `src/lib/server/biblioteca/modelado.ts`
- `ejecutarAjuste` en `src/lib/server/biblioteca/modelado-utils.ts`
- `calcularR2` en `src/lib/server/biblioteca/modelado-utils.ts`

### 5.3 Búsqueda de Perfil de Referencia en Biblioteca

Si el ajuste local no es posible o no es confiable, se busca la curva histórica más similar.

Para comparar forma y no magnitud, se normalizan los datos reales y las curvas candidatas al rango `[0, 1]`:

```text
y_norm = (y - min(y)) / (max(y) - min(y))
```

Luego se calcula:

```text
SSE_norm = sum((datos_norm - curva_norm)^2)
```

La curva con menor `SSE_norm` es seleccionada como perfil de referencia.

Implementación:

- `normalizarArray` en `src/lib/server/biblioteca/similitud-calculo.ts`
- `calcularSSENormalizado` en `src/lib/server/biblioteca/similitud-calculo.ts`
- `encontrarCurvaMasSimilar` en `src/lib/server/biblioteca/similitud-calculo.ts`

### 5.4 Escalamiento de la Curva Seleccionada

Una vez seleccionada la curva análoga, se conservan `k` y `x0`, y se recalcula `L`.

Definimos:

```text
a_i = 1 / (1 + exp(-k · (t_i - x0)))
```

Entonces:

```text
f(t_i) = L · a_i
```

Como `k` y `x0` están fijos, el problema se vuelve lineal en `L`. El mínimo cuadrático cerrado es:

```text
L_opt = sum(y_i · a_i) / sum(a_i^2)
```

Después se aplica una restricción biológica:

```text
40 mm <= L <= 110 mm
L >= max(talla observada) · 1.02
```

Esto evita una asíntota menor que datos ya observados, lo que sería biológicamente inconsistente.

Implementación:

- `escalarParametros` en `src/lib/server/biblioteca/similitud-estadisticas.ts`
- `calcularLEscalado` en `src/lib/components/calculo-sigmoides-similares/proyeccion-sigmoidal.ts`

### 5.5 Generación de Proyección

Con parámetros finales, el sistema genera puntos proyectados hasta un horizonte definido o hasta alcanzar una talla objetivo.

Implementación:

- `generarProyeccion` en `src/lib/server/biblioteca/similitud-proyeccion.ts`
- `calcularDiaObjetivo` en `src/lib/server/biblioteca/similitud-proyeccion-logic.ts`

### 5.6 Riesgo e Incertidumbre

La predicción no se representa como una única línea exacta. El sistema calcula una banda de incertidumbre para expresar mínimos y máximos esperados.

Existen dos mecanismos:

#### Bootstrap paramétrico

Cuando existe ajuste local confiable, se remuestrean los datos y se ajustan múltiples curvas. A partir de esas curvas se calculan percentiles:

```text
P2.5  -> límite inferior
P50   -> mediana
P97.5 -> límite superior
```

Implementación:

- `calcularProyeccionBootstrap` en `src/lib/server/biblioteca/modelado-utils.ts`

#### Banda residual para perfiles de referencia

Cuando se usa una curva histórica, el riesgo incluye error residual y riesgo de transferencia desde otro ciclo. Por eso se calcula una banda conservadora:

```text
semiancho(h) = 1.96 · RMSE · sqrt(1 + h/30) · factor_fuente
```

Donde:

| Símbolo         | Significado                                            |
| --------------- | ------------------------------------------------------ |
| `h`             | días desde la última medición real                     |
| `RMSE`          | error promedio observado del ajuste                    |
| `1.96`          | aproximación a intervalo de 95%                        |
| `factor_fuente` | penalización adicional si la forma viene de biblioteca |

El término `sqrt(1 + h/30)` expresa que la predicción pierde representatividad conforme se aleja del último dato observado.

Implementación:

- `calcularIncertidumbreResidual` en `src/lib/server/biblioteca/similitud-incertidumbre.ts`
- integración en `enriquecerResultado` dentro de `src/lib/server/biblioteca/similitud.ts`

### 5.7 Degradación Temporal

El modelo incorpora validación tipo walk-forward para medir cómo se deteriora el error al proyectar hacia adelante.

El procedimiento:

1. Agrupa datos por mes aproximado.
2. Entrena con datos disponibles hasta un mes dado.
3. Predice meses futuros.
4. Calcula RMSE contra datos observados.

Implementación:

- `validarDegradacionTemporal` en `src/lib/server/biblioteca/modelado.ts`
- visualización en `src/lib/components/calculo-sigmoides-similares/IndicadorConfiabilidadTemporal.svelte`

---

## 6. Visualización Profesional

La interfaz no muestra solo una curva central. Presenta:

| Elemento visual      | Significado                                             |
| -------------------- | ------------------------------------------------------- |
| Datos reales         | mediciones observadas                                   |
| Curva histórica      | perfil histórico original sin escalar                   |
| Curva escalada       | perfil histórico adaptado a la escala del ciclo actual  |
| Predicción mediana   | trayectoria central estimada                            |
| Banda esperada 95%   | rango mínimo-máximo probable                            |
| Meta                 | talla objetivo definida por el usuario                  |
| Riesgo de estimación | resumen de amplitud inicial, amplitud final y horizonte |

Implementación:

- `construirSeriesProyeccion` en `src/lib/components/calculo-sigmoides-similares/proyeccionUtils.ts`
- `ProyeccionResultados.svelte` en `src/lib/components/calculo-sigmoides-similares/ProyeccionResultados.svelte`
- `CurvaAnalisisMatematico.svelte` en `src/lib/components/calculo-sigmoides-similares/CurvaAnalisisMatematico.svelte`

---

## 7. Ventajas

1. **Explicabilidad:** cada proyección se puede rastrear hasta datos, parámetros, curva de referencia y método de ajuste.
2. **Uso con pocos datos:** los perfil de referencias permiten proyectar aun cuando no hay suficientes observaciones para un ajuste local robusto.
3. **Base empírica:** la biblioteca histórica incorpora experiencia productiva real.
4. **Separación entre forma y escala:** se evita confundir patrón temporal con magnitud final.
5. **Riesgo visible:** la banda de incertidumbre comunica cuándo la predicción central deja de ser suficientemente representativa.
6. **Consistencia biológica:** los parámetros se restringen a rangos razonables.

---

## 8. Riesgos y Limitaciones

| Riesgo                         | Descripción                                                                        | Mitigación                                            |
| ------------------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Biblioteca poco representativa | si no hay ciclos históricos similares, el perfil de referencia puede inducir sesgo | ampliar biblioteca por centro, temporada y origen     |
| Pocos datos tempranos          | varias curvas pueden explicar los primeros puntos                                  | mostrar banda de riesgo y alertas                     |
| Objetivo cerca de `L`          | el día objetivo se vuelve muy sensible                                             | advertir incertidumbre asintótica                     |
| Cambios ambientales            | temperatura, alimento o eventos sanitarios pueden alterar la trayectoria           | incorporar variables ambientales en futuras versiones |
| Sobreinterpretación            | el usuario puede leer la mediana como certeza                                      | visualizar mínimo, máximo y riesgo temporal           |

---

## 9. Archivos y Funciones Principales

| Área                    | Archivo                                                     | Funciones                                                               |
| ----------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| Orquestación            | `src/lib/server/biblioteca/similitud.ts`                    | `ejecutarProyeccion`, `enriquecerResultado`                             |
| Fachada del modelo      | `src/lib/server/calculo-sigmoides-similares/index.ts`       | punto de entrada backend para este método                                |
| Ajuste de curvas        | `src/lib/server/biblioteca/modelado.ts`                     | `ajustarCiclo`, `validarDegradacionTemporal`                            |
| Utilidades matemáticas  | `src/lib/server/biblioteca/modelado-utils.ts`               | `crearModeloLogistico`, `ejecutarAjuste`, `calcularProyeccionBootstrap` |
| Similitud               | `src/lib/server/biblioteca/similitud-calculo.ts`            | `calcularSSENormalizado`, `encontrarCurvaMasSimilar`                    |
| Escalamiento            | `src/lib/server/biblioteca/similitud-estadisticas.ts`       | `escalarParametros`, `calcularR2`                                       |
| Proyección              | `src/lib/server/biblioteca/similitud-proyeccion.ts`         | `generarProyeccion`                                                     |
| Día objetivo            | `src/lib/server/biblioteca/similitud-proyeccion-logic.ts`   | `calcularDiaObjetivo`, `calcularDiaFinal`                               |
| Incertidumbre           | `src/lib/server/biblioteca/similitud-incertidumbre.ts`      | `calcularIncertidumbreResidual`                                         |
| Series de gráfico       | `src/lib/components/calculo-sigmoides-similares/proyeccionUtils.ts`          | `construirSeriesProyeccion`                                             |
| Evaluación frontend     | `src/lib/components/calculo-sigmoides-similares/proyeccion-sigmoidal.ts`     | `evaluarSigmoidal`, `calcularLEscalado`                                 |
| Visualización           | `src/lib/components/calculo-sigmoides-similares/ProyeccionResultados.svelte` | gráfico, banda, leyenda y riesgo                                        |
| Ruta de pantalla        | `src/routes/(app)/proyectar-sigmoides`                      | página canónica del modelo                                               |
| Validación reproducible | `scripts/validar-proyeccion.ts`                             | escenario sintético completo                                            |

---

## 10. Validación Técnica Actual

El comportamiento esperado se valida con datos sintéticos mediante:

```bash
npx tsx scripts/validar-proyeccion.ts
```

El script verifica:

- recuperación correcta de `L` cuando la forma es conocida;
- cálculo del día objetivo;
- selección de perfil de referencia correcto;
- estabilidad numérica de la función sigmoidal;
- construcción de series del gráfico;
- ensanchamiento de la banda de riesgo con el horizonte temporal.

Pruebas focalizadas:

```bash
npm run test:unit -- --run \
  src/lib/server/biblioteca/similitud-math.spec.ts \
  src/lib/server/biblioteca/similitud-proyeccion.spec.ts \
  src/lib/server/biblioteca/modelado-utils.spec.ts \
  src/lib/server/biblioteca/similitud-incertidumbre.spec.ts
```

---

## 11. Resumen Simple del Algoritmo

1. El usuario entrega mediciones de día y talla.
2. El sistema valida que los datos sean utilizables.
3. Si hay datos suficientes, intenta ajustar una curva propia del ciclo.
4. Si no hay datos suficientes o el ajuste no es confiable, busca una curva histórica similar.
5. La comparación con la biblioteca se hace por forma, no por talla absoluta.
6. La curva histórica elegida conserva su forma, pero ajusta su talla máxima `L` a los datos actuales.
7. Con la curva final se proyectan tallas futuras.
8. Si hay talla objetivo, se calcula el día estimado para alcanzarla.
9. Se calcula una banda de mínimo y máximo esperado.
10. El gráfico muestra datos reales, referencia histórica, curva ajustada, predicción, meta y riesgo.
