/**
 * Módulo de centros de cultivo.
 * Punto de entrada público que re-exporta todos los submódulos.
 */

// Tipos
export type {
	CentroConPermisos,
	CentroFormData,
	GeoPoint,
	Lugar
} from './types';

// Autorización
export {
	canViewAll,
	canModifyCentro,
	canDeleteCentro,
	calculateIsOwner
} from './authorization';

// Transformaciones
export {
	transformarLugarParaCliente,
	buildGeoPoint,
	transformarCentrosConPermisos
} from './transforms';

// Consultas
export {
	getCentrosByUser,
	getCiclosCountByLugares,
	getCentroById,
	countCiclosByLugar
} from './queries';

// Mutaciones
export {
	createCentro,
	updateCentro,
	deleteCentro
} from './mutations';

// Tipo de resultado de mutaciones
export type { MutationResult } from './mutations';