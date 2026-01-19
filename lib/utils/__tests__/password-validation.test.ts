import { describe, it, expect } from 'vitest'
import {
	validatePassword,
	isPasswordValid,
	getPasswordStrength,
	validatePasswordsMatch,
	getPasswordErrorMessage,
	PASSWORD_REGEX,
} from '@/lib/utils/password-validation'

describe('Password Validation', () => {
	describe('validatePassword', () => {
		it('should validate a strong password', () => {
			const result = validatePassword('StrongPass123')
			expect(result.isValid).toBe(true)
			expect(result.errors).toHaveLength(0)
		})

		it('should reject password shorter than 8 characters', () => {
			const result = validatePassword('Short1A')
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Password must be at least 8 characters')
		})

		it('should reject password longer than 128 characters', () => {
			const result = validatePassword('A'.repeat(129) + 'a1')
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Password must be less than 128 characters')
		})

		it('should reject password without lowercase letter', () => {
			const result = validatePassword('UPPERCASE123')
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Password must contain at least one lowercase letter')
		})

		it('should reject password without uppercase letter', () => {
			const result = validatePassword('lowercase123')
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Password must contain at least one uppercase letter')
		})

		it('should reject password without number', () => {
			const result = validatePassword('NoNumbersHere')
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Password must contain at least one number')
		})

		it('should reject empty password', () => {
			const result = validatePassword('')
			expect(result.isValid).toBe(false)
			expect(result.errors).toContain('Password is required')
		})

		it('should return multiple errors for invalid password', () => {
			const result = validatePassword('short')
			expect(result.isValid).toBe(false)
			expect(result.errors.length).toBeGreaterThan(1)
		})

		it('should accept password with special characters', () => {
			const result = validatePassword('Strong@Pass123!')
			expect(result.isValid).toBe(true)
		})

		it('should accept password exactly 8 characters', () => {
			const result = validatePassword('Valid1aB')
			expect(result.isValid).toBe(true)
		})

		it('should accept password exactly 128 characters', () => {
			const result = validatePassword('A' + 'a'.repeat(125) + '1B')
			expect(result.isValid).toBe(true)
		})
	})

	describe('isPasswordValid', () => {
		it('should return true for valid password', () => {
			expect(isPasswordValid('ValidPass123')).toBe(true)
		})

		it('should return false for invalid password', () => {
			expect(isPasswordValid('invalid')).toBe(false)
		})
	})

	describe('getPasswordStrength', () => {
		it('should rate empty password as very weak', () => {
			const strength = getPasswordStrength('')
			expect(strength.score).toBe(0)
			expect(strength.label).toBe('Very Weak')
			expect(strength.color).toBe('red')
		})

		it('should rate short password as weak', () => {
			const strength = getPasswordStrength('Pass1')
			expect(strength.score).toBeLessThanOrEqual(1)
			expect(strength.label).toMatch(/Weak|Very Weak/)
		})

		it('should rate medium password as fair or good', () => {
			const strength = getPasswordStrength('Password123')
			expect(strength.score).toBeGreaterThanOrEqual(2)
			expect(strength.score).toBeLessThanOrEqual(3)
		})

		it('should rate strong password highly', () => {
			const strength = getPasswordStrength('StrongP@ssw0rd!2024')
			expect(strength.score).toBeGreaterThanOrEqual(3)
			expect(strength.label).toMatch(/Good|Strong/)
		})

		it('should penalize common patterns like "password"', () => {
			const weak = getPasswordStrength('Password123')
			const strong = getPasswordStrength('SecureP@ss123')
			expect(weak.score).toBeLessThan(strong.score)
		})

		it('should penalize repeated characters', () => {
			const weak = getPasswordStrength('Passsss123')
			const strong = getPasswordStrength('Password123')
			expect(weak.score).toBeLessThanOrEqual(strong.score)
		})

		it('should give higher score for longer passwords', () => {
			const short = getPasswordStrength('Pass123A')
			const medium = getPasswordStrength('Password123A')
			const long = getPasswordStrength('VeryLongPassword123A')
			expect(long.score).toBeGreaterThanOrEqual(medium.score)
			expect(medium.score).toBeGreaterThanOrEqual(short.score)
		})

		it('should give higher score for special characters', () => {
			const noSpecial = getPasswordStrength('Password123')
			const withSpecial = getPasswordStrength('P@ssword123!')
			expect(withSpecial.score).toBeGreaterThanOrEqual(noSpecial.score)
		})
	})

	describe('validatePasswordsMatch', () => {
		it('should return true when passwords match', () => {
			expect(validatePasswordsMatch('SamePass123', 'SamePass123')).toBe(true)
		})

		it('should return false when passwords do not match', () => {
			expect(validatePasswordsMatch('Pass123', 'Different123')).toBe(false)
		})

		it('should return false for empty passwords', () => {
			expect(validatePasswordsMatch('', '')).toBe(false)
		})

		it('should return false when only one is empty', () => {
			expect(validatePasswordsMatch('Pass123', '')).toBe(false)
			expect(validatePasswordsMatch('', 'Pass123')).toBe(false)
		})
	})

	describe('getPasswordErrorMessage', () => {
		it('should return null for valid password', () => {
			expect(getPasswordErrorMessage('ValidPass123')).toBeNull()
		})

		it('should return error message for invalid password', () => {
			const message = getPasswordErrorMessage('short')
			expect(message).toBeTruthy()
			expect(typeof message).toBe('string')
		})

		it('should return first error for multiple issues', () => {
			const message = getPasswordErrorMessage('abc')
			expect(message).toBeTruthy()
		})
	})

	describe('PASSWORD_REGEX', () => {
		it('should match valid passwords', () => {
			expect(PASSWORD_REGEX.test('ValidPass123')).toBe(true)
			expect(PASSWORD_REGEX.test('AnotherGood1')).toBe(true)
			expect(PASSWORD_REGEX.test('Strong@Pass123')).toBe(true)
		})

		it('should not match invalid passwords', () => {
			expect(PASSWORD_REGEX.test('short1A')).toBe(false)
			expect(PASSWORD_REGEX.test('nouppercase123')).toBe(false)
			expect(PASSWORD_REGEX.test('NOLOWERCASE123')).toBe(false)
			expect(PASSWORD_REGEX.test('NoNumbers')).toBe(false)
		})
	})

	describe('Edge Cases', () => {
		it('should handle passwords with unicode characters', () => {
			const result = validatePassword('Påssw0rd')
			expect(result.isValid).toBe(true)
		})

		it('should handle passwords with spaces', () => {
			const result = validatePassword('Pass Word 123')
			expect(result.isValid).toBe(true)
		})

		it('should handle passwords with emojis', () => {
			const result = validatePassword('Pass123😀Word')
			expect(result.isValid).toBe(true)
		})

		it('should handle null-like values gracefully', () => {
			const result = validatePassword(undefined as unknown as string)
			expect(result.isValid).toBe(false)
		})
	})

	describe('Real-world Password Examples', () => {
		const testCases = [
			{ password: 'MySecureP@ssw0rd', expected: true, desc: 'typical strong password' },
			{ password: 'password123', expected: false, desc: 'missing uppercase' },
			{ password: 'PASSWORD123', expected: false, desc: 'missing lowercase' },
			{ password: 'Password', expected: false, desc: 'missing number' },
			{ password: 'Pass123', expected: false, desc: 'too short' },
			{ password: 'P@ssw0rd', expected: true, desc: 'valid with special chars' },
			{ password: '12345678Aa', expected: true, desc: 'valid minimal' },
			{ password: 'Admin123!', expected: true, desc: 'valid admin password' },
		]

		testCases.forEach(({ password, expected, desc }) => {
			it(`should ${expected ? 'accept' : 'reject'} ${desc}: "${password}"`, () => {
				expect(isPasswordValid(password)).toBe(expected)
			})
		})
	})

	describe('Performance', () => {
		it('should handle validation of many passwords efficiently', () => {
			const startTime = Date.now()
			for (let i = 0; i < 1000; i++) {
				validatePassword(`TestPassword${i}`)
			}
			const endTime = Date.now()
			expect(endTime - startTime).toBeLessThan(100) // Should complete in < 100ms
		})
	})
})
