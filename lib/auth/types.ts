import { z } from 'zod'

// Role types matching backend - exactly 5 roles
export type UserRole =
	| 'employee'
	| 'operational_manager'
	| 'hr_manager'
	| 'payroll_manager'
	| 'system_admin'

// User types
export interface User {
	id: string
	email: string
	name: string
	role: UserRole
	companyId?: string
	avatar?: string
	createdAt: string
	updatedAt: string
}

// Safe user type for client-side (no sensitive fields)
export interface ClientUser {
	id: string
	email: string
	name: string
	role: UserRole
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
	email: z.string().min(1, 'Email is required'),
	password: z.string().min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Signup form schema - Register first account with admin + company
export const signupSchema = z.object({
	// Admin user details
	full_name: z.string().min(1, 'Full name is required'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	// Company details
	company_name: z.string().min(1, 'Company name is required'),
	legal_name: z.string().min(1, 'Legal name is required'),
	tax_id: z.string().min(1, 'Tax ID is required'),
	address_line1: z.string().min(1, 'Address is required'),
	city: z.string().min(1, 'City is required'),
	state: z.string().min(1, 'State is required'),
	postal_code: z.string().min(1, 'Postal code is required'),
	country: z.string().min(1, 'Country is required'),
	company_phone: z.string().min(1, 'Company phone is required'),
	company_email: z.string().email('Invalid company email'),
	website: z.string().url('Invalid website URL').optional(),
	termsAccepted: z.boolean()
})

export type SignupFormData = z.infer<typeof signupSchema>

// Forgot password schema
export const forgotPasswordSchema = z.object({
	email: z.string().min(1, 'Email is required')
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// Reset password schema
export const resetPasswordSchema = z.object({
	password: z.string().min(1, 'Password is required'),
	confirmPassword: z.string().min(1, 'Please confirm your password'),
	token: z.string().min(1, 'Reset token is required')
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// API error response
export interface ApiError {
	message: string
	code?: string
	field?: string
}