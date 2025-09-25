// Security utilities for authentication

// Input sanitization
export function sanitizeInput(input: string): string {
	return input
		.trim()
		.replace(/[<>]/g, '') // Remove potential HTML tags
		.slice(0, 1000) // Limit length
}

// Email validation
export function validateEmail(email: string): boolean {
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
	return emailRegex.test(email) && email.length <= 254
}

// Password strength validation
export function validatePasswordStrength(password: string): {
	isValid: boolean
	feedback: string[]
} {
	const feedback: string[] = []
	
	if (password.length < 8) {
		feedback.push('Password must be at least 8 characters long')
	}
	if (!/[a-z]/.test(password)) {
		feedback.push('Password must contain at least one lowercase letter')
	}
	if (!/[A-Z]/.test(password)) {
		feedback.push('Password must contain at least one uppercase letter')
	}
	if (!/\d/.test(password)) {
		feedback.push('Password must contain at least one number')
	}
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
		feedback.push('Password must contain at least one special character')
	}

	return {
		isValid: feedback.length === 0,
		feedback
	}
}

// CSRF token generation (client-side)
export function generateCSRFToken(): string {
	const array = new Uint8Array(32)
	crypto.getRandomValues(array)
	return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Secure error message handling
export function getSecureErrorMessage(error: unknown, defaultMessage: string = 'An error occurred'): string {
	if (error instanceof Error) {
		// Only expose safe error messages
		const safeMessages = [
			'Invalid email or password',
			'Email already exists',
			'Password reset link expired',
			'Account not found',
			'Please check your email',
			'Password must be at least 8 characters',
			'Please accept the terms and conditions'
		]
		
		if (safeMessages.some(msg => error.message.includes(msg))) {
			return error.message
		}
	}
	
	return defaultMessage
}

// Token format validation
export function isValidTokenFormat(token: string): boolean {
	// Basic JWT format validation
	const parts = token.split('.')
	return parts.length === 3 && parts.every(part => part.length > 0)
}

// Check if running in production
export function isProduction(): boolean {
	return process.env.NODE_ENV === 'production'
}

// Get secure headers for API requests
export function getSecureHeaders(): Record<string, string> {
	return {
		'Content-Type': 'application/json',
		'X-Requested-With': 'XMLHttpRequest',
		'X-Client-Version': '1.0.0',
		...(isProduction() && {
			'X-Forwarded-Proto': 'https'
		})
	}
}
