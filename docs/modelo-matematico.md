# Modelo Matemático de Proyección de Crecimiento Valvar

## Método: Análogos Dinámicos

Este sistema utiliza el método de **análogos dinámicos** para proyectar el crecimiento valvar. En lugar de ajustar un modelo puramente teórico, el sistema compara los datos del usuario con una **biblioteca de curvas de crecimiento históricas** — ciclos productivos reales previamente registrados. Se identifica la curva con patrón temporal más similar y se adapta su magnitud a las condiciones actuales.

### Beneficios

| Beneficio | Descripción |
|-----------|-------------|
| **Precisión temprana** | Con solo 3-5 mediciones ya puede identificar un análogo y generar una proyección |
| **Base empírica** | Se fundamenta en datos reales de producción, no en suposiciones teóricas |
| **Adaptabilidad** | Mantiene la forma temporal del análogo (k, x₀) pero ajusta la escala (L) a las condiciones particulares del usuario |
| **Robustez** | Incluso con datos dispersos, la forma general proviene de un ciclo exitoso completo |

---

## 1. Modelo Logístico Sigmoidal

El crecimiento valvar (talla en mm a lo largo del tiempo) se modela con la **función logística sigmoidal**:

$$
f(t) = \frac{L}{1 + e^{-k \cdot (t - x_0)}}
$$

### Parámetros

| Símbolo | Nombre | Unidad | Significado biológico |
|---------|--------|--------|----------------------|
| **L** | Asíntota superior | mm | Talla máxima teórica que el organismo puede alcanzar |
| **k** | Tasa de crecimiento | 1/día | Velocidad con la que ocurre el crecimiento |
| **x₀** | Punto de inflexión | día | Momento de máxima velocidad de crecimiento |

### Propiedades clave

- **Monotonía**: f(t) es siempre creciente (f'(t) > 0 para todo t)
- **Acotamiento**: 0 < f(t) < L para todo t
- **Simetría**: La curva es simétrica respecto al punto (x₀, L/2)
- **Punto de inflexión**: En t = x₀, la talla es exactamente L/2

### Derivada (velocidad de crecimiento)

$$
f'(t) = \frac{L \cdot k \cdot e^{-k(t-x_0)}}{(1 + e^{-k(t-x_0)})^2}
$$

La **velocidad máxima de crecimiento** ocurre en t = x₀:

$$
f'(x_0) = \frac{L \cdot k}{4}
$$

Por ejemplo, con L = 80 mm y k = 0.02, la velocidad máxima es 0.4 mm/día.

---

## 2. Ajuste del Modelo

### 2.1 Ajuste Local (Levenberg-Marquardt)

Cuando hay suficientes datos (≥ 5 puntos), se usa el algoritmo **Levenberg-Marquardt** para minimizar:

$$
\text{SSE} = \sum_{i=1}^{n} (y_i - f(t_i))^2
$$

donde (tᵢ, yᵢ) son los pares (día, talla) medidos. El algoritmo itera ajustando L, k, x₀ simultáneamente con restricciones biológicas:

| Parámetro | Mínimo | Máximo |
|-----------|--------|--------|
| L | 40 mm | 110 mm |
| k | 0.005 | 0.06 |
| x₀ | 0 días | 500 días |

### 2.2 Ajuste por Biblioteca (Fallback)

Cuando no hay suficientes datos o el ajuste local falla (R² < 0.85), se busca la curva más **similar en forma** en la biblioteca de ciclos históricos.

#### Comparación por SSE normalizado

Para comparar **forma** sin importar la escala (magnitud de tallas diferentes), ambas curvas se normalizan a [0, 1]:

$$
\hat{y}_i = \frac{y_i - \min(y)}{\max(y) - \min(y)}, \qquad
\hat{f}(t_i) = \frac{f(t_i) - \min(f)}{\max(f) - \min(f)}
$$

Luego se calcula el SSE normalizado:

$$
\text{SSE}_{norm} = \sum_{i=1}^{n} (\hat{y}_i - \hat{f}(t_i))^2
$$

Se selecciona la curva de biblioteca con menor SSE normalizado.

#### Escalamiento de L

Una vez encontrada la curva más similar, se mantiene su **forma** (k, x₀) y se recalcula **L** para ajustarse a los datos del usuario. El L óptimo se obtiene derivando el SSE respecto a L e igualando a cero:

$$
\text{SSE}(L) = \sum_{i=1}^{n} \left(y_i - \frac{L}{g_i}\right)^2
$$

donde gᵢ = 1 + exp(-k·(tᵢ - x₀)). Derivando:

$$
\frac{d\,\text{SSE}}{dL} = -2 \sum_{i=1}^{n} \frac{1}{g_i} \left(y_i - \frac{L}{g_i}\right) = 0
$$

Resolviendo para L:

$$
L_{\text{opt}} = \frac{\displaystyle\sum_{i=1}^{n} \frac{y_i}{g_i}}{\displaystyle\sum_{i=1}^{n} \frac{1}{g_i^2}}
$$

Esta solución analítica es exacta y no requiere iteración.

---

## 3. Métricas de Calidad

### 3.1 Coeficiente de determinación (R²)

$$
R^2 = 1 - \frac{SS_{res}}{SS_{tot}} = 1 - \frac{\sum(y_i - f(t_i))^2}{\sum(y_i - \bar{y})^2}
$$

| R² | Interpretación |
|----|---------------|
| ≥ 0.98 | Excelente — el modelo explica casi toda la variabilidad |
| 0.95–0.98 | Muy bueno |
| 0.90–0.95 | Bueno |
| 0.85–0.90 | Aceptable — umbral mínimo del sistema |
| < 0.85 | Bajo — el ajuste se rechaza y se busca en biblioteca |

### 3.2 SSE (Sum of Squared Errors)

$$
\text{SSE} = \sum_{i=1}^{n} (y_i - f(t_i))^2
$$

El SSE mide el error total. Valores menores indican mejor ajuste. Su desventaja es que depende de la escala (medido en mm²), por lo que no es comparable entre ciclos con diferente rango de tallas.

---

## 4. Inversa de la Logística (Día Objetivo)

Para encontrar el día en que se alcanza una talla objetivo `y_obj`:

$$
y_{\text{obj}} = \frac{L}{1 + e^{-k(t-x_0)}}
$$

Despejando t:

$$
1 + e^{-k(t-x_0)} = \frac{L}{y_{\text{obj}}}
$$

$$
e^{-k(t-x_0)} = \frac{L}{y_{\text{obj}}} - 1
$$

$$
t = x_0 - \frac{1}{k} \ln\left(\frac{L}{y_{\text{obj}}} - 1\right)
$$

**Condiciones de existencia:** La solución existe solo cuando 0 < y_obj < L (no se puede alcanzar la asíntota).

---

## 5. Visualización

El gráfico muestra hasta 4 series:

| Serie | Color | Descripción |
|-------|-------|-------------|
| **Meta** | Naranja dorado | Línea horizontal a la talla objetivo |
| **Referencia** | Gris azulado | Curva original de biblioteca (sin escalar) |
| **Ref. escalada** | Naranja | Misma forma que referencia pero con L ajustado a los datos |
| **Proyectado** | Verde azulado | Curva ajustada (local o escalada) usada para la proyección |
| **Real** | Azul | Puntos de datos reales del usuario |

La **curva de referencia** y la **curva escalada** permiten al usuario comparar visualmente la forma de la curva histórica vs. la adaptación a sus datos actuales.

---

## 6. Importancia Práctica

Este sistema permite a los acuicultores:

1. **Proyectar cosecha**: Estimar cuándo los moluscos alcanzarán la talla comercial.
2. **Comparar ciclos**: Identificar si el crecimiento actual sigue un patrón similar a ciclos históricos.
3. **Tomar decisiones tempranas**: Con pocos datos (3-5 puntos), el sistema puede encontrar una curva similar en la biblioteca y proyectar el futuro.
4. **Optimizar timing**: El punto de inflexión (x₀) indica cuándo el crecimiento es máximo, útil para decisiones de manejo.

---

## 7. Indicadores de Confiabilidad

El sistema evalúa automáticamente la calidad de la proyección y muestra alertas cuando detecta factores de riesgo.

### 7.1 Tamaño de muestra

| n (puntos) | Clasificación | Justificación |
|-----------|---------------|---------------|
| < 5 | **Insuficiente** | El modelo tiene 3 parámetros (L, k, x₀). Con < 5 puntos, el sistema está subdeterminado |
| 5–9 | Limitada | Puede ajustar pero con alta varianza en L |
| ≥ 10 | Robusta | Suficientes grados de libertad (n - 3 ≥ 7) |

### 7.2 Coeficiente de Variación (CV)

$$
CV = \frac{\sigma}{\bar{y}} = \frac{\sqrt{\frac{1}{n}\sum(y_i - \bar{y})^2}}{\bar{y}}
$$

Un CV > 40% indica alta dispersión. Esto puede deberse a:
- Mediciones de diferentes individuos
- Condiciones ambientales heterogéneas
- Errores de medición

### 7.3 Proximidad a la asíntota

Cuando la talla objetivo es > 95% de L, el cálculo del día se vuelve muy sensible:

$$
\frac{\partial t}{\partial y}\bigg|_{y \to L} = -\frac{1}{k \cdot y \cdot (L/y - 1)} \to \infty
$$

La derivada parcial diverge, lo que significa que pequeños errores en L producen grandes cambios en el día estimado.

### 7.4 Resumen de alertas

| Condición | Tipo | Efecto |
|-----------|------|--------|
| n < 5 | ⚠️ Warning | Parámetros inestables |
| n < 10 | ℹ️ Info | Varianza alta |
| Ajuste por biblioteca | ⚠️ Warning | Forma (k, x₀) de otro ciclo |
| R² < 0.90 | ⚠️ Warning | Datos no sigmoidal |
| R² < 0.95 | ℹ️ Info | Ajuste mejorable |
| CV > 40% | ⚠️ Warning | Datos muy dispersos |
| y_obj / L > 0.95 | ⚠️ Warning | Zona asintótica, día incierto |
| max(y) ≈ L | ⚠️ Warning | Modelo podría subestimar |
