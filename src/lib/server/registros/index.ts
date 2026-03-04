/**
 * Módulo de registros de mediciones.
 * Punto de entrada público que re-exporta todos los submódulos.
 */

// Tipos
export type {
	RegistroConPermisos,
	RegistroFormData,
	MedicionUpdateData,
	Centro,
	Ciclo,
	TipoRegistro,
	OrigenDatos
} from './types';

// Autorización
export {
	canViewAll,
	canModifyRegistro,
	canDeleteRegistro,
	calculateIsOwner
} from './authorization';

// Seeds
export { ensureOrigenesSeed } from './seeds';

// Consultas
export {
	getCentrosByUser,
	getCiclosByUser,
	getTiposRegistro,
	getRegistrosWithPermisos
} from './queries';

// Mutaciones
export {
	createRegistro,
	updateRegistro,
	deleteRegistro
} from './mutations';