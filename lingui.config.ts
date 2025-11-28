import type { LinguiConfig } from "@lingui/conf";

/**
 * Lingui i18n Configuration
 *
 * This configuration follows 2025 industry best practices for Next.js 15 App Router.
 * Uses .po file format (gettext standard) for translator-friendly workflows.
 *
 * Supported locales:
 * - en: English (source locale)
 * - pt-PT: Portuguese (Portugal)
 */

const config: LinguiConfig = {
  // Source locale - the language used in source code
  sourceLocale: "en",

  // Supported locales
  locales: ["en", "pt-PT"],

  // Catalog configuration
  catalogs: [
    {
      path: "<rootDir>/locales/{locale}/messages",
      include: ["app", "components", "lib"],
      exclude: [
        "**/node_modules/**",
        "**/.next/**",
        "**/dist/**",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx",
      ],
    },
  ],

  // Use PO format (gettext standard) - compatible with Poedit, Crowdin, etc.
  format: "po",

  // Compile options for optimized runtime performance
  compileNamespace: "es",

  // Extract options
  orderBy: "origin",

  // Fallback configuration
  fallbackLocales: {
    default: "en",
  },

  // Runtime catalog loading
  runtimeConfigModule: {
    i18n: ["@/lib/i18n", "i18n"],
    Trans: ["@lingui/react", "Trans"],
  },
};

export default config;

