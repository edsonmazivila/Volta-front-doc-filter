import { COOKIE_NAMES as CONFIG_COOKIE_NAMES } from "@/lib/config";

// Cookie names (centralized)
export const COOKIE_NAMES = CONFIG_COOKIE_NAMES;

// Auth API endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  PROFILE: "/api/auth/profile",
  SIGNUP: "/api/auth/register",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
} as const;

// Simple role helpers for UI gating
export function hasRole(user: { role?: string } | null | undefined, role: string): boolean {
  return !!user && user.role === role
}

export function hasAnyRole(user: { role?: string } | null | undefined, roles: readonly string[]): boolean {
  return !!user && !!user.role && roles.includes(user.role)
}
