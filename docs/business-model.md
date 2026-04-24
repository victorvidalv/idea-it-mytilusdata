# Modelo de Negocio - MytilusData

Este documento describe el modelo de negocio, contexto de mercado y estrategia del proyecto MytilusData (IdeaIT 2025).

## Resumen Ejecutivo

**MytilusData Evolution** es una plataforma digital avanzada para optimizar la toma de decisiones en el cultivo de _Mytilus chilensis_ (chorito). Mediante el uso de modelos predictivos de crecimiento y análisis de datos, la plataforma permite estimar variables críticas como talla, biomasa y densidad, integrando datos ambientales y operativos para mejorar la eficiencia productiva del sector mitilicultor en la Región de Los Lagos.

## Problema y Oportunidad

### Mercado y Zonas de Desarrollo

El sector mitilicultor chileno es el segundo productor mundial de mejillones, concentrando el 99% de su producción en la Región de Los Lagos. Existe una brecha tecnológica significativa entre grandes empresas y pequeños/medianos productores (PyMEs), quienes carecen de herramientas digitales para monitorear y predecir su producción con precisión.

### Desafíos Críticos Detectados

| Desafío                    | Descripción                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| **Alta Incertidumbre**     | Falta de visibilidad sobre el crecimiento real del recurso en tiempo real                         |
| **Brecha Digital**         | Dependencia de registros manuales y falta de integración de datos oceanográficos                  |
| **Complejidad Biológica**  | Variabilidad del crecimiento influenciada por factores ambientales no capturados sistemáticamente |
| **Optimización Logística** | Dificultad para planificar cosechas y siembras debido a proyecciones de biomasa poco confiables   |

### Análisis de Sofisticación de la Industria

La industria se encuentra en una etapa de transición hacia la "Acuicultura 4.0". El proyecto propone sofisticar la gestión mediante la transformación de datos crudos en inteligencia accionable, permitiendo a los productores pasar de una gestión reactiva a una proactiva.

## Solución Propuesta

La solución consiste en una plataforma SaaS (Software as a Service) modular que centraliza la gestión de datos productivos y ambientales. Su núcleo es un simulador avanzado que proyecta el crecimiento del recurso basándose en modelos bio-matemáticos ajustados a las condiciones locales.

### Componentes Técnicos Clave

| Componente                            | Descripción                                                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Módulo de Registro de Datos**       | Captura estandarizada de mediciones de muestreo (talla, peso, densidad) y variables ambientales             |
| **Motor de Modelamiento Predictivo**  | Estimación de crecimiento y biomasa con fundamentos biológicos, datos históricos y cuantificación de riesgo |
| **Dashboard de Análisis Estratégico** | Visualización interactiva de tendencias, comparativas entre centros y simulaciones de escenarios de cosecha |
| **API RESTful**                       | Interfaz para la integración con sistemas externos y exportación de datos para investigación académica      |

### TRL Objetivo

El proyecto apunta a alcanzar un **TRL 6** (Modelo de sistema o subsistema o demostración de prototipo en un entorno relevante).

## Modelo de Negocio (Business Model Canvas)

### Segmento de Clientes

- **Centros de engorda de mejillones**: SME/PYMES y grandes empresas en la Región de Los Lagos
- **Empresas exportadoras**: Integradas verticalmente
- **Investigadores y entes públicos**: Interesados en análisis globales y fiscalización

### Propuesta de Valor

| Propuesta                      | Descripción                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------- |
| **Optimización de la cosecha** | Estimación precisa del momento óptimo para maximizar rendimiento y calidad      |
| **Precisión predictiva**       | Estimaciones trazables con precisión objetivo >85% en talla, biomasa y densidad |
| **Especialización local**      | Calibrado específicamente para _Mytilus chilensis_ en condiciones chilenas      |

### Canales

- **Plataforma Web y Móvil**: Acceso directo para ingreso y visualización de datos
- **AmiChile**: Gremio mandante para la difusión y masificación
- **Talleres in situ**: Capacitación técnica directa a operarios

### Relación con Clientes

- **Modelo Freemium**: Funcionalidades básicas gratuitas para PYMES para democratizar la tecnología
- **Soporte Técnico**: Asistencia a través de INTEMIT
- **Colaboración industria-academia**: Validación continua con datos reales de socios

### Fuentes de Ingresos

| Fuente                           | Descripción                                                    |
| -------------------------------- | -------------------------------------------------------------- |
| **Subsidio ANID**                | Financiamiento principal para el desarrollo de I+D             |
| **Aportes de Socios**            | Cofinanciamiento de entidades asociadas (Apiao, Sudmaris)      |
| **Venta de servicios complejos** | Potencial comercialización post-proyecto de análisis avanzados |

### Actividades Clave

- **Desarrollo de Software**: Ingeniería de plataforma (SvelteKit, TypeScript, PostgreSQL)
- **Modelamiento Predictivo**: Ajuste dinámico de curvas de crecimiento
- **Validación Operativa (TRL 7)**: Pruebas en entornos reales de cultivo

### Recursos Clave

| Recurso              | Descripción                                                          |
| -------------------- | -------------------------------------------------------------------- |
| **Capital Humano**   | Equipo multidisciplinario (Data Scientists, Biólogos, Ingenieros QA) |
| **Datos Históricos** | Base de datos de INTEMIT y PSMB desde 2016                           |
| **Infraestructura**  | Centros piloto para validación a gran escala                         |

### Socios Clave

| Socio                       | Rol                                               |
| --------------------------- | ------------------------------------------------- |
| **Universidad Santo Tomás** | Institución beneficiaria y ejecutora técnica      |
| **AmiChile**                | Gremio mandante y articulador sectorial           |
| **INTEMIT**                 | Brazo tecnológico para la prestación del servicio |
| **Apiao y Sudmaris**        | Socios industriales para validación               |

### Estructura de Costos

- **Recursos Humanos**: Personal de investigación y desarrollo (mayor peso presupuestario)
- **Operación en Terreno**: Subcontratos de muestreo mensual en 8 centros
- **Equipamiento**: Balanzas digitales, freezers y hardware de modelamiento

## Objetivos del Proyecto

### Objetivo General

Desarrollar y validar un modelo de transferencia tecnológica digital para la optimización de la productividad mitilicultora, integrando herramientas predictivas avanzadas en una plataforma escalable.

### Objetivos Específicos

1. **Línea base robusta**: Levantamiento de datos históricos y muestreos estacionales en 8 centros de cultivo
2. **Modelos matemáticos**: Desarrollo y validación de modelos personalizados para la predicción de crecimiento (talla) y biomasa
3. **Plataforma digital**: Implementación de MytilusData Evolution con módulos de registro, análisis y simulación
4. **Transferencia y capacitación**: Capacitación a centros de cultivo, midiendo impacto en competitividad y toma de decisiones

## Equipo de Trabajo

| Rol                        | Nombre              | Responsabilidad                                           |
| -------------------------- | ------------------- | --------------------------------------------------------- |
| **Directora del Proyecto** | Florencia Navarrete | Gestión técnica y administrativa                          |
| **Directora Alterna**      | Camila Barría       | Coordinación de muestreos y análisis de laboratorio       |
| **Investigador**           | Víctor Vidal        | Implementación Modelo Matemático y Desarrollo de Software |
| **Investigadora**          | Katherine Canales   | Gestión de Calidad (QA) y Ciberseguridad                  |
| **Investigador**           | Hugo Robotham       | Validación estadística de modelos matemáticos             |

## Desafíos Estratégicos y Tecnológicos

| Desafío                    | Descripción                                                          | Mitigación                                                                      |
| -------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Data Sparsity**          | Recolección de datos en terreno puede ser irregular                  | Implementar mecanismos de imputación de datos y validación de outliers          |
| **Alfabetización Digital** | Muchos productores tienen baja alfabetización digital                | Interfaz extremadamente intuitiva, móvil-primero, con soporte para offline-sync |
| **Escalabilidad**          | Motor de simulación debe procesar miles de proyecciones concurrentes | Infraestructura basada en procesos asíncronos                                   |
| **Marco Normativo**        | Alineación con Ley General de Pesca y Acuicultura                    | Cumplimiento estricto con normativas sanitarias (Decretos 320 y 977)            |

## Entidades Asociadas y Transferencia

| Entidad                               | Rol en el Proyecto                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| **Sindicato de Pescadores de Huito**  | Representante de los pequeños productores, validación de usabilidad                 |
| **Geomar S.A.**                       | Empresa procesadora que aporta la visión de la cadena de valor y demanda de mercado |
| **St. Andrews Smoky Delicacies S.A.** | Validación en entornos industriales de alta escala                                  |

## Marco Normativo de Referencia

| Área                    | Normativa                                                                       |
| ----------------------- | ------------------------------------------------------------------------------- |
| **Ciberseguridad**      | NCh-ISO IEC 27001:2020 para la gestión de seguridad de la información           |
| **Privacidad de Datos** | Ley 20.285 sobre transparencia y Ley 19.628 sobre protección de la vida privada |
| **Acuicultura**         | Ley 18.892 y sus reglamentos ambientales (RAMA) y sanitarios (RESA)             |

## Estado del Arte y Propiedad Intelectual

A nivel nacional, no existen plataformas integradas que combinen el monitoreo operacional con modelos predictivos biológicos específicos para la mitilicultura chilena. Internacionalmente, existen soluciones para salmónidos, pero su aplicación en mitílidos es limitada por las diferencias en la dinámica de alimentación (filtradores) y crecimiento.

### Estrategia de Propiedad Intelectual

Se opta por un modelo de **"Cerrado para la Interfaz, Abierto para la Ciencia"** (Public Domain / MIT para las librerías de modelamiento), buscando la masificación del conocimiento biológico mientras se protege la ventaja competitiva comercial de la plataforma MytilusData.

---

## Referencias

- [Visión General del Proyecto](./overview.md)
- [Arquitectura del Sistema](./architecture.md)
- [Fundamentos del Modelo Predictivo](./fundamentos-modelo-predictivo.md)
