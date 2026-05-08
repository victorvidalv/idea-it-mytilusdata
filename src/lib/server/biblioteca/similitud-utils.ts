/**
 * Utilidades para el servicio de similitud y proyección.
 *
 * MÓDULO REEXPORTADO
 *
 * Este archivo re-exporta todas las funciones desde los módulos especializados:
 * - similitud-validation.ts: funciones de validación
 * - similitud-calculo.ts: funciones de cálculo SSE y comparación
 * - similitud-proyeccion.ts: funciones de proyección
 * - similitud-estadisticas.ts: funciones de estadísticas (R², escalado)
 * - similitud-error.ts: funciones de manejo de errores
 *
 * La lógica fue separada para mejorar mantenibilidad y reducir complejidad.
 */

// Re-exportar desde módulo de validación
export {
	esDiaValido,
	esTallaValida,
	verificarOrdenDias,
	validarDatosUsuario
} from './similitud-validation';

// Re-exportar desde módulo de cálculo
export {
	normalizarArray,
	crearModeloLogisticoNormalizado,
	calcularSSE,
	calcularSSENormalizado,
	encontrarCurvaMasSimilar
} from './similitud-calculo';

// Re-exportar desde módulo de proyección
export {
	calcularDiaObjetivo,
	generarProyeccion
} from './similitud-proyeccion';

// Re-exportar desde módulo de estadísticas
export {
	calcularR2,
	escalarParametros
} from './similitud-estadisticas';

// Re-exportar desde módulo de errores
export {
	crearResultadoError
} from './similitud-error';
