
---

# MEMORÁNDUM TÉCNICO DE ARQUITECTURA: DEFINICIÓN DE STACK PARA ETAPA 2

**ID DOCUMENTO:** MTA-2025-01-INIT
**PROYECTO:** Plataforma de Gestión y Modelamiento Productivo *Mytilus chilensis* (FONDEF/IDEA)
**FASE:** Inicio de Ejecución - Etapa 2 (Desarrollo y Consolidación)
**ASUNTO:** Justificación Técnica de Framework y Estrategia de Despliegue

---

## 1. RESUMEN EJECUTIVO

Al iniciar la **Etapa 2** del proyecto, tras la finalización exitosa del prototipo TRL 4 (basado en Node.js/EJS), el equipo técnico ha realizado una evaluación exhaustiva de las tecnologías disponibles para el desarrollo de la versión comercial escalable (TRL 5+).

Si bien la formulación original sugería la exploración de frameworks como **Astro** o **Vue.js**, el análisis de requerimientos funcionales —específicamente la necesidad de cálculos matemáticos en tiempo real, gestión de estados complejos en los tableros de control y la interoperabilidad de datos— ha derivado en la decisión estratégica de unificar el desarrollo bajo el ecosistema **Next.js (React)**.

Este documento detalla la justificación técnica, demostrando que esta decisión reduce la deuda técnica futura, acelera el *Time-to-Market* y facilita la integración de pipelines de datos externos (ETL en Python).

---

## 2. ANÁLISIS COMPARATIVO Y FUNDAMENTACIÓN ("Todo es JavaScript")

Para desmitificar la elección del framework, partimos de una premisa de ingeniería fundamental: **En el navegador del cliente (Client-side), todo renderiza finalmente a JavaScript, HTML y CSS.** La elección, por tanto, no se basa en el lenguaje final, sino en la eficiencia de la abstracción, el manejo del DOM (Document Object Model) y la capacidad de gestión de estado.

### 2.1 Evaluación de Candidatos Originales vs. Selección Final

| Criterio | Astro (Propuesta Original) | Vue.js (Alternativa) | Next.js (Selección Final) |
| --- | --- | --- | --- |
| **Enfoque Principal** | Contenido estático (Content-first). Excelente para webs informativas. | SPA (Single Page Applications). Muy versátil. | Aplicaciones Híbridas (SSR/CSR). Estándar industrial para SaaS. |
| **Manejo de Estado** | Limitado ("Islas de interactividad"). Complejo para dashboards interconectados. | Vuex/Pinia. Robusto, pero fragmentado en versiones (Vue 2 vs 3). | React Context / Zustand. Nativo y altamente testado a escala. |
| **Renderizado** | SSG (Static Site Generation) por defecto. | CSR (Client Side Rendering) predominante. | **Server Components (RSC):** Renderiza en servidor, envía HTML listo. Crucial para dispositivos móviles de baja gama en centros de cultivo. |
| **Ecosistema UI** | En crecimiento. | Maduro. | **Dominante.** Acceso a librerías de componentes empresariales (ej. Shadcn/UI) que aceleran el desarrollo UI en un 40%. |

**Conclusión del Análisis:**
Aunque **Astro** es superior en velocidad para sitios de contenido, la plataforma *Mytilus* es, en esencia, una aplicación transaccional de gestión de datos (CRUDs complejos, gráficos interactivos, formularios dinámicos). Forzar esta lógica en Astro requeriría "hackear" el framework. **Next.js** ofrece la arquitectura nativa para aplicaciones de datos intensivos.

---

## 3. MEJORAS ESTRATÉGICAS PARA EL DESARROLLO

La adopción de Next.js para esta Fase 2 introduce ventajas competitivas inmediatas para el plan de trabajo:

### 3.1 Arquitectura de "Borde" y Rendimiento (Edge Computing)

Dado que los usuarios operarán en zonas con conectividad intermitente (Chiloé/Los Lagos), Next.js permite mover la lógica pesada (cálculos de biomasa y proyecciones sigmoidales) del dispositivo del usuario al servidor.

* **Resultado:** El operario ve el resultado instantáneamente sin que su tablet se congele procesando regresiones matemáticas.

### 3.2 Tipado Estricto de Extremo a Extremo (TypeScript)

A diferencia del prototipo en JS puro, esta fase implementará **TypeScript** estricto. Al definir interfaces claras para los modelos de datos (`IMedicion`, `ICentro`, `ICiclo`), garantizamos que los datos que viajan desde la base de datos hasta la interfaz gráfica sean consistentes.

* **Beneficio:** Reducción estimada del 60% en bugs de tiempo de ejecución ("undefined is not a function").

### 3.3 Facilidad de Despliegue y CI/CD (Vercel)

La infraestructura se alojará en **Vercel**, la plataforma nativa de Next.js. Esto elimina la necesidad de configurar servidores Linux manuales (DevOps tradicional).

* **Pipeline Automatizado:** Cada `git push` a la rama `main` generará automáticamente una nueva versión de producción.
* **Rollbacks Instantáneos:** Si una actualización falla, podemos volver a la versión anterior en 1 segundo, garantizando continuidad operativa para las empresas usuarias.

---

## 4. ESTRATEGIA HÍBRIDA DE DATOS: INTEGRACIÓN CON PYTHON

Reconocemos que, aunque JavaScript/TypeScript es excelente para la web, **Python** es el estándar para la manipulación masiva de datos y ciencia de datos.

Para la carga histórica de datos (ETL - Extract, Transform, Load) requerida en esta etapa, no sobrecargaremos el servidor web. Se implementará una arquitectura de servicios complementarios:

1. **Ingesta de Datos (ETL):** Se desarrollarán scripts en **Python (Pandas/Numpy)** para procesar archivos Excel/CSV históricos masivos de los centros de cultivo.
2. **Limpieza y Normalización:** Python se encargará de detectar anomalías, corregir fechas y estandarizar unidades antes de tocar la base de datos.
3. **Inyección:** Los scripts limpios inyectarán los datos directamente a la base de datos PostgreSQL o vía API segura al backend de Next.js.

> **Nota Técnica:** Esta separación de responsabilidades permite que el equipo de desarrollo web se enfoque en la interfaz, mientras los procesos de carga de datos pesados corren en entornos aislados (Scripts locales o Cloud Functions), sin afectar el rendimiento de la plataforma.

---

## 5. CONCLUSIÓN Y VIABILIDAD

El cambio de stack tecnológico no representa un riesgo, sino una **mitigación de riesgo**. Al iniciar esta Etapa 2 con **Next.js**, estamos eligiendo la herramienta que ofrece:

1. **Mayor longevidad:** Respaldada por Vercel y una comunidad global masiva.
2. **Mejor rendimiento en terreno:** Gracias al Server-Side Rendering.
3. **Velocidad de desarrollo:** Aprovechando componentes pre-construidos de alta calidad.

Esta base técnica sólida asegura que el cumplimiento de los hitos técnicos y comerciales del proyecto no se vea limitado por las herramientas, permitiéndonos enfocar los recursos en lo que realmente importa: **la lógica de negocio y el valor para el mitilicultor.**

---

**Víctor Vidal**
Jefe de Proyecto y Arquitecto de Sistemas
Proyecto ID25I10XXX