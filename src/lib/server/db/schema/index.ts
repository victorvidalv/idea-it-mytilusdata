// Re-exports centralizados de todas las tablas del schema
// Mantener compatibilidad con imports existentes desde '../schema'

// Autenticación
export { usuarios, magicLinkTokens, sesiones } from './auth';

// Estructura productiva
export { lugares, ciclos } from './productive';

// Tablas maestras
export { tiposRegistro, origenDatos } from './master';

// Mediciones (tabla de hechos)
export { mediciones } from './measurements';

// Biblioteca de parámetros sigmoidales
export { biblioteca, type PuntosTalla, type ParametrosSigmoidal, type MetadatosBiblioteca } from './library';

// Seguridad
export { consentimientos, apiKeys, rateLimitLogs, emailCooldowns } from './security';

// Auditoría
export { auditLogs } from './audit';