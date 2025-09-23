import { z } from 'zod';

/**
 * Schema para validar el login de usuarios
 */
export const loginSchema = z.object({
  email: z.string({
    message: 'El email debe ser un texto'
  }).min(1, 'El email es requerido')
   .email('El email no es válido'),
  password: z.string({
    message: 'La contraseña debe ser un texto'
  }).min(1, 'La contraseña es requerida')
   .min(6, 'La contraseña debe tener al menos 6 caracteres')
});

/**
 * Schema para validar el registro de nuevos usuarios
 */
export const registroSchema = z.object({
  nombre: z.string({
    message: 'El nombre debe ser un texto'
  }).min(1, 'El nombre es requerido')
   .min(2, 'El nombre debe tener al menos 2 caracteres')
   .max(100, 'El nombre no puede exceder los 100 caracteres'),
  email: z.string({
    message: 'El email debe ser un texto'
  }).min(1, 'El email es requerido')
   .email('El email no es válido'),
  password: z.string({
    message: 'La contraseña debe ser un texto'
  }).min(1, 'La contraseña es requerida')
   .min(8, 'La contraseña debe tener al menos 8 caracteres')
   .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
   .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
   .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
});

/**
 * Schema para validar la fortaleza de una contraseña
 */
export const passwordStrengthSchema = z.string({
  message: 'La contraseña debe ser un texto'
}).min(1, 'La contraseña es requerida')
 .min(8, 'La contraseña debe tener al menos 8 caracteres')
 .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
 .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
 .regex(/[0-9]/, 'La contraseña debe contener al menos un número');

/**
 * Tipo TypeScript inferido del loginSchema
 */
export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Tipo TypeScript inferido del registroSchema
 */
export type RegistroInput = z.infer<typeof registroSchema>;

/**
 * Tipo TypeScript inferido del passwordStrengthSchema
 */
export type PasswordStrengthInput = z.infer<typeof passwordStrengthSchema>;
