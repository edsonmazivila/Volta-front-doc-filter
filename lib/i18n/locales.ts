/**
 * Locale Configuration
 *
 * Centralized locale definitions for the application.
 * Portuguese (Portugal) - pt-PT is the primary non-English locale.
 */

export const sourceLocale = "en" as const;

export const locales = ["en", "pt-PT"] as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  "pt-PT": "Português (Portugal)",
};

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Get the display name for a locale
 */
export function getLocaleName(locale: Locale): string {
  return localeNames[locale];
}

/**
 * Default locale to use when no locale is detected
 */
export const defaultLocale: Locale = "en";

/**
 * Cookie name for storing user's locale preference
 */
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

/**
 * Locale detection order:
 * 1. Cookie preference
 * 2. Accept-Language header
 * 3. Default locale
 */
export const localeDetectionOrder = ["cookie", "header", "default"] as const;

