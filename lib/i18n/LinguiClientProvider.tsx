"use client";

/**
 * Lingui Client Provider
 *
 * Wraps the application with I18nProvider for client-side translations.
 * Receives initial locale and messages from the server to avoid hydration mismatch.
 *
 * Following 2025 best practices for Next.js 15 App Router.
 */

import { useState, type ReactNode } from "react";
import { I18nProvider } from "@lingui/react";
import { type Messages, setupI18n } from "@lingui/core";
import type { Locale } from "./locales";

interface LinguiClientProviderProps {
  children: ReactNode;
  initialLocale: Locale;
  initialMessages: Messages;
}

/**
 * Client-side Lingui Provider
 *
 * This component wraps your application and provides translations to all
 * client components. It receives the initial locale and messages from
 * the server to ensure hydration consistency.
 *
 * @example
 * ```tsx
 * // In your layout.tsx
 * <LinguiClientProvider initialLocale={locale} initialMessages={messages}>
 *   {children}
 * </LinguiClientProvider>
 * ```
 */
export function LinguiClientProvider({
  children,
  initialLocale,
  initialMessages,
}: LinguiClientProviderProps) {
  // Create i18n instance once on mount
  // useState ensures it's only created once per component lifecycle
  const [i18n] = useState(() => {
    return setupI18n({
      locale: initialLocale,
      messages: { [initialLocale]: initialMessages },
    });
  });

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}

