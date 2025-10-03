/**
 * Tipos compartidos para respuestas de API
 */

/**
 * Respuesta estándar de API
 * @template T - Tipo de datos en la respuesta
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * Respuesta paginada de API
 * @template T - Tipo de datos en cada elemento
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

/**
 * Usuario autenticado
 */
export interface AuthenticatedUser {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  created_at: Date;
}

/**
 * Unidad de medición
 */
export interface Unidad {
  id: number;
  nombre: string;
  sigla: string;
  creado_por_id?: number | null;
  deleted_at?: Date | null;
}

/**
 * Lugar de medición
 */
export interface Lugar {
  id: number;
  nombre: string;
  nota?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  creado_por_id?: number | null;
  created_at: Date;
  deleted_at?: Date | null;
}

/**
 * Tipo de registro
 */
export interface TipoRegistro {
  id: number;
  codigo: string;
  descripcion?: string | null;
}

/**
 * Usuario básico
 */
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  created_at: Date;
}

/**
 * Medición con relaciones
 */
export interface Medicion {
  id: number;
  valor: number;
  fecha_medicion: Date;
  notas?: string | null;
  created_at: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;

  // Relaciones
  lugar: Lugar;
  unidad: Unidad;
  tipo: TipoRegistro;
  registrado_por: Usuario;
}

/**
 * Códigos de error estándar
 */
export enum ErrorCode {
  // Errores de autenticación
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',

  // Errores de validación
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Errores de recursos
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',

  // Errores del servidor
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Errores de permisos
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
}

/**
 * Tipos de acciones para la bitácora
 */
export enum BitacoraAccion {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  SOFT_DELETE = 'SOFT_DELETE',
  RESTORE = 'RESTORE',
}

/**
 * Tablas afectadas en la bitácora
 */
export enum BitacoraTabla {
  USUARIOS = 'usuarios',
  UNIDADES = 'unidades',
  LUGARES = 'lugares',
  TIPOS_REGISTRO = 'tipos_registro',
  MEDICIONES = 'mediciones',
}
