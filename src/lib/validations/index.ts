// Re-exports públicos - API del módulo de validaciones

// Esquemas Zod y tipos inferidos
export {
	loginSchema,
	centroSchema,
	cicloSchema,
	registroSchema,
	registroCreateSchema,
	type LoginInput,
	type CentroInput,
	type CicloInput,
	type RegistroInput,
	type RegistroCreateInput
} from './schemas';

// Funciones de utilidad para validación
export {
	validateFormData,
	parseFormData,
	type ValidationResult
} from './utils';