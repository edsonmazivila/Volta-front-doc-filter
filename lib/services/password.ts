'use server'

import { API_BASE_URL } from '@/lib/config'
import { AUTH_ENDPOINTS } from '@/lib/auth/utils'

/**
 * Password Management Service
 * 
 * Provides API calls for password-related operations:
 * - Forgot password (public)
 * - Reset password (public with token)
 * - Change password (authenticated)
 */

// Response types
interface ApiSuccessResponse {
	success: boolean
	message: string
}

interface ApiErrorResponse {
	error: string
	message: string
	code: number
}

export type PasswordServiceResult =
	| { success: true; message: string }
	| { success: false; error: string; code?: number }

/**
 * Request password reset email
 * Public endpoint - always returns success for security
 */
export async function forgotPassword(email: string): Promise<PasswordServiceResult> {
	try {
		const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.FORGOT_PASSWORD}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email }),
			cache: 'no-store',
		})

		if (!response.ok) {
			const error: ApiErrorResponse = await response.json().catch(() => ({
				error: 'Request failed',
				message: 'Failed to send password reset email',
				code: response.status,
			}))

			return {
				success: false,
				error: error.message || 'Failed to send reset email',
				code: error.code || response.status,
			}
		}

		const data: ApiSuccessResponse = await response.json()
		return {
			success: true,
			message: data.message || 'If an account with that email exists, a password reset link has been sent',
		}
	} catch (error) {
		console.error('[forgotPassword] Network error:', error)
		return {
			success: false,
			error: 'Network error - please check your connection',
		}
	}
}

/**
 * Reset password using token from email
 * Public endpoint with token validation
 */
export async function resetPassword(token: string, newPassword: string): Promise<PasswordServiceResult> {
	try {
		const response = await fetch(`${API_BASE_URL}${AUTH_ENDPOINTS.RESET_PASSWORD}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token,
				new_password: newPassword,
			}),
			cache: 'no-store',
		})

		if (!response.ok) {
			const error: ApiErrorResponse = await response.json().catch(() => ({
				error: 'Request failed',
				message: 'Failed to reset password',
				code: response.status,
			}))

			return {
				success: false,
				error: error.message || 'Password reset failed',
				code: error.code || response.status,
			}
		}

		const data: ApiSuccessResponse = await response.json()
		return {
			success: true,
			message: data.message || 'Password reset successfully. You can now log in with your new password',
		}
	} catch (error) {
		console.error('[resetPassword] Network error:', error)
		return {
			success: false,
			error: 'Network error - please check your connection',
		}
	}
}

/**
 * Change password for authenticated user
 * Requires valid session cookie
 */
export async function changePassword(
	currentPassword: string,
	newPassword: string
): Promise<PasswordServiceResult> {
	try {
		// Call Next.js API route (handles auth cookies automatically)
		const response = await fetch('/api/auth/change-password', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				current_password: currentPassword,
				new_password: newPassword,
			}),
			cache: 'no-store',
			credentials: 'include',
		})

		if (!response.ok) {
			const error: ApiErrorResponse = await response.json().catch(() => ({
				error: 'Request failed',
				message: 'Failed to change password',
				code: response.status,
			}))

			// Map common error codes to user-friendly messages
			if (response.status === 401) {
				return {
					success: false,
					error: error.message || 'Current password is incorrect',
					code: 401,
				}
			}

			if (response.status === 400 && error.error === 'Same password') {
				return {
					success: false,
					error: 'New password must be different from current password',
					code: 400,
				}
			}

			if (response.status === 400 && error.error === 'Weak password') {
				return {
					success: false,
					error: 'Password does not meet security requirements',
					code: 400,
				}
			}

			if (response.status === 403) {
				return {
					success: false,
					error: error.message || 'Your account has been deactivated',
					code: 403,
				}
			}

			return {
				success: false,
				error: error.message || 'Failed to change password',
				code: error.code || response.status,
			}
		}

		const data: ApiSuccessResponse = await response.json()
		return {
			success: true,
			message: data.message || 'Password changed successfully',
		}
	} catch (error) {
		console.error('[changePassword] Network error:', error)
		return {
			success: false,
			error: 'Network error - please check your connection',
		}
	}
}
