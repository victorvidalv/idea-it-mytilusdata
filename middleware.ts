import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, type Locale } from './i18n';

/**
 * Middleware para manejar la internacionalización sin prefijo de locale en la URL.
 * Almacena el locale detectado en una cookie para que `getRequestConfig` pueda leerlo.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Verificar si ya existe una cookie de locale válida
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;

  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    // Ya tiene un locale válido en la cookie, continuar
    return response;
  }

  // Detectar locale desde Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  let detectedLocale: Locale = defaultLocale;

  if (acceptLanguage) {
    // Parsear el header Accept-Language para encontrar el mejor match
    const languages = acceptLanguage.split(',').map(lang => {
      const [code, priority] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0].toLowerCase(), // Solo el código de idioma principal
        priority: priority ? parseFloat(priority) : 1
      };
    }).sort((a, b) => b.priority - a.priority);

    // Buscar el primer match con nuestros locales soportados
    for (const lang of languages) {
      if (locales.includes(lang.code as Locale)) {
        detectedLocale = lang.code as Locale;
        break;
      }
    }
  }

  // Establecer la cookie del locale
  response.cookies.set('NEXT_LOCALE', detectedLocale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 año
    sameSite: 'lax'
  });

  return response;
}

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - Next.js internals
  // - Static files (files with extensions)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
