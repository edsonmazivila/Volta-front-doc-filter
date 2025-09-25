import { User } from './types'
import { API_BASE_URL, COOKIE_NAMES as CONFIG_COOKIE_NAMES } from '@/lib/config'
import { 
	getSecureErrorMessage, 
	getSecureHeaders,
	isValidTokenFormat 
} from './security'

// Cookie names (centralized)
export const COOKIE_NAMES = CONFIG_COOKIE_NAMES


const BASE_URL = API_BASE_URL

// Auth API endpoints
export const AUTH_ENDPOINTS = {
	LOGIN: '/api/auth/login',
	LOGOUT: '/api/auth/logout',
	REFRESH: '/api/auth/refresh',
	PROFILE: '/api/auth/profile',
    SIGNUP: '/api/auth/register',
	FORGOT_PASSWORD: '/api/auth/forgot-password',
	RESET_PASSWORD: '/api/auth/reset-password'
} as const

// Client-side auth utilities
export class AuthManager {
	private baseURL: string

	constructor(baseURL = BASE_URL || '') {
		this.baseURL = baseURL
	}

	async login(email: string, password: string): Promise<User> {
		const response = await fetch(`${this.baseURL}${AUTH_ENDPOINTS.LOGIN}`, {
			method: 'POST',
			headers: getSecureHeaders(),
			body: JSON.stringify({ email, password }),
			credentials: 'include'
		})

		if (!response.ok) {
			const error = await response.json().catch(() => ({}))
			throw new Error(getSecureErrorMessage(error, 'Login failed'))
		}

		const data = await response.json()
		return data.data?.user || data.user
	}

	async logout(): Promise<void> {
		try {
			// Hit our Next.js route to avoid CORS and clear cookie on our domain
			await fetch(`/api/auth/logout`, {
				method: 'POST',
				headers: getSecureHeaders(),
				credentials: 'include'
			})
		} catch (error) {
			console.error('Logout error:', error)
		}
	}

	async signup(userData: {
		name: string
		email: string
		password: string
		companyName: string
	}): Promise<User> {
		const response = await fetch(`${this.baseURL}${AUTH_ENDPOINTS.SIGNUP}`, {
			method: 'POST',
			headers: getSecureHeaders(),
			body: JSON.stringify(userData),
			credentials: 'include'
		})

		if (!response.ok) {
			const error = await response.json().catch(() => ({}))
			throw new Error(getSecureErrorMessage(error, 'Signup failed'))
		}

		const data = await response.json()
		return data.data?.user || data.user
	}

	async forgotPassword(email: string): Promise<void> {
		const response = await fetch(`${this.baseURL}${AUTH_ENDPOINTS.FORGOT_PASSWORD}`, {
			method: 'POST',
			headers: getSecureHeaders(),
			body: JSON.stringify({ email }),
			credentials: 'include'
		})

		if (!response.ok) {
			const error = await response.json().catch(() => ({}))
			throw new Error(getSecureErrorMessage(error, 'Failed to send reset email'))
		}
	}

	async resetPassword(token: string, password: string): Promise<void> {
		// Validate token format
		if (!isValidTokenFormat(token)) {
			throw new Error('Invalid reset token')
		}

		const response = await fetch(`${this.baseURL}${AUTH_ENDPOINTS.RESET_PASSWORD}`, {
			method: 'POST',
			headers: getSecureHeaders(),
			body: JSON.stringify({ token, password }),
			credentials: 'include'
		})

		if (!response.ok) {
			const error = await response.json().catch(() => ({}))
			throw new Error(getSecureErrorMessage(error, 'Password reset failed'))
		}
	}

	async getProfile(): Promise<User | null> {
		try {
			const response = await fetch(`${this.baseURL}${AUTH_ENDPOINTS.PROFILE}`, {
				method: 'GET',
				headers: getSecureHeaders(),
				credentials: 'include'
			})

			if (!response.ok) {
				return null
			}

			const data = await response.json()
			return data.data || data.user
		} catch (error) {
			console.error('Error fetching profile:', error)
			return null
		}
	}
}

// Create singleton instance
export const authManager = new AuthManager()
