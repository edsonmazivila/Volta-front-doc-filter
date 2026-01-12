import { z } from 'zod'

// Role types matching backend - 7 roles (multi-tenant)
export type UserRole =
	| 'platform_owner'
	| 'organization_admin'
	| 'system_admin'
	| 'hr_manager'
	| 'payroll_manager'
	| 'operational_manager'
	| 'employee'

// User types
export interface User {
	id: string
	email: string
	full_name: string
	role: UserRole
	organization_id: string | null
	company_id: string | null
	is_active: boolean
	can_login: boolean
	avatar?: string
	profile_photo_url?: string
	created_at: string
	updated_at: string
}

// Safe user type for client-side (no sensitive fields)
export interface ClientUser {
	id: string
	email: string
	full_name: string
	role: UserRole
	organization_id: string | null
	company_id: string | null
	avatar?: string
	profile_photo_url?: string
	created_at: string
	updated_at: string
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

// Signup form schema - Register organization with admin + first company
export const signupSchema = z.object({
	// Admin user details
	full_name: z.string().min(1, 'Full name is required'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	// Company details (first company of the organization)
	company_name: z.string().min(1, 'Company name is required'),
	business_email: z.string().email('Invalid business email'),
	country: z.string().min(2, 'Country is required (e.g., US, PT)').max(2, 'Use 2-letter country code'),
	// Optional fields
	tax_id: z.string().optional(),
	legal_name: z.string().optional(),
	address_line1: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	postal_code: z.string().optional(),
	company_phone: z.string().optional(),
	website: z.string().url('Invalid website URL').optional().or(z.literal('')),
	termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms')
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