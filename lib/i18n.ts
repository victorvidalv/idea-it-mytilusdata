import { locales, defaultLocale, type Locale } from '@/i18n';
export type { Locale };

/**
 * Get the current locale from cookies or headers
 * This is a helper function for client-side components
 */
export function getLocale(): Locale {
  if (typeof window === 'undefined') {
    return defaultLocale;
  }

  // Try to get from cookie
  const match = document.cookie.match(new RegExp('(^| )NEXT_LOCALE=([^;]+)'));
  if (match) {
    const locale = match[2] as Locale;
    if (locales.includes(locale)) {
      return locale;
    }
  }

  // Try to get from localStorage
  const storedLocale = localStorage.getItem('locale') as Locale;
  if (storedLocale && locales.includes(storedLocale)) {
    return storedLocale;
  }

  // Try to detect from browser
  const browserLocale = navigator.language.split('-')[0] as Locale;
  if (locales.includes(browserLocale)) {
    return browserLocale;
  }

  return defaultLocale;
}

/**
 * Set the locale in cookies and localStorage
 * This is a helper function for client-side components
 */
export function setLocale(locale: Locale): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Set cookie
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`; // 1 year

  // Set localStorage
  localStorage.setItem('locale', locale);

  // Reload page to apply changes
  window.location.reload();
}

/**
 * Check if a locale is valid
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Get all available locales
 */
export function getAvailableLocales(): Locale[] {
  return [...locales];
}

/**
 * Get locale display name
 */
export function getLocaleDisplayName(locale: Locale): string {
  const displayNames: Record<Locale, string> = {
    en: 'English',
    es: 'Español'
  };
  return displayNames[locale];
}
