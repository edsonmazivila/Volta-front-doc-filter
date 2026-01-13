/**
 * API Error Types
 * 
 * TypeScript interfaces for API error responses from the backend.
 */

/**
 * Standard API error response structure from backend
 */
export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  timestamp: string;
  path?: string;
  details?: Record<string, unknown>;
  errors?: ValidationError[];
}

/**
 * Field validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: string | number | boolean | null;
  rejectedValue?: unknown;
}

/**
 * Error handler callback function type
 */
export type ErrorCallback = (error: ApiErrorResponse) => void;

/**
 * Error action configuration
 */
export interface ErrorAction {
  codes: string[];
  handler: ErrorCallback;
}
