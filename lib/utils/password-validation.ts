/**
 * Password validation utilities
 * 
 * Backend requirements (as of 2026):
 * - Minimum 8 characters, maximum 128 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */

export interface PasswordValidationResult {
	isValid: boolean
	errors: string[]
}

export interface PasswordStrength {
	score: 0 | 1 | 2 | 3 | 4 // 0 = very weak, 4 = very strong
	label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong'
	color: 'red' | 'orange' | 'yellow' | 'blue' | 'green'
}

/**
 * Validates password against backend requirements
 */
export function validatePassword(password: string): PasswordValidationResult {
	const errors: string[] = []

	if (!password) {
		return { isValid: false, errors: ['Password is required'] }
	}

	if (password.length < 8) {
		errors.push('Password must be at least 8 characters')
	}

	if (password.length > 128) {
		errors.push('Password must be less than 128 characters')
	}

	if (!/[a-z]/.test(password)) {
		errors.push('Password must contain at least one lowercase letter')
	}

	if (!/[A-Z]/.test(password)) {
		errors.push('Password must contain at least one uppercase letter')
	}

	if (!/\d/.test(password)) {
		errors.push('Password must contain at least one number')
	}

	return {
		isValid: errors.length === 0,
		errors,
	}
}

/**
 * Checks if password meets minimum backend requirements
 */
export function isPasswordValid(password: string): boolean {
	return validatePassword(password).isValid
}

/**
 * Calculates password strength score
 * Returns score from 0 (very weak) to 4 (very strong)
 */
export function getPasswordStrength(password: string): PasswordStrength {
	if (!password) {
		return { score: 0, label: 'Very Weak', color: 'red' }
	}

	let score = 0

	// Length checks
	if (password.length >= 8) score++
	if (password.length >= 12) score++
	if (password.length >= 16) score++

	// Character variety checks
	const hasLower = /[a-z]/.test(password)
	const hasUpper = /[A-Z]/.test(password)
	const hasNumber = /\d/.test(password)
	const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

	if (hasLower && hasUpper) score++
	if (hasNumber) score++
	if (hasSpecial) score++

	// Common patterns decrease score
	const commonPatterns = [
		/^123456/,
		/password/i,
		/qwerty/i,
		/(.)\1{2,}/, // repeated characters
		/^[a-zA-Z]+$/, // only letters
		/^\d+$/, // only numbers
	]

	for (const pattern of commonPatterns) {
		if (pattern.test(password)) {
			score = Math.max(0, score - 1)
			break
		}
	}

	// Cap score at 4
	const finalScore = Math.min(4, score) as 0 | 1 | 2 | 3 | 4

	// Map score to label and color
	const strengthMap: Record<0 | 1 | 2 | 3 | 4, { label: PasswordStrength['label']; color: PasswordStrength['color'] }> = {
		0: { label: 'Very Weak', color: 'red' },
		1: { label: 'Weak', color: 'orange' },
		2: { label: 'Fair', color: 'yellow' },
		3: { label: 'Good', color: 'blue' },
		4: { label: 'Strong', color: 'green' },
	}

	return {
		score: finalScore,
		label: strengthMap[finalScore].label,
		color: strengthMap[finalScore].color,
	}
}

/**
 * Validates that passwords match
 */
export function validatePasswordsMatch(password: string, confirmPassword: string): boolean {
	return password === confirmPassword && password.length > 0
}

/**
 * Get user-friendly error message for password validation
 */
export function getPasswordErrorMessage(password: string): string | null {
	const validation = validatePassword(password)
	if (validation.isValid) return null
	return validation.errors[0] || 'Invalid password'
}

/**
 * Backend regex pattern for validation (for reference)
 */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/

/**
 * Password requirements text for UI display
 */
export const PASSWORD_REQUIREMENTS = [
	'At least 8 characters long',
	'Contains at least one uppercase letter',
	'Contains at least one lowercase letter',
	'Contains at least one number',
] as const
