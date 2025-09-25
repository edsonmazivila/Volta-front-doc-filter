import { z } from 'zod'

// User types
export interface User {
	id: string
	email: string
	name: string
	role: 'admin' | 'hr' | 'employee'
	companyId?: string
	avatar?: string
	createdAt: string
	updatedAt: string
}

// Auth response types
export interface AuthResponse {
	user: User
	accessToken: string
	refreshToken?: string
	expiresIn: number
}

// Login form schema
export const loginSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address'),
	password: z
		.string()
		.min(1, 'Password is required')
		.min(6, 'Password must be at least 6 characters'),
	
})

export type LoginFormData = z.infer<typeof loginSchema>

// Signup form schema
export const signupSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name must be less than 50 characters'),
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address'),
	password: z
		.string()
		.min(1, 'Password is required')
		.min(8, 'Password must be at least 8 characters')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Password must contain at least one uppercase letter, one lowercase letter, and one number'
		),
	confirmPassword: z.string().min(1, 'Please confirm your password'),
	companyName: z
		.string()
		.min(1, 'Company name is required')
		.min(2, 'Company name must be at least 2 characters')
		.max(100, 'Company name must be less than 100 characters'),
	termsAccepted: z
		.boolean()
		.refine(val => val === true, 'You must accept the terms and conditions')
}).refine(data => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword']
})

export type SignupFormData = z.infer<typeof signupSchema>

// Forgot password schema
export const forgotPasswordSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address')
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// Reset password schema
export const resetPasswordSchema = z.object({
	password: z
		.string()
		.min(1, 'Password is required')
		.min(8, 'Password must be at least 8 characters')
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
			'Password must contain at least one uppercase letter, one lowercase letter, and one number'
		),
	confirmPassword: z.string().min(1, 'Please confirm your password'),
	token: z.string().min(1, 'Reset token is required')
}).refine(data => data.password === data.confirmPassword, {
	message: 'Passwords do not match',
	path: ['confirmPassword']
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// API error response
export interface ApiError {
	message: string
	code?: string
	field?: string
}