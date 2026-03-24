/**
 * Módulo de validación para el endpoint de proyección.
 */

export type { ValidacionResult } from './auth';
export { verificarAutenticacion } from './auth';

export { validarCamposRequeridos, validarLongitudArrays, validarMinimoPuntos } from './request';
export { validarCicloIdParam, obtenerCicloId } from './params';
