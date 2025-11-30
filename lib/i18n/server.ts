/**
 * Server-side i18n Utilities
 *
 * This module provides i18n utilities for React Server Components (RSC).
 * Uses React cache for request-scoped i18n instances.
 *
 * Following 2025 best practices for Next.js 15 App Router.
 */

import { cache } from "react";
import { setupI18n as linguiSetupI18n, type I18n, type Messages, i18n as globalI18n } from "@lingui/core";
import { setI18n } from "@lingui/react/server";
import { type Locale, defaultLocale, isValidLocale, loadMessages } from "./index";

/**
 * Cache for i18n instances per locale
 * This ensures we don't recreate instances unnecessarily
 */
const i18nCache = new Map<Locale, I18n>();

/**
 * Get or create an i18n instance for a specific locale
 * Cached to avoid recreating on every request
 */
export async function getI18nInstance(locale: Locale): Promise<I18n> {
  if (!isValidLocale(locale)) {
    console.warn(`[i18n] Invalid locale: ${locale}, using default: ${defaultLocale}`);
    locale = defaultLocale;
  }

  // Check cache first
  const cached = i18nCache.get(locale);
  if (cached) {
    return cached;
  }

  // Load messages and create new instance
  const messages = await loadMessages(locale);
  
  const i18nInstance = linguiSetupI18n({
    locale,
    messages: { [locale]: messages },
  });

  // Store in cache
  i18nCache.set(locale, i18nInstance);
  
  return i18nInstance;
}

/**
 * Initialize i18n for a server component request
 * Call this in your layout.tsx or page.tsx files
 *
 * @example
 * ```tsx
 * // app/[lang]/layout.tsx
 * import { initializeI18n } from "@/lib/i18n/server";
 *
 * export default async function Layout({ params }: { params: { lang: string } }) {
 *   await initializeI18n(params.lang);
 *   return <>{children}</>;
 * }
 * ```
 */
export const initializeI18n = cache(async (locale: string): Promise<I18n> => {
  const validLocale = isValidLocale(locale) ? locale : defaultLocale;
  const i18nInstance = await getI18nInstance(validLocale);

  // Make it available to Lingui's server-side Trans/useLingui
  setI18n(i18nInstance);

  // Also activate the global i18n instance for the `t` macro from @lingui/core/macro
  const messages = await loadMessages(validLocale);
  globalI18n.load(validLocale, messages);
  globalI18n.activate(validLocale);

  return i18nInstance;
});

/**
 * Get messages for a locale (useful for passing to client components)
 */
export async function getMessagesForLocale(locale: Locale): Promise<Messages> {
  return loadMessages(locale);
}

