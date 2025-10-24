// Auth API endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  PROFILE: "/api/auth/profile",
  REGISTER_ACCOUNT: "/api/auth/register-account",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
} as const;


export function hasRole(user: { role?: string } | null | undefined, role: string): boolean {
  return !!user && user.role === role
}

export function hasAnyRole(user: { role?: string } | null | undefined, roles: readonly string[]): boolean {
  return !!user && !!user.role && roles.includes(user.role)
}
