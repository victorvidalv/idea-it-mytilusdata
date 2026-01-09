
# Contexto de Proyecto: Plataforma Digital para Mitilicultura (IdeaIt 2025)

## 1. Descripción General

El proyecto consiste en el desarrollo de una plataforma online innovadora diseñada para transformar la gestión de cultivos de **Mytilus chilensis** (mejillón chileno). La solución aborda la falta de sistemas para identificar el momento óptimo de cosecha y la incertidumbre en el control del crecimiento debida a factores ambientales y al cambio climático.

La plataforma integra captura de datos estandarizada, modelado predictivo avanzado (curvas sigmoidales) y análisis interactivo para empoderar a los productores, especialmente PYMES, en la toma de decisiones estratégicas.

## 2. Objetivos del Proyecto

* 
**Estandarización:** Crear un protocolo de monitoreo y análisis de datos históricos de flujos productivos, garantizando uniformidad en los registros.


* 
**Modelado Predictivo:** Desarrollar un modelo capaz de estimar variables críticas (talla, biomasa y densidad) con una precisión mínima del 85% ().


* 
**Plataforma Interactiva:** Implementar una herramienta digital para visualizar tendencias, realizar análisis comparativos y simular escenarios.


* 
**Transferencia:** Capacitar a centros de cultivo piloto para asegurar la adopción tecnológica.



## 3. Arquitectura Técnica y Stack Tecnológico

Para garantizar un nivel de madurez **TRL 7** (validación en entorno real), se ha definido un stack moderno y eficiente que prioriza la seguridad y la integridad de los datos:

| Componente | Tecnología Seleccionada | Justificación |
| --- | --- | --- |
| **Framework** | **SvelteKit** | Manejo eficiente de estado reactivo y Form Actions para validación nativa en servidor. |
| **Base de Datos** | **PostgreSQL** | Uso de PostGIS para datos geográficos y Row Level Security (RLS) para aislamiento de datos. |
| **Autenticación** | **Resend (Magic Links)** | Acceso passwordless para reducir fricción operativa en usuarios PYME. |
| **ORM** | **Drizzle / Prisma** | Tipado estricto y eficiencia en consultas a la base de datos 3NF. |
| **Modelado AI** | **Python (Microservicio)** | Implementación de modelos sigmoidales y Machine Learning de dominio público.

 |

## 4. Reglas de Negocio y Normalización (3NF)

El sistema opera bajo principios de arquitectura de datos rigurosos para asegurar la calidad de las predicciones:

* **Aislamiento de Datos (Multi-tenancy):** Cada registro de `lugares`, `ciclos` y `mediciones` está vinculado a un `usuario_id`. La API debe filtrar automáticamente para que cada usuario acceda únicamente a su información.
* **Unidades Canónicas:** Para evitar errores de escala que invaliden el modelo (), el **ETL** debe normalizar todas las entradas a unidades base antes de la persistencia:
* 
**Talla:** Siempre en milímetros (mm).


* 
**Biomasa:** Siempre en gramos (g).


* 
**Densidad:** Individuos por metro (ind/m).




* **Jerarquía de Datos:** `Usuario`  `Lugar` (Centro)  `Ciclo`  `Medición`.
* Las mediciones ambientales (SST, Fitoplancton) se anclan al `Lugar`.


* Las mediciones biológicas (Talla, Biomasa) se anclan al `Ciclo`.





## 5. Indicadores de Éxito (KPIs)

El agente de IA debe priorizar el cumplimiento de estas métricas técnicas:

* 
**Precisión del Modelo:**  ().


* 
**Error Estándar:** .


* 
**Tiempo de Respuesta:**  en la plataforma.


* 
**Disponibilidad:** Sistema escalable para gestionar  centros piloto simultáneamente.