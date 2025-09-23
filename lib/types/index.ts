/**
 * Tipos compartidos de la aplicación
 * Exporta todos los tipos definidos en api.types.ts y models.types.ts
 */

// ============================================================================
// API TYPES
// ============================================================================

export type {
  ApiResponse,
  PaginatedResponse,
  AuthenticatedUser,
  Unidad,
  Lugar,
  TipoRegistro,
  Usuario,
  Medicion,
} from './api.types';

export { ErrorCode, BitacoraAccion, BitacoraTabla } from './api.types';

// ============================================================================
// MODELS TYPES
// ============================================================================

export type {
  // Filtros y opciones de consulta
  MedicionFilters,
  MedicionSortOptions,
  MedicionPaginationOptions,
  MedicionQueryOptions,
  
  // DTOs de mediciones
  CreateMedicionDto,
  UpdateMedicionDto,
  
  // DTOs de unidades
  CreateUnidadDto,
  UpdateUnidadDto,
  
  // DTOs de lugares
  CreateLugarDto,
  UpdateLugarDto,
  
  // DTOs de tipos de registro
  CreateTipoRegistroDto,
  UpdateTipoRegistroDto,
  
  // DTOs de usuarios
  CreateUsuarioDto,
  UpdateUsuarioDto,
  
  // Bitácora
  BitacoraCambio,
  BitacoraFilters,
  BitacoraSortOptions,
  BitacoraPaginationOptions,
  BitacoraQueryOptions,
  CreateBitacoraCambioDto,
  
  // Autenticación
  LoginDto,
  RegistroDto,
  AuthResponse,
  
  // Exportación
  ExportMedicionesOptions,
  ExportResult,
} from './models.types';
