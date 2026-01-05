'use server'
import { cache } from 'react'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { z } from 'zod'
import { revalidateEntityMutation, CacheTags, fetchWithGracefulFallback } from '@/lib/cache-utils'
import { toIsoUtc } from '@/lib/utils'
import { getDepartments } from './departments'

// Compensation nested object
export interface Compensation {
	pay_type: string
	pay_frequency: string
	annual_salary?: number
	hourly_rate?: number
	standard_hours: number
	overtime_rate: number
	effective_date: string
	end_date?: string | null
}

// Types - Unified User (can be employee, can have login)
export interface User {
	id: string
	email: string
	role: string
	full_name: string
	company_id: string
	company_name?: string // Display name for company
	organization_id?: string
	organization_name?: string // Display name for organization (fallback when no company)
	is_active: boolean
	last_login?: string | null
	created_at: string
	updated_at: string
	created_by?: string | null
	updated_by?: string | null
	// Unified flags
	is_employee: boolean
	can_login: boolean
	// Employee fields (when is_employee = true)
	department_id?: string | null
	department?: string // Display name for department
	employee_number?: string
	employment_type?: string
	employment_status?: string
	hire_date?: string
	termination_date?: string | null
	job_title?: string
	manager_id?: string | null
	date_of_birth?: string
	phone_primary?: string
	phone_secondary?: string
	emergency_contact_name?: string
	emergency_contact_phone?: string
	emergency_contact_relationship?: string
	address_line1?: string
	address_line2?: string
	city?: string
	state?: string
	postal_code?: string
	country?: string
	tax_filing_status?: string
	tax_allowances?: number
	additional_tax_withholding?: number
	tax_exempt?: boolean
	bank_name?: string
	bank_account_type?: string
	// Compensation (nested object when is_employee = true)
	compensation?: Compensation
}

export interface UserStats {
	totalUsers: number
	activeUsers: number
	adminUsers: number
	managerUsers: number
	employeeUsers: number
}

// Validation schemas - unified user/employee creation
const createUserSchema = z.object({
	// Core user fields
	email: z.string().email('Invalid email').optional(), // Optional if can_login = false
	password: z.string().min(6, 'Password must be at least 6 characters').optional(), // Optional if can_login = false
	role: z.string().min(1, 'Role is required'),
	full_name: z.string().min(1, 'Full name is required'),
	is_active: z.boolean().default(true),
	// Unified flags
	can_login: z.boolean().default(true),
	is_employee: z.boolean().default(true),
	// Employee fields
	employee_number: z.string().optional(),
	employment_type: z.string().min(1, 'Employment type is required'),
	employment_status: z.string().optional(),
	hire_date: z.string().min(1, 'Hire date is required'),
	termination_date: z.string().optional(),
	job_title: z.string().optional(),
	manager_id: z.string().optional(),
	department_id: z.string().optional(),
	date_of_birth: z.string().optional(),
	phone_primary: z.string().optional(),
	phone_secondary: z.string().optional(),
	emergency_contact_name: z.string().optional(),
	emergency_contact_phone: z.string().optional(),
	emergency_contact_relationship: z.string().optional(),
	address_line1: z.string().optional(),
	address_line2: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	postal_code: z.string().optional(),
	country: z.string().optional(),
	tax_filing_status: z.string().optional(),
	tax_allowances: z.number().optional(),
	additional_tax_withholding: z.number().optional(),
	tax_exempt: z.boolean().optional(),
	bank_name: z.string().optional(),
	bank_account_type: z.string().optional(),
	// Compensation
	pay_type: z.string().optional(),
	pay_frequency: z.string().optional(),
	annual_salary: z.number().optional(),
	hourly_rate: z.number().optional(),
	standard_hours: z.number().optional(),
	overtime_rate: z.number().optional(),
})

const updateUserSchema = z.object({
	full_name: z.string().min(1).optional(),
	email: z.string().email().optional(),
	password: z.string().min(6).optional(),
	role: z.string().optional(),
	is_active: z.boolean().optional(),
	can_login: z.boolean().optional(),
	is_employee: z.boolean().optional(),
	employee_number: z.string().optional(),
	employment_type: z.string().optional(),
	employment_status: z.string().optional(),
	hire_date: z.string().optional(),
	termination_date: z.string().optional(),
	job_title: z.string().optional(),
	manager_id: z.string().optional(),
	department_id: z.string().optional(),
	date_of_birth: z.string().optional(),
	phone_primary: z.string().optional(),
	phone_secondary: z.string().optional(),
	emergency_contact_name: z.string().optional(),
	emergency_contact_phone: z.string().optional(),
	emergency_contact_relationship: z.string().optional(),
	address_line1: z.string().optional(),
	address_line2: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	postal_code: z.string().optional(),
	country: z.string().optional(),
	tax_filing_status: z.string().optional(),
	tax_allowances: z.number().optional(),
	additional_tax_withholding: z.number().optional(),
	tax_exempt: z.boolean().optional(),
	bank_name: z.string().optional(),
	bank_account_type: z.string().optional(),
	pay_type: z.string().optional(),
	pay_frequency: z.string().optional(),
	annual_salary: z.number().optional(),
	hourly_rate: z.number().optional(),
	standard_hours: z.number().optional(),
	overtime_rate: z.number().optional(),
})

// READ operations (cached with graceful fallback)
export const getUsers = cache(async (): Promise<User[]> => {
	return fetchWithGracefulFallback(
		async () => {
			const cookieHeader = await getAuthCookieHeader()
			const res = await fetch(`${API_BASE_URL}/api/users`, {
				headers: {
					'Content-Type': 'application/json',
					...(cookieHeader && { Cookie: cookieHeader }),
				},
				next: { tags: [CacheTags.USERS], revalidate: 60 },
			})

			if (!res.ok) {
				throw new Error(`Failed to fetch users: ${res.status}`)
			}

			const json = await res.json()
			const raw = Array.isArray(json) ? json : (json.data || json.users || [])

			// Get departments to map department names
			const departments = await getDepartments()
			const departmentMap = new Map(departments.map(dept => [dept.id, dept.name]))

			return raw.map((u: Record<string, unknown>) => ({
				id: String(u.id || ''),
				email: String(u.email || ''),
				role: String(u.role || ''),
				full_name: String(u.full_name || ''),
				company_id: String(u.company_id || ''),
				is_active: Boolean(u.is_active),
				last_login: u.last_login ? String(u.last_login) : null,
				created_at: String(u.created_at || ''),
				updated_at: String(u.updated_at || ''),
				created_by: u.created_by ? String(u.created_by) : null,
				updated_by: u.updated_by ? String(u.updated_by) : null,
				is_employee: Boolean(u.is_employee),
				can_login: Boolean(u.can_login),
				department_id: u.department_id ? String(u.department_id) : null,
				department: u.department_id ? departmentMap.get(String(u.department_id)) : undefined,
				employee_number: u.employee_number ? String(u.employee_number) : undefined,
				employment_type: u.employment_type ? String(u.employment_type) : undefined,
				employment_status: u.employment_status ? String(u.employment_status) : undefined,
				hire_date: u.hire_date ? String(u.hire_date) : undefined,
				termination_date: u.termination_date ? String(u.termination_date) : null,
				job_title: u.job_title ? String(u.job_title) : undefined,
				manager_id: u.manager_id ? String(u.manager_id) : null,
				date_of_birth: u.date_of_birth ? String(u.date_of_birth) : undefined,
				phone_primary: u.phone_primary ? String(u.phone_primary) : undefined,
				phone_secondary: u.phone_secondary ? String(u.phone_secondary) : undefined,
				emergency_contact_name: u.emergency_contact_name ? String(u.emergency_contact_name) : undefined,
				emergency_contact_phone: u.emergency_contact_phone ? String(u.emergency_contact_phone) : undefined,
				emergency_contact_relationship: u.emergency_contact_relationship ? String(u.emergency_contact_relationship) : undefined,
				address_line1: u.address_line1 ? String(u.address_line1) : undefined,
				address_line2: u.address_line2 ? String(u.address_line2) : undefined,
				city: u.city ? String(u.city) : undefined,
				state: u.state ? String(u.state) : undefined,
				postal_code: u.postal_code ? String(u.postal_code) : undefined,
				country: u.country ? String(u.country) : undefined,
				tax_filing_status: u.tax_filing_status ? String(u.tax_filing_status) : undefined,
				tax_allowances: u.tax_allowances ? Number(u.tax_allowances) : undefined,
				additional_tax_withholding: u.additional_tax_withholding ? Number(u.additional_tax_withholding) : undefined,
				tax_exempt: u.tax_exempt !== undefined ? Boolean(u.tax_exempt) : undefined,
				bank_name: u.bank_name ? String(u.bank_name) : undefined,
				bank_account_type: u.bank_account_type ? String(u.bank_account_type) : undefined,
				compensation: u.compensation ? (u.compensation as Compensation) : undefined,
			}))
		},
		[], // Fallback to empty array on error
		{ errorContext: 'getUsers' }
	)
})

export const getUserStats = cache(async (): Promise<UserStats> => {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/users/stats`, {
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		next: { tags: ['users-stats'], revalidate: 60 },
	})

	if (!res.ok) {
		// Fallback: derive stats from users list
		const users = await getUsers()
		const roleCount = users.reduce<Record<string, number>>((acc, u) => { 
			acc[u.role] = (acc[u.role] || 0) + 1
			return acc
		}, {})
		
		return {
			totalUsers: users.length,
			activeUsers: users.filter(u => u.is_active).length,
			adminUsers: (roleCount['admin'] || 0) + (roleCount['system_admin'] || 0),
			managerUsers: (roleCount['hr_manager'] || 0) + (roleCount['payroll_manager'] || 0) + (roleCount['operational_manager'] || 0) + (roleCount['manager'] || 0),
			employeeUsers: roleCount['employee'] || 0,
		}
	}

	const json = await res.json()
	const data = json?.data ?? json
	const roles = data.roles || {}
	
	return {
		totalUsers: Number(data.totalUsers ?? data.total ?? 0) || 0,
		activeUsers: Number(data.activeUsers ?? data.active ?? 0) || 0,
		adminUsers: Number(data.adminUsers ?? roles.system_admin ?? 0) || 0,
		managerUsers: Number(data.managerUsers ?? ((roles.hr_manager||0) + (roles.payroll_manager||0) + (roles.operational_manager||0) + (roles.manager||0))) || 0,
		employeeUsers: Number(data.employeeUsers ?? roles.employee ?? data.employees ?? 0) || 0,
	}
})

// Server Actions for mutations
type ActionResult = { errors: Record<string, string[]> } | { success: true; data?: unknown }

export async function createUserAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
	// Extract and parse all fields
	const rawData: Record<string, unknown> = {}
	formData.forEach((value, key) => {
		if (key === 'is_active' || key === 'can_login' || key === 'is_employee' || key === 'tax_exempt') {
			rawData[key] = value === 'true' || value === 'on'
		} else if (key === 'tax_allowances' || key === 'additional_tax_withholding' || key === 'annual_salary' || key === 'hourly_rate' || key === 'standard_hours' || key === 'overtime_rate') {
			const numVal = value ? Number(value) : undefined
			if (numVal !== undefined && !isNaN(numVal)) {
				rawData[key] = numVal
			}
		} else {
			rawData[key] = value || undefined
		}
	})

	const parsed = createUserSchema.safeParse(rawData)

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	try {
		const cookieHeader = await getAuthCookieHeader()
		
		// Build payload - backend expects flat structure
		const formatDate = (value?: string) => (value ? toIsoUtc(value) : undefined)

		const payload: Record<string, unknown> = {
			email: parsed.data.email,
			password: parsed.data.password,
			role: parsed.data.role,
			full_name: parsed.data.full_name,
			is_active: parsed.data.is_active,
			can_login: parsed.data.can_login,
			is_employee: parsed.data.is_employee,
			employee_number: parsed.data.employee_number,
			employment_type: parsed.data.employment_type,
			employment_status: parsed.data.employment_status,
			hire_date: formatDate(parsed.data.hire_date),
			termination_date: formatDate(parsed.data.termination_date),
			job_title: parsed.data.job_title,
			manager_id: parsed.data.manager_id,
			department_id: parsed.data.department_id,
			date_of_birth: formatDate(parsed.data.date_of_birth),
			phone_primary: parsed.data.phone_primary,
			phone_secondary: parsed.data.phone_secondary,
			emergency_contact_name: parsed.data.emergency_contact_name,
			emergency_contact_phone: parsed.data.emergency_contact_phone,
			emergency_contact_relationship: parsed.data.emergency_contact_relationship,
			address_line1: parsed.data.address_line1,
			address_line2: parsed.data.address_line2,
			city: parsed.data.city,
			state: parsed.data.state,
			postal_code: parsed.data.postal_code,
			country: parsed.data.country,
			tax_filing_status: parsed.data.tax_filing_status,
			tax_allowances: parsed.data.tax_allowances,
			additional_tax_withholding: parsed.data.additional_tax_withholding,
			tax_exempt: parsed.data.tax_exempt,
			bank_name: parsed.data.bank_name,
			bank_account_type: parsed.data.bank_account_type,
			// Compensation fields at root level
			pay_type: parsed.data.pay_type,
			pay_frequency: parsed.data.pay_frequency,
			annual_salary: parsed.data.annual_salary,
			hourly_rate: parsed.data.hourly_rate,
			standard_hours: parsed.data.standard_hours,
			overtime_rate: parsed.data.overtime_rate,
		}

		// Remove undefined values
		Object.keys(payload).forEach(key => {
			if (payload[key] === undefined) {
				delete payload[key]
			}
		})

		const res = await fetch(`${API_BASE_URL}/api/users`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { Cookie: cookieHeader }),
			},
			body: JSON.stringify(payload),
		})

		if (!res.ok) {
			const error = await res.json().catch(() => ({}))
			return { errors: { _form: [error.message || 'Failed to create user'] } }
		}

		const data = await res.json()
		// Revalidate users and all dependent caches (departments, employees, etc.)
		revalidateEntityMutation('USERS')

		return { success: true, data }
	} catch {
		return { errors: { _form: ['Failed to create user'] } }
	}
}

export async function updateUserAction(id: string, prevState: unknown, formData: FormData): Promise<ActionResult> {
	// Extract and parse all fields
	const rawData: Record<string, unknown> = {}
	formData.forEach((value, key) => {
		if (key === 'is_active' || key === 'can_login' || key === 'is_employee' || key === 'tax_exempt') {
			rawData[key] = value === 'true' || value === 'on'
		} else if (key === 'tax_allowances' || key === 'additional_tax_withholding' || key === 'annual_salary' || key === 'hourly_rate' || key === 'standard_hours' || key === 'overtime_rate') {
			const numVal = value ? Number(value) : undefined
			if (numVal !== undefined && !isNaN(numVal)) {
				rawData[key] = numVal
			}
		} else {
			rawData[key] = value || undefined
		}
	})

	const parsed = updateUserSchema.safeParse(rawData)

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	try {
		const cookieHeader = await getAuthCookieHeader()
		
		// Build payload - format dates and remove undefined values
		const payload: Record<string, unknown> = { ...parsed.data }
		
		// Format date fields to ISO UTC format
		if (payload.hire_date) {
			payload.hire_date = toIsoUtc(payload.hire_date as string)
		}
		if (payload.termination_date) {
			payload.termination_date = toIsoUtc(payload.termination_date as string)
		}
		if (payload.date_of_birth) {
			payload.date_of_birth = toIsoUtc(payload.date_of_birth as string)
		}
		
		// Structure compensation fields into nested object
		const compensationFields = ['pay_type', 'pay_frequency', 'annual_salary', 'hourly_rate', 'standard_hours', 'overtime_rate']
		const compensation: Record<string, unknown> = {}
		let hasCompensation = false
		
		compensationFields.forEach(field => {
			if (payload[field] !== undefined) {
				compensation[field] = payload[field]
				delete payload[field] // Remove from top level
				hasCompensation = true
			}
		})
		
		if (hasCompensation) {
			payload.compensation = compensation
		}
		
		Object.keys(payload).forEach(key => {
			if (payload[key] === undefined) {
				delete payload[key]
			}
		})

		const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { Cookie: cookieHeader }),
			},
			body: JSON.stringify(payload),
		})

		if (!res.ok) {
			const error = await res.json().catch(() => ({}))
			return { errors: { _form: [error.message || 'Failed to update user'] } }
		}

		const data = await res.json()
		// Revalidate users and all dependent caches (departments, employees, etc.)
		revalidateEntityMutation('USERS')

		return { success: true, data }
	} catch {
		return { errors: { _form: ['Failed to update user'] } }
	}
}

export async function deleteUserAction(id: string): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to delete user')
	}

	// Revalidate users and all dependent caches (departments, employees, etc.)
	revalidateEntityMutation('USERS')
}

export async function toggleUserStatusAction(id: string, isActive: boolean): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		body: JSON.stringify({ is_active: isActive }),
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to toggle user status')
	}

	// Revalidate users and all dependent caches (departments, employees, etc.)
	revalidateEntityMutation('USERS')
}

/**
 * Get users list with optional filters (for Organization Admin)
 * For Organization Admin: can filter by company_id to see users in specific company
 * If no company_id provided, returns all users in the organization
 */
export async function getUsersByCompany(filters?: { company_id?: string }): Promise<{ data: User[], count: number }> {
	const cookieHeader = await getAuthCookieHeader()
	
	const params = new URLSearchParams()
	if (filters?.company_id) {
		// Validate company_id is non-empty string
		const trimmedId = filters.company_id.trim()
		if (!trimmedId) {
			throw new Error('company_id must be a non-empty string')
		}
		params.set('company_id', trimmedId)
	}
	
	const url = `${API_BASE_URL}/api/users${params.toString() ? `?${params.toString()}` : ''}`
	
	const res = await fetch(url, {
		method: 'GET',
		headers: {
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		cache: 'no-store'
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to fetch users')
	}

	const json = await res.json()
	return {
		data: json.data || [],
		count: json.count || 0
	}
}

/**
 * Get ALL users across all companies in organization (Organization Admin only)
 * Backend should handle organization filtering based on user session
 */
export async function getAllOrganizationUsers(): Promise<User[]> {
	const cookieHeader = await getAuthCookieHeader()
	
	// Call without company_id filter - backend returns all users in organization
	const res = await fetch(`${API_BASE_URL}/api/users`, {
		method: 'GET',
		headers: {
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		cache: 'no-store'
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to fetch organization users')
	}

	const json = await res.json()
	const raw = Array.isArray(json) ? json : (json.data || json.users || [])
	
	return raw.map((u: Record<string, unknown>) => ({
		id: String(u.id || ''),
		email: String(u.email || ''),
		role: String(u.role || ''),
		full_name: String(u.full_name || ''),
		company_id: String(u.company_id || ''),
		company_name: u.company_name ? String(u.company_name) : undefined,
		organization_id: u.organization_id ? String(u.organization_id) : undefined,
		organization_name: u.organization_name ? String(u.organization_name) : undefined,
		is_active: Boolean(u.is_active),
		last_login: u.last_login ? String(u.last_login) : null,
		created_at: String(u.created_at || ''),
		updated_at: String(u.updated_at || ''),
		created_by: u.created_by ? String(u.created_by) : null,
		updated_by: u.updated_by ? String(u.updated_by) : null,
		is_employee: Boolean(u.is_employee),
		can_login: Boolean(u.can_login),
		department_id: u.department_id ? String(u.department_id) : null,
		department: u.department ? String(u.department) : undefined,
		employee_number: u.employee_number ? String(u.employee_number) : undefined,
		employment_type: u.employment_type ? String(u.employment_type) : undefined,
		employment_status: u.employment_status ? String(u.employment_status) : undefined,
		hire_date: u.hire_date ? String(u.hire_date) : undefined,
		termination_date: u.termination_date ? String(u.termination_date) : null,
		job_title: u.job_title ? String(u.job_title) : undefined,
		manager_id: u.manager_id ? String(u.manager_id) : null,
		date_of_birth: u.date_of_birth ? String(u.date_of_birth) : undefined,
		phone_primary: u.phone_primary ? String(u.phone_primary) : undefined,
		phone_secondary: u.phone_secondary ? String(u.phone_secondary) : undefined,
		emergency_contact_name: u.emergency_contact_name ? String(u.emergency_contact_name) : undefined,
		emergency_contact_phone: u.emergency_contact_phone ? String(u.emergency_contact_phone) : undefined,
		emergency_contact_relationship: u.emergency_contact_relationship ? String(u.emergency_contact_relationship) : undefined,
		address_line1: u.address_line1 ? String(u.address_line1) : undefined,
		address_line2: u.address_line2 ? String(u.address_line2) : undefined,
		city: u.city ? String(u.city) : undefined,
		state: u.state ? String(u.state) : undefined,
		postal_code: u.postal_code ? String(u.postal_code) : undefined,
		country: u.country ? String(u.country) : undefined,
		tax_filing_status: u.tax_filing_status ? String(u.tax_filing_status) : undefined,
		tax_allowances: u.tax_allowances ? Number(u.tax_allowances) : undefined,
		additional_tax_withholding: u.additional_tax_withholding ? Number(u.additional_tax_withholding) : undefined,
		tax_exempt: u.tax_exempt ? Boolean(u.tax_exempt) : undefined,
		bank_name: u.bank_name ? String(u.bank_name) : undefined,
		bank_account_type: u.bank_account_type ? String(u.bank_account_type) : undefined,
		compensation: u.compensation as Compensation | undefined,
	}))
}

/**
 * Create a new user (Organization Admin can specify company_id)
 */
export async function createUser(data: {
	full_name: string
	email: string
	password?: string
	role: string
	company_id: string
	can_login: boolean
	department_id?: string
}): Promise<User> {
	const cookieHeader = await getAuthCookieHeader()
	
	const res = await fetch(`${API_BASE_URL}/api/users`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		body: JSON.stringify(data),
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to create user')
	}

	const json = await res.json()
	
	// Revalidate users cache
	revalidateEntityMutation('USERS')
	
	return json.data
}

export async function updateUser(userId: string, data: {
	full_name?: string
	email?: string
	password?: string
	role?: string
	can_login?: boolean
	is_active?: boolean
}): Promise<User> {
	const cookieHeader = await getAuthCookieHeader()
	
	const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		body: JSON.stringify(data),
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to update user')
	}

	const json = await res.json()
	
	// Revalidate users cache
	revalidateEntityMutation('USERS')
	
	return json.data
}

export async function getUserById(userId: string): Promise<User> {
	const cookieHeader = await getAuthCookieHeader()
	
	const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		cache: 'no-store',
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to fetch user')
	}

	const json = await res.json()
	return json.data
}
