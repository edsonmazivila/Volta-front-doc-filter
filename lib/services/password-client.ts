'use client'

import { API_BASE_URL } from '@/lib/config'

/**
 * Client-side Password API calls
 * These run in the browser, not on the server
 */

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
 * Request password reset email (client-side)
 * Calls Next.js API route which proxies to backend without CSRF requirement
 */
export async function forgotPasswordClient(email: string): Promise<PasswordServiceResult> {
	try {
		// Call Next.js API route (not backend directly)
		const apiUrl = '/api/auth/forgot-password'
		console.log('[forgotPasswordClient] Calling API:', apiUrl)
		console.log('[forgotPasswordClient] Email:', email)
		
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email }),
			cache: 'no-store',
		})

		console.log('[forgotPasswordClient] Response status:', response.status)

		if (!response.ok) {
			const error: ApiErrorResponse = await response.json().catch(() => ({
				error: 'Request failed',
				message: 'Failed to send password reset email',
				code: response.status,
			}))

			console.log('[forgotPasswordClient] Error response:', error)

			return {
				success: false,
				error: error.message || 'Failed to send reset email',
				code: error.code || response.status,
			}
		}

		const data: ApiSuccessResponse = await response.json()
		console.log('[forgotPasswordClient] Success response:', data)
		
		return {
			success: true,
			message: data.message || 'If an account with that email exists, a password reset link has been sent',
		}
	} catch (error) {
		console.error('[forgotPasswordClient] Network error:', error)
		const errorMessage = error instanceof Error ? error.message : 'Unknown error'
		
		// Check if it's a connection refused error
		if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
			return {
				success: false,
				error: `Cannot connect to server at ${API_BASE_URL}. Please ensure the backend API is running.`,
			}
		}
		
		return {
			success: false,
			error: `Network error: ${errorMessage}`,
		}
	}
}

/**
 * Reset password using token (client-side)
 * Calls Next.js API route which proxies to backend without CSRF requirement
 */
export async function resetPasswordClient(token: string, newPassword: string): Promise<PasswordServiceResult> {
	try {
		// Call Next.js API route (not backend directly)
		const apiUrl = '/api/auth/reset-password'
		console.log('[resetPasswordClient] Calling API:', apiUrl)
		
		const response = await fetch(apiUrl, {
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

		console.log('[resetPasswordClient] Response status:', response.status)

		if (!response.ok) {
			const error: ApiErrorResponse = await response.json().catch(() => ({
				error: 'Request failed',
				message: 'Failed to reset password',
				code: response.status,
			}))

			console.log('[resetPasswordClient] Error response:', error)

			return {
				success: false,
				error: error.message || 'Password reset failed',
				code: error.code || response.status,
			}
		}

		const data: ApiSuccessResponse = await response.json()
		console.log('[resetPasswordClient] Success response:', data)
		
		return {
			success: true,
			message: data.message || 'Password reset successfully. You can now log in with your new password',
		}
	} catch (error) {
		console.error('[resetPasswordClient] Network error:', error)
		return {
			success: false,
			error: 'Network error - please check your connection',
		}
	}
}

/**
 * Change password for authenticated user (client-side)
 * Calls Next.js API route which handles session cookies
 */
export async function changePasswordClient(
	currentPassword: string,
	newPassword: string
): Promise<PasswordServiceResult> {
	try {
		// Call Next.js API route (handles session cookies automatically)
		const apiUrl = '/api/auth/change-password'
		console.log('[changePasswordClient] Calling API:', apiUrl)
		
		const response = await fetch(apiUrl, {
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

		console.log('[changePasswordClient] Response status:', response.status)

		if (!response.ok) {
			const error: ApiErrorResponse = await response.json().catch(() => ({
				error: 'Request failed',
				message: 'Failed to change password',
				code: response.status,
			}))

			console.log('[changePasswordClient] Error response:', error)

			// Map common error codes to user-friendly messages
			if (response.status === 401) {
				return {
					success: false,
					error: error.message || 'Current password is incorrect',
					code: 401,
				}
			}

			if (response.status === 400 && error.message?.includes('Same password')) {
				return {
					success: false,
					error: 'New password must be different from current password',
					code: 400,
				}
			}

			if (response.status === 400 && error.message?.includes('Weak password')) {
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

		const data = await response.json()
		console.log('[changePasswordClient] Success response:', data)
		
		return {
			success: true,
			message: data.message || 'Password changed successfully',
		}
	} catch (error) {
		console.error('[changePasswordClient] Network error:', error)
		return {
			success: false,
			error: 'Network error - please check your connection',
		}
	}
}
