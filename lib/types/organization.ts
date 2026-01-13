/**
 * Organization Types
 * Multi-tenant organization management
 */

export type OrganizationTier = 'standard' | 'premium' | 'enterprise'
export type OrganizationStatus = 'pending' | 'approved' | 'rejected'

export interface Organization {
	id: string
	name: string
	is_active: boolean
	tier: OrganizationTier
	approval_status: OrganizationStatus
	approval_notes?: string
	approved_by?: string
	approved_at?: string
	created_at: string
	updated_at: string
	
	// Aggregations (optional, available in some endpoints)
	companies_count?: number
	users_count?: number
	active_users_count?: number
}

export interface OrganizationStats {
	companies_count: number
	users_count: number
	active_users: number
	pending_approvals: number
	// Legacy fields for compatibility
	employees_count?: number
	active_employees?: number
	departments_count?: number
	total_payroll_mtd?: number
}

export interface Company {
	id: string
	organization_id: string
	name: string
	business_email: string
	country: string
	tax_id?: string
	legal_name?: string
	address_line1?: string
	city?: string
	state?: string
	postal_code?: string
	phone?: string
	website?: string
	logo_path?: string
	is_active: boolean
	created_at: string
	updated_at: string
	
	// Aggregations (optional)
	employees_count?: number
	active_employees?: number
	departments_count?: number
}

/**
 * Registration Response from Backend
 * POST /api/auth/register-account
 */
export interface RegistrationResponse {
	success: true
	data: {
		organization: {
			id: string
			name: string
			is_active: boolean
			tier: OrganizationTier
			approval_status: OrganizationStatus
		}
		company: {
			id: string
			name: string
			organization_id: string
		}
		user: {
			id: string
			email: string
			role: string
			full_name: string
			organization_id: string
			company_id: string
			can_login: boolean
		}
	}
	message: string
}

/**
 * Registration Request Payload
 * POST /api/auth/register-account
 */
export interface RegisterAccountPayload {
	admin: {
		full_name: string
		email: string
		password: string
	}
	company: {
		name: string
		business_email: string
		country: string
		tax_id?: string
		legal_name?: string
		address_line1?: string
		city?: string
		state?: string
		postal_code?: string
		phone?: string
		website?: string
	}
}

/**
 * Platform Owner Bootstrap
 * POST /api/auth/bootstrap-platform-owner
 */
export interface BootstrapPlatformOwnerPayload {
	full_name: string
	email: string
	password: string
}

export interface BootstrapPlatformOwnerResponse {
	success: true
	data: {
		user: {
			id: string
			email: string
			role: 'platform_owner'
			full_name: string
			organization_id: null
			company_id: null
			is_active: boolean
		}
	}
}
