/**
 * Global type declarations
 */

// Analytics (optional)
declare global {
  interface Window {
    analytics?: {
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export {};
