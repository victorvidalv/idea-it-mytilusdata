import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de producción: builds estrictos habilitados
  // Se requiere código limpio (sin errores TypeScript/ESLint) para desplegar
};

export default withNextIntl(nextConfig);
