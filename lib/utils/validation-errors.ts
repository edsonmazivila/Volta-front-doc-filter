/**
 * Validation Error Utilities
 * 
 * Utilities for handling field validation errors from API responses.
 */

import type { ValidationError, ApiErrorResponse } from "../types/api-error";

/**
 * Extract validation errors from API error response
 */
export function extractValidationErrors(
  error: ApiErrorResponse
): ValidationError[] {
  return error.errors || [];
}

/**
 * Convert validation errors array to field-keyed object
 */
export function validationErrorsToFields(
  errors: ValidationError[]
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  
  errors.forEach((error) => {
    fieldErrors[error.field] = error.message;
  });

  return fieldErrors;
}

/**
 * Get validation error for a specific field
 */
export function getFieldError(
  errors: ValidationError[],
  fieldName: string
): string | undefined {
  const error = errors.find((e) => e.field === fieldName);
  return error?.message;
}

/**
 * Check if error response is a validation error
 */
export function isValidationError(error: ApiErrorResponse): boolean {
  return error.code === "VALIDATION_ERROR" && Array.isArray(error.errors);
}

/**
 * Format validation error for display
 */
export function formatValidationError(error: ValidationError): string {
  return `${error.field}: ${error.message}`;
}

/**
 * Get all validation error messages as an array
 */
export function getValidationMessages(error: ApiErrorResponse): string[] {
  if (!isValidationError(error)) {
    return [];
  }

  return error.errors!.map((e) => e.message);
}

/**
 * Merge validation errors with existing field errors
 */
export function mergeFieldErrors(
  existing: Record<string, string>,
  newErrors: ValidationError[]
): Record<string, string> {
  return {
    ...existing,
    ...validationErrorsToFields(newErrors),
  };
}

/**
 * Clear error for a specific field
 */
export function clearFieldError(
  errors: Record<string, string>,
  fieldName: string
): Record<string, string> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [fieldName]: _, ...rest } = errors;
  return rest;
}

/**
 * Check if there are any field errors
 */
export function hasFieldErrors(errors: Record<string, string>): boolean {
  return Object.keys(errors).length > 0;
}
