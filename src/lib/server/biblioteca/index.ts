/**
 * Módulo de biblioteca de parámetros sigmoidales.
 * 
 * Exporta todos los servicios necesarios para el ETL:
 * - Extracción de datos de mediciones
 * - Modelado sigmoidal (ajuste de curvas)
 * - Carga en base de datos
 * - Consultas y mutaciones
 */

export { extraerYTransformar, obtenerAdminId, type ResultadoExtraccion } from './extraccion';
export { ajustarCiclo, procesarCiclos, filtrarExitosos, type ResultadoAjuste, type DatosCiclo } from './modelado';
export { cargarBiblioteca, type ResultadoCarga } from './carga';
export { 
	getBibliotecaRecords, 
	getBibliotecaRecordById, 
	deleteBibliotecaRecord, 
	deleteAllBibliotecaRecords,
	canManageBiblioteca,
	type BibliotecaRecord 
} from './queries';