/**
 * Tipos basados en modelos de Prisma
 */

import { BitacoraAccion, BitacoraTabla } from './api.types';

// ============================================================================
// FILTROS DE MEDICIONES
// ============================================================================

/**
 * Filtros para consultar mediciones
 */
export interface MedicionFilters {
  lugar_id?: number;
  unidad_id?: number;
  tipo_id?: number;
  registrado_por_id?: number;
  fecha_desde?: Date;
  fecha_hasta?: Date;
  valor_min?: number;
  valor_max?: number;
  notas?: string;
  incluir_eliminados?: boolean;
}

/**
 * Opciones de ordenamiento para mediciones
 */
export interface MedicionSortOptions {
  campo?: 'fecha_medicion' | 'valor' | 'created_at' | 'updated_at';
  direccion?: 'asc' | 'desc';
}

/**
 * Opciones de paginación para mediciones
 */
export interface MedicionPaginationOptions {
  page?: number;
  pageSize?: number;
}

/**
 * Opciones completas para consulta de mediciones
 */
export interface MedicionQueryOptions extends MedicionFilters, MedicionSortOptions, MedicionPaginationOptions {}

// ============================================================================
// CREAR/ACTUALIZAR MEDICIONES
// ============================================================================

/**
 * Datos para crear una nueva medición
 */
export interface CreateMedicionDto {
  valor: number;
  fecha_medicion: Date;
  lugar_id: number;
  unidad_id: number;
  tipo_id: number;
  registrado_por_id: number;
  notas?: string;
}

/**
 * Datos para actualizar una medición existente
 */
export interface UpdateMedicionDto {
  valor?: number;
  fecha_medicion?: Date;
  lugar_id?: number;
  unidad_id?: number;
  tipo_id?: number;
  notas?: string;
}

/**
 * Datos para crear una unidad
 */
export interface CreateUnidadDto {
  nombre: string;
  sigla: string;
  creado_por_id?: number;
}

/**
 * Datos para actualizar una unidad
 */
export interface UpdateUnidadDto {
  nombre?: string;
  sigla?: string;
}

/**
 * Datos para crear un lugar
 */
export interface CreateLugarDto {
  nombre: string;
  nota?: string;
  latitud?: number;
  longitud?: number;
  creado_por_id?: number;
}

/**
 * Datos para actualizar un lugar
 */
export interface UpdateLugarDto {
  nombre?: string;
  nota?: string;
  latitud?: number;
  longitud?: number;
}

/**
 * Datos para crear un tipo de registro
 */
export interface CreateTipoRegistroDto {
  codigo: string;
  descripcion?: string;
}

/**
 * Datos para actualizar un tipo de registro
 */
export interface UpdateTipoRegistroDto {
  codigo?: string;
  descripcion?: string;
}

/**
 * Datos para crear un usuario
 */
export interface CreateUsuarioDto {
  nombre: string;
  email: string;
  password: string;
}

/**
 * Datos para actualizar un usuario
 */
export interface UpdateUsuarioDto {
  nombre?: string;
  email?: string;
  activo?: boolean;
}

// ============================================================================
// BITÁCORA
// ============================================================================

/**
 * Entrada de cambio en la bitácora
 */
export interface BitacoraCambio {
  id: number;
  tabla_afectada: BitacoraTabla;
  registro_id: number;
  accion: BitacoraAccion;
  cambios?: string;
  usuario_id?: number | null;
  fecha_evento: Date;
  ip_origen?: string | null;
}

/**
 * Filtros para consultar la bitácora
 */
export interface BitacoraFilters {
  tabla_afectada?: BitacoraTabla;
  registro_id?: number;
  accion?: BitacoraAccion;
  usuario_id?: number;
  fecha_desde?: Date;
  fecha_hasta?: Date;
}

/**
 * Opciones de ordenamiento para bitácora
 */
export interface BitacoraSortOptions {
  campo?: 'fecha_evento' | 'tabla_afectada' | 'accion';
  direccion?: 'asc' | 'desc';
}

/**
 * Opciones de paginación para bitácora
 */
export interface BitacoraPaginationOptions {
  page?: number;
  pageSize?: number;
}

/**
 * Opciones completas para consulta de bitácora
 */
export interface BitacoraQueryOptions extends BitacoraFilters, BitacoraSortOptions, BitacoraPaginationOptions {}

/**
 * Datos para crear una entrada en la bitácora
 */
export interface CreateBitacoraCambioDto {
  tabla_afectada: BitacoraTabla;
  registro_id: number;
  accion: BitacoraAccion;
  cambios?: Record<string, { anterior: unknown; nuevo: unknown }>;
  usuario_id?: number;
  ip_origen?: string;
}

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

/**
 * Datos para login
 */
export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Datos para registro
 */
export interface RegistroDto {
  nombre: string;
  email: string;
  password: string;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  user: {
    id: number;
    nombre: string;
    email: string;
    activo: boolean;
  };
  token: string;
}

// ============================================================================
// EXPORTACIÓN
// ============================================================================

/**
 * Opciones para exportar mediciones
 */
export interface ExportMedicionesOptions {
  formato: 'csv' | 'json' | 'xlsx';
  filters?: MedicionFilters;
  incluir_relaciones?: boolean;
}

/**
 * Resultado de exportación
 */
export interface ExportResult {
  archivo: string;
  registros: number;
  formato: string;
  fecha_generacion: Date;
}
