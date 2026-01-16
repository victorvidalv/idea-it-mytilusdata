# Calculo de sigmoides similares

Modulo frontend del modelo "sigmoidal restringido con perfiles historicos de referencia".

Este directorio agrupa los componentes, utilidades de grafico, validaciones de formulario y
explicaciones matematicas propias de esta estrategia de prediccion. La intencion es mantener
aislada esta implementacion para poder sumar otros modelos de proyeccion sin mezclar
controles, copys, calculos visuales ni decisiones de UI.

Puntos de entrada principales:

- `ProyeccionPanel.svelte`: orquesta formulario, ejecucion y resultados.
- `ProyeccionPanelActions.ts`: llama al endpoint `/api/proyectar-sigmoides`.
- `proyeccionUtils.ts`: construye las series del grafico y bandas de incertidumbre.
- `proyeccion-sigmoidal.ts`: evaluacion frontend de curvas sigmoidales para referencia visual.
- `CurvaAnalisisMatematico.svelte`: documentacion visible del metodo en la UI.
