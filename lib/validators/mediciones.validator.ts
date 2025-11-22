import { z } from 'zod';

/**
 * Validación personalizada para fechas no futuras
 */
const fechaNoFutura = (fecha: Date | string) => {
  const fechaDate = new Date(fecha);
  const ahora = new Date();
  return fechaDate <= ahora;
};

/**
 * Schema para validar la creación de una medición
 */
export const createMedicionSchema = z.object({
  valor: z.coerce.number({
    message: 'El valor debe ser un número'
  }).positive('El valor debe ser positivo')
    .refine((val) => !isNaN(val), 'El valor debe ser un número válido'),
  fecha_medicion: z.coerce.date({
    message: 'La fecha de medición debe ser una fecha válida'
  }).refine(fechaNoFutura, 'La fecha de medición no puede ser futura'),
  lugar_id: z.coerce.number({
    message: 'El lugar debe ser un número'
  }).int('El lugar debe ser un entero')
    .positive('El lugar debe ser positivo')
    .refine((val) => !isNaN(val), 'El lugar debe ser un número válido'),
  unidad_id: z.coerce.number({
    message: 'La unidad debe ser un número'
  }).int('La unidad debe ser un entero')
    .positive('La unidad debe ser positiva')
    .refine((val) => !isNaN(val), 'La unidad debe ser un número válido'),
  tipo_id: z.coerce.number({
    message: 'El tipo debe ser un número'
  }).int('El tipo debe ser un entero')
    .positive('El tipo debe ser positivo')
    .refine((val) => !isNaN(val), 'El tipo debe ser un número válido'),
  origen_id: z.coerce.number({
    message: 'El origen debe ser un número'
  }).int('El origen debe ser un entero')
    .positive('El origen debe ser positivo')
    .refine((val) => !isNaN(val), 'El origen debe ser un número válido'),
  notas: z.string({
    message: 'Las notas deben ser un texto'
  }).max(1000, 'Las notas no pueden exceder los 1000 caracteres')
    .optional(),
  ciclo_id: z.coerce.number({
    message: 'El ciclo debe ser un número'
  }).int('El ciclo debe ser un entero')
    .positive('El ciclo debe ser positivo')
    .optional()
});

/**
 * Schema para validar la actualización de una medición
 * Todos los campos son opcionales
 */
export const updateMedicionSchema = createMedicionSchema.partial();

/**
 * Schema para validar los filtros de consulta de mediciones
 */
export const filterMedicionesSchema = z.object({
  page: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.coerce.number({
      message: 'La página debe ser un número'
    }).int('La página debe ser un entero')
      .min(1, 'La página debe ser al menos 1')
      .default(1)
      .optional()
  ),
  limit: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.coerce.number({
      message: 'El límite debe ser un número'
    }).int('El límite debe ser un entero')
      .min(1, 'El límite debe ser al menos 1')
      .max(100, 'El límite no puede exceder 100')
      .default(20)
      .optional()
  ),
  lugar_id: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.coerce.number({
      message: 'El lugar debe ser un número'
    }).int('El lugar debe ser un entero')
      .positive('El lugar debe ser positivo')
      .optional()
  ),
  unidad_id: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.coerce.number({
      message: 'La unidad debe ser un número'
    }).int('La unidad debe ser un entero')
      .positive('La unidad debe ser positiva')
      .optional()
  ),
  tipo_id: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.coerce.number({
      message: 'El tipo debe ser un número'
    }).int('El tipo debe ser un entero')
      .positive('El tipo debe ser positivo')
      .optional()
  ),
  ciclo_id: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.coerce.number({
      message: 'El ciclo debe ser un número'
    }).int('El ciclo debe ser un entero')
      .positive('El ciclo debe ser positivo')
      .optional()
  ),
  autor_id: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.coerce.number({
      message: 'El autor debe ser un número'
    }).int('El autor debe ser un entero')
      .positive('El autor debe ser positivo')
      .optional()
  ),
  fecha_desde: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.coerce.date({
      message: 'La fecha desde debe ser una fecha válida'
    }).optional()
  ),
  fecha_hasta: z.preprocess(
    (val) => (val === null || val === '' ? undefined : val),
    z.coerce.date({
      message: 'La fecha hasta debe ser una fecha válida'
    }).optional()
  )
}).refine((data) => {
  // Validar que fecha_hasta sea posterior a fecha_desde si ambas están presentes
  if (data.fecha_desde && data.fecha_hasta) {
    return data.fecha_hasta >= data.fecha_desde;
  }
  return true;
}, {
  message: 'La fecha hasta debe ser posterior a la fecha desde',
  path: ['fecha_hasta']
});

/**
 * Schema para validar el ID de una medición
 */
export const medicionIdSchema = z.object({
  id: z.coerce.number({
    message: 'El ID debe ser un número'
  }).int('El ID debe ser un entero')
    .positive('El ID debe ser positivo')
    .refine((val) => !isNaN(val), 'El ID debe ser un número válido')
});

/**
 * Tipo TypeScript inferido del createMedicionSchema
 */
export type CreateMedicionInput = z.infer<typeof createMedicionSchema>;

/**
 * Tipo TypeScript inferido del updateMedicionSchema
 */
export type UpdateMedicionInput = z.infer<typeof updateMedicionSchema>;

/**
 * Tipo TypeScript inferido del filterMedicionesSchema
 */
export type FilterMedicionesInput = z.infer<typeof filterMedicionesSchema>;

/**
 * Tipo TypeScript inferido del medicionIdSchema
 */
export type MedicionIdInput = z.infer<typeof medicionIdSchema>;
