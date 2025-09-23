/**
 * Validadores Zod para la aplicación
 * Exporta todos los schemas y tipos inferidos
 */

// Validadores de autenticación
export {
  loginSchema,
  registroSchema,
  passwordStrengthSchema,
  type LoginInput,
  type RegistroInput,
  type PasswordStrengthInput
} from './auth.validator';

// Validadores de mediciones
export {
  createMedicionSchema,
  updateMedicionSchema,
  filterMedicionesSchema,
  medicionIdSchema,
  type CreateMedicionInput,
  type UpdateMedicionInput,
  type FilterMedicionesInput,
  type MedicionIdInput
} from './mediciones.validator';
