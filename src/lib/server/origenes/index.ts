/**
 * Módulo de orígenes de datos.
 * Punto de entrada público que re-exporta todos los submódulos.
 */

// Tipos
export type {
	OrigenDatos,
	OrigenFormData,
	MutationResult,
	OrigenesPageData
} from './types';

// Autorización
export { canManageOrigenes } from './authorization';

// Consultas
export {
	getOrigenes,
	getOrigenesWithSeed,
	getOrigenById
} from './queries';

// Mutaciones
export {
	createOrigen,
	updateOrigen,
	deleteOrigen
} from './mutations';

// Validación
export {
	parseCreateForm,
	parseUpdateForm,
	parseDeleteForm
} from './validation';

// Tipos de validación
export type {
	ParseCreateResult,
	ParseUpdateResult,
	ParseDeleteResult
} from './validation';