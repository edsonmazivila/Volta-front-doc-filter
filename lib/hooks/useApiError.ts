"use client";

/**
 * useApiError Hook
 * 
 * Provides utilities for handling API errors with i18n support.
 * Automatically translates error codes to user-friendly messages
 * and handles common error scenarios (session expiration, permissions, etc.)
 */

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";
import { errorMessagesEN } from "../i18n/error-messages.en";
import { errorMessagesPT } from "../i18n/error-messages.pt-PT";
import type { ApiErrorResponse, ValidationError, ErrorAction } from "../types/api-error";

type Locale = "en" | "pt-PT";

/**
 * Configuration for the API error handler
 */
interface UseApiErrorConfig {
  locale?: Locale;
  onSessionExpired?: () => void;
  onPermissionDenied?: () => void;
  onError?: (message: string, error: ApiErrorResponse) => void;
}

/**
 * Return type for the useApiError hook
 */
interface UseApiErrorReturn {
  getErrorMessage: (error: ApiErrorResponse) => string;
  handleError: (error: ApiErrorResponse) => void;
  getValidationErrors: (error: ApiErrorResponse) => Record<string, string>;
  translateFieldError: (validationError: ValidationError) => string;
}

/**
 * Custom hook for handling API errors with i18n support
 * 
 * @example
 * ```tsx
 * const { handleError, getValidationErrors } = useApiError({
 *   locale: "pt-PT",
 *   onError: (message) => toast.error(message)
 * });
 * 
 * try {
 *   await api.post('/endpoint', data);
 * } catch (err) {
 *   handleError(err.response?.data);
 * }
 * ```
 */
export function useApiError(config: UseApiErrorConfig = {}): UseApiErrorReturn {
  const router = useRouter();
  const { locale = "en", onSessionExpired, onPermissionDenied, onError } = config;

  // Select error messages based on locale
  const errorMessages = useMemo(() => {
    return locale === "pt-PT" ? errorMessagesPT : errorMessagesEN;
  }, [locale]);

  /**
   * Get translated error message for an error code
   */
  const getErrorMessage = useCallback(
    (error: ApiErrorResponse): string => {
      if (!error) {
        return errorMessages.DEFAULT;
      }

      // Use error code if available, otherwise fallback to message or default
      const code = error.code as keyof typeof errorMessages;
      return errorMessages[code] || error.message || errorMessages.DEFAULT;
    },
    [errorMessages]
  );

  /**
   * Translate a field validation error to user-friendly message
   */
  const translateFieldError = useCallback(
    (validationError: ValidationError): string => {
      // Try to find a specific error message for the validation error
      const code = validationError.message.toUpperCase().replace(/\s+/g, "_");
      const errorCode = code as keyof typeof errorMessages;
      
      if (errorMessages[errorCode]) {
        return errorMessages[errorCode];
      }

      // Fallback to the original message
      return validationError.message;
    },
    [errorMessages]
  );

  /**
   * Convert validation errors array to field-keyed object
   */
  const getValidationErrors = useCallback(
    (error: ApiErrorResponse): Record<string, string> => {
      const fieldErrors: Record<string, string> = {};
      
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach((err: ValidationError) => {
          fieldErrors[err.field] = translateFieldError(err);
        });
      }

      return fieldErrors;
    },
    [translateFieldError]
  );

  /**
   * Handle error with automatic actions based on error code
   */
  const handleError = useCallback(
    (error: ApiErrorResponse): void => {
      if (!error) {
        console.error("handleError called with null/undefined error");
        return;
      }

      const userMessage = getErrorMessage(error);

      // Define automatic actions for specific error codes
      const errorActions: ErrorAction[] = [
        {
          codes: ["SESSION_EXPIRED", "TOKEN_EXPIRED", "TOKEN_INVALID"],
          handler: () => {
            if (onSessionExpired) {
              onSessionExpired();
            } else {
              // Default: redirect to login
              router.push("/login");
            }
          },
        },
        {
          codes: ["INSUFFICIENT_PERMISSIONS", "FORBIDDEN"],
          handler: () => {
            if (onPermissionDenied) {
              onPermissionDenied();
            }
            // Still call onError to show the message
            if (onError) {
              onError(userMessage, error);
            }
          },
        },
        {
          codes: ["ORGANIZATION_INACTIVE", "ORGANIZATION_SUSPENDED", "ORGANIZATION_REJECTED"],
          handler: () => {
            // Redirect to a status page or show critical error
            if (onError) {
              onError(userMessage, error);
            }
          },
        },
      ];

      // Find and execute matching action
      const action = errorActions.find((action) => 
        action.codes.includes(error.code)
      );

      if (action) {
        action.handler(error);
      } else {
        // Default: just call onError callback
        if (onError) {
          onError(userMessage, error);
        }
      }

      // Log error in development
      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", {
          code: error.code,
          message: error.message,
          userMessage,
          status: error.status,
          details: error.details,
        });
      }
    },
    [getErrorMessage, onSessionExpired, onPermissionDenied, onError, router]
  );

  return {
    getErrorMessage,
    handleError,
    getValidationErrors,
    translateFieldError,
  };
}
