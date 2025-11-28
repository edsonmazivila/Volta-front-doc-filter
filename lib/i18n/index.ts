/**
 * Lingui i18n Core Module
 *
 * This module provides the core i18n instance and utilities for both
 * server and client components in Next.js 15 App Router.
 *
 * Following 2025 best practices for React Server Components (RSC).
 */

import { i18n as linguiI18n, type Messages } from "@lingui/core";
import { type Locale, defaultLocale, isValidLocale } from "./locales";

// Re-export the i18n instance for use with Lingui macros
export const i18n = linguiI18n;

// Re-export locale utilities
export {
  defaultLocale,
  isValidLocale,
  type Locale,
  localeNames,
  getLocaleName,
  LOCALE_COOKIE_NAME,
} from "./locales";

// Re-export locales array (used by middleware and other modules)
export { locales } from "./locales";

/**
 * Dynamically load messages for a locale
 * Uses dynamic imports for code splitting
 */
export async function loadMessages(locale: Locale): Promise<Messages> {
  switch (locale) {
    case "pt-PT":
      return (await import("@/locales/pt-PT/messages")).messages;
    case "en":
    default:
      return (await import("@/locales/en/messages")).messages;
  }
}

/**
 * Initialize or update the i18n instance with messages for a locale
 */
export async function setupI18n(locale: Locale): Promise<typeof i18n> {
  if (!isValidLocale(locale)) {
    console.warn(`Invalid locale: ${locale}, falling back to ${defaultLocale}`);
    locale = defaultLocale;
  }

  const messages = await loadMessages(locale);
  
  i18n.load(locale, messages);
  i18n.activate(locale);
  
  return i18n;
}

/**
 * Get the current active locale from the i18n instance
 */
export function getActiveLocale(): Locale {
  const currentLocale = i18n.locale;
  if (isValidLocale(currentLocale)) {
    return currentLocale;
  }
  return defaultLocale;
}

