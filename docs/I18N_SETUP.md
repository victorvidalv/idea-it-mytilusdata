# Internationalization (i18n) Setup

This document describes the i18n infrastructure implemented using `next-intl` for the IT25I0032 application.

## Overview

The application now supports two languages:
- **English (en)** - Default fallback
- **Spanish (es)** - Default locale

## Key Features

- **No URL prefix changes**: Routes remain the same (e.g., `/dashboard`, `/login`)
- **Server-side rendering (SSR)**: Full SSR support for translations
- **Cookie-based locale detection**: Locale is stored in cookies
- **Browser language detection**: Falls back to Accept-Language header
- **Client-side helpers**: Utility functions for locale management

## File Structure

```
/
├── i18n.ts                    # Main i18n configuration
├── middleware.ts              # Locale detection middleware
├── next.config.ts             # Next.js config with next-intl plugin
├── messages/
│   ├── en.json                # English translations
│   └── es.json                # Spanish translations
└── lib/
    └── i18n.ts                # Client-side helper functions
```

## Configuration Files

### i18n.ts

Main configuration file that:
- Defines supported locales: `['en', 'es']`
- Sets default locale to `'es'`
- Loads translation files dynamically

### middleware.ts

Middleware that:
- Detects locale from cookies first
- Falls back to Accept-Language header
- Uses `localePrefix: 'never'` to keep routes unchanged
- Matches all routes except API routes and static files

### next.config.ts

Updated to include the next-intl plugin:
```typescript
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
```

## Translation Files

### messages/en.json & messages/es.json

Both files contain the same structure with translations organized by feature:

- `common` - Reusable UI elements (buttons, labels, etc.)
- `navigation` - Navigation menu items
- `auth` - Authentication-related text
- `dashboard` - Dashboard-specific text
- `measurements` - Measurement management
- `places` - Place management
- `origins` - Origin management
- `units` - Unit management
- `recordTypes` - Record type management
- `users` - User management
- `auditLog` - Audit log text
- `analysis` - Analysis features
- `profile` - User profile
- `configuration` - System configuration
- `validation` - Validation messages
- `messages` - Success/error messages
- `home` - Home page
- `inDevelopment` - Development placeholder

## Usage in Components

### Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export default async function MyComponent() {
  const t = await getTranslations('common');
  
  return (
    <div>
      <h1>{t('appName')}</h1>
      <button>{t('save')}</button>
    </div>
  );
}
```

### Client Components

```tsx
'use client';

import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('common');
  
  return (
    <div>
      <h1>{t('appName')}</h1>
      <button>{t('save')}</button>
    </div>
  );
}
```

### Nested Translations

```tsx
const t = useTranslations('auth.error');
const errorMessage = t('invalidCredentials'); // "Invalid email or password"
```

### Dynamic Values

```tsx
const t = useTranslations('validation');
const message = t('minValue', { min: 10 }); // "Must be at least 10"
```

## Client-Side Helpers

### getLocale()

Get the current locale:

```tsx
import { getLocale } from '@/lib/i18n';

const currentLocale = getLocale(); // 'en' or 'es'
```

### setLocale(locale)

Change the locale (client-side only):

```tsx
import { setLocale } from '@/lib/i18n';

// Switch to English
setLocale('en');

// Switch to Spanish
setLocale('es');
```

### isValidLocale(locale)

Check if a locale is valid:

```tsx
import { isValidLocale } from '@/lib/i18n';

if (isValidLocale('en')) {
  // Valid locale
}
```

### getAvailableLocales()

Get all available locales:

```tsx
import { getAvailableLocales } from '@/lib/i18n';

const locales = getAvailableLocales(); // ['en', 'es']
```

### getLocaleDisplayName(locale)

Get the display name of a locale:

```tsx
import { getLocaleDisplayName } from '@/lib/i18n';

const name = getLocaleDisplayName('en'); // 'English'
```

## Creating a Language Switcher Component

Here's an example of a language switcher component:

```tsx
'use client';

import { setLocale, getLocale, getAvailableLocales, getLocaleDisplayName } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const currentLocale = getLocale();
  const locales = getAvailableLocales();
  
  return (
    <div className="flex gap-2">
      {locales.map((locale) => (
        <Button
          key={locale}
          variant={currentLocale === locale ? 'default' : 'outline'}
          size="sm"
          onClick={() => setLocale(locale)}
        >
          {getLocaleDisplayName(locale)}
        </Button>
      ))}
    </div>
  );
}
```

## Migration Guide

### Step 1: Identify Hardcoded Text

Find all hardcoded strings in your components:

```tsx
// Before
<h1>Welcome</h1>
<p>Please enter your credentials</p>
```

### Step 2: Add Translation Keys

Add corresponding keys to both `messages/en.json` and `messages/es.json`:

```json
// messages/en.json
{
  "myComponent": {
    "title": "Welcome",
    "description": "Please enter your credentials"
  }
}

// messages/es.json
{
  "myComponent": {
    "title": "Bienvenido",
    "description": "Por favor, introduce tus credenciales"
  }
}
```

### Step 3: Replace Hardcoded Text with Translations

```tsx
// After
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('myComponent');
  
  return (
    <>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </>
  );
}
```

## Best Practices

1. **Organize translations by feature**: Use namespaces that match your component structure
2. **Keep keys descriptive**: Use clear, hierarchical keys (e.g., `auth.error.invalidCredentials`)
3. **Maintain consistency**: Ensure the same structure in both language files
4. **Use interpolation**: For dynamic values, use interpolation instead of concatenation
5. **Test both languages**: Verify that all translations work correctly in both locales

## Testing

### Manual Testing

1. Change the locale using the Accept-Language header in your browser
2. Set the locale cookie: `document.cookie = 'NEXT_LOCALE=en; path=/'`
3. Reload the page and verify the language change

### Automated Testing

You can test translations in your unit tests:

```tsx
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import MyComponent from './MyComponent';

const messages = {
  myComponent: {
    title: 'Welcome',
    description: 'Please enter your credentials'
  }
};

test('renders translated text', () => {
  render(
    <NextIntlClientProvider messages={messages} locale="en">
      <MyComponent />
    </NextIntlClientProvider>
  );
  
  expect(screen.getByText('Welcome')).toBeInTheDocument();
});
```

## Troubleshooting

### Translations not appearing

1. Check that the locale cookie is set correctly
2. Verify that translation keys exist in both language files
3. Ensure you're using the correct namespace in `useTranslations()`

### Build errors

1. Make sure `next-intl` is installed: `npm install next-intl`
2. Verify that `next.config.ts` includes the plugin
3. Check that `middleware.ts` is properly configured

### Locale not persisting

1. Verify that cookies are being set with the correct path
2. Check browser cookie settings
3. Ensure the middleware is matching the correct routes

## Additional Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [i18n Best Practices](https://www.i18next.com/principles/best-practices)

## Next Steps

Now that the i18n infrastructure is in place, you can:

1. Start migrating components to use translations
2. Add a language switcher to the UI
3. Test the application in both languages
4. Add more languages if needed
5. Update API responses to support multiple languages
