/**
 * Enhanced API Client with Error Handling
 * 
 * Provides a wrapper around the base ApiClient with automatic error parsing
 * and type-safe error handling for the standardized backend error format.
 */

import type { ApiErrorResponse } from "../types/api-error";
import { apiClient, ApiClient, type ApiRequestConfig } from "./api-client";

/**
 * Enhanced error class with parsed API error response
 */
export class ApiError extends Error {
  public readonly response: ApiErrorResponse;
  public readonly originalError?: Error;

  constructor(response: ApiErrorResponse, originalError?: Error) {
    super(response.message || "API Error");
    this.name = "ApiError";
    this.response = response;
    this.originalError = originalError;
  }
}

/**
 * Parse error response from API
 */
function parseApiError(error: unknown): ApiErrorResponse {
  // If it's already an ApiError, return its response
  if (error instanceof ApiError) {
    return error.response;
  }

  // If it's a standard Error with a response property (from fetch)
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response: unknown }).response;
    if (response && typeof response === "object") {
      return response as ApiErrorResponse;
    }
  }

  // If the error itself looks like an ApiErrorResponse
  if (
    error &&
    typeof error === "object" &&
    "code" in error &&
    "message" in error
  ) {
    return error as ApiErrorResponse;
  }

  // Fallback: create a generic error response
  return {
    status: 500,
    code: "UNKNOWN_ERROR",
    message: error instanceof Error ? error.message : "An unknown error occurred",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Enhanced API Client with standardized error handling
 */
export class EnhancedApiClient {
  private client: ApiClient;

  constructor(client: ApiClient = apiClient) {
    this.client = client;
  }

  /**
   * Execute a request and handle errors consistently
   */
  private async executeRequest<T>(
    requestFn: () => Promise<T>
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      // Parse the error into our standard format
      const apiError = parseApiError(error);
      
      // Throw our enhanced ApiError
      throw new ApiError(
        apiError,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * GET request with error handling
   */
  async get<T>(
    endpoint: string,
    token?: string,
    config?: ApiRequestConfig
  ): Promise<T> {
    return this.executeRequest(() => 
      this.client.get<T>(endpoint, token, config)
    );
  }

  /**
   * POST request with error handling
   */
  async post<T>(
    endpoint: string,
    data: unknown,
    token?: string,
    config?: ApiRequestConfig
  ): Promise<T> {
    return this.executeRequest(() =>
      this.client.post<T>(endpoint, data, token, config)
    );
  }

  /**
   * PUT request with error handling
   */
  async put<T>(
    endpoint: string,
    data: unknown,
    token?: string,
    config?: ApiRequestConfig
  ): Promise<T> {
    return this.executeRequest(() =>
      this.client.put<T>(endpoint, data, token, config)
    );
  }

  /**
   * PATCH request with error handling
   */
  async patch<T>(
    endpoint: string,
    data: unknown,
    token?: string,
    config?: ApiRequestConfig
  ): Promise<T> {
    return this.executeRequest(() =>
      this.client.patch<T>(endpoint, data, token, config)
    );
  }

  /**
   * DELETE request with error handling
   */
  async delete<T>(
    endpoint: string,
    token?: string,
    config?: ApiRequestConfig
  ): Promise<T> {
    return this.executeRequest(() =>
      this.client.delete<T>(endpoint, token, config)
    );
  }
}

/**
 * Default enhanced API client instance
 */
export const enhancedApiClient = new EnhancedApiClient();

/**
 * Utility to check if an error is an ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Utility to safely extract error response
 */
export function getErrorResponse(error: unknown): ApiErrorResponse | null {
  if (isApiError(error)) {
    return error.response;
  }
  return null;
}
