/**
 * Módulo de tipos de medición.
 * Punto de entrada público que re-exporta todos los submódulos.
 */

// Tipos
export type {
	TipoRegistro,
	TipoRegistroInsert,
	TipoMedicionFormData,
	MutationResult
} from './types';

// Constantes
export { TIPOS_MEDICION_SEED } from './types';

// Autorización
export { canManageTiposMedicion, canViewTiposMedicion } from './authorization';

// Consultas
export { getTiposRegistro, getTipoRegistroById, ensureTiposRegistroSeeded } from './queries';

// Mutaciones
export {
	normalizeCodigo,
	createTipoMedicion,
	updateTipoMedicion,
	deleteTipoMedicion
} from './mutations';