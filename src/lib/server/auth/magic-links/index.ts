// Re-exports de tipos
export { MAGIC_LINK_EXPIRATION_MS, type MagicLinkResult } from './types';

// Re-exports de funciones públicas
export { createMagicLink, verifyTokenAndGetSession } from './core';