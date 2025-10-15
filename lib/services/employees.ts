'use server'
import { cache } from 'react'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { z } from 'zod'
import { revalidateEntityMutation, CacheTags, fetchWithGracefulFallback } from '@/lib/cache-utils'
import { getCompany } from '@/lib/services/company'
import { toIsoUtc, optionalIsoUtc } from '@/lib/utils'

// Types
export interface Employee {
	id: string
	employee_number?: string
	full_name: string
	first_name?: string
	last_name?: string
	email: string
	job_title?: string
	department?: string
	employment_type?: string
	employment_status: string
	is_active: boolean
	hire_date?: string
	phone_primary?: string
	created_at?: string
}

// Extended employee interface with all available fields
export interface EmployeeDetails extends Employee {
	role?: string
	secondary_phone?: string
	date_of_birth?: string
	address_line1?: string
	address_line2?: string
	city?: string
	state?: string
	postal_code?: string
	country?: string
	emergency_contact_name?: string
	emergency_contact_phone?: string
	emergency_contact_relationship?: string
	pay_type?: string
	pay_frequency?: string
	overtime_rate?: string
	standard_hours?: string
}

export interface EmployeeListParams {
	q?: string
	status?: 'active' | 'inactive' | 'all'
	sort?: 'name' | 'status' | 'department'
	order?: 'asc' | 'desc'
	page?: number
	pageSize?: number
}

// Validation schemas
const createEmployeeSchema = z.object({
    full_name: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email'),
    employee_number: z.string().optional(),
    job_title: z.string().optional(),
    department: z.string().optional(),
    employment_type: z.string().optional(),
    employment_status: z.string().optional(),
    is_active: z.boolean().default(true),
    // Contact & Address
    primary_phone: z.string().optional(),
    secondary_phone: z.string().optional(),
    address_line1: z.string().optional(),
    address_line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().optional(),
    // Dates
    hire_date: z.string().optional(),
    date_of_birth: z.string().optional(),
    // Compensation (optional)
    pay_type: z.string().optional(),
    pay_frequency: z.string().optional(),
    overtime_rate: z.string().optional(),
    standard_hours: z.string().optional(),
})

const updateEmployeeSchema = z.object({
	full_name: z.string().min(1).optional(),
	email: z.string().email().optional(),
	role: z.string().optional(),
	employee_number: z.string().optional(),
	job_title: z.string().optional(),
	department: z.string().optional(),
	employment_type: z.string().optional(),
	employment_status: z.string().optional(),
	hire_date: z.string().optional(),
	phone_primary: z.string().optional(),
	secondary_phone: z.string().optional(),
	date_of_birth: z.string().optional(),
	address_line1: z.string().optional(),
	address_line2: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	postal_code: z.string().optional(),
	country: z.string().optional(),
	emergency_contact_name: z.string().optional(),
	emergency_contact_phone: z.string().optional(),
	emergency_contact_relationship: z.string().optional(),
	pay_type: z.string().optional(),
	pay_frequency: z.string().optional(),
	overtime_rate: z.string().optional(),
	standard_hours: z.string().optional(),
	is_active: z.boolean().optional(),
})

// READ operations (cached)
export const getEmployees = cache(async (params: EmployeeListParams = {}): Promise<{ items: Employee[], total: number }> => {
	return fetchWithGracefulFallback(
		async () => {
			const cookieHeader = await getAuthCookieHeader()

			const searchParams = new URLSearchParams()
			if (params.q) searchParams.append('q', params.q)
			if (params.status) searchParams.append('status', params.status)
			if (params.sort) searchParams.append('sort', params.sort)
			if (params.order) searchParams.append('order', params.order)
			if (params.page) searchParams.append('page', params.page.toString())
			if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString())

			const url = `${API_BASE_URL}/api/employees${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

			const res = await fetch(url, {
				headers: {
					'Content-Type': 'application/json',
					...(cookieHeader && { Cookie: cookieHeader }),
				},
				next: { tags: [CacheTags.EMPLOYEES], revalidate: 60 },
			})

			if (!res.ok) {
				throw new Error(`Failed to fetch employees: ${res.status}`)
			}

		const data = await res.json()
		const rawItems = Array.isArray(data) ? data : (data.employees || data.data || [])
		const total = Array.isArray(data) ? rawItems.length : (data.total ?? rawItems.length)

		// Map API response to Employee interface
		const items: Employee[] = rawItems.map((emp: Record<string, unknown>) => ({
			id: String(emp.id || ''),
			employee_number: emp.employee_number || '',
			full_name: emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
			first_name: emp.first_name || '',
			last_name: emp.last_name || '',
			email: emp.email || '',
			job_title: emp.job_title || '',
			department: emp.department || '',
			employment_type: emp.employment_type || '',
			employment_status: emp.employment_status || 'active',
			is_active: emp.employment_status === 'active' || emp.is_active === true,
			hire_date: emp.hire_date || '',
			phone_primary: emp.phone_primary || '',
			created_at: emp.created_at || '',
		}))

		return { items, total }
		},
		{ items: [], total: 0 },
		{ errorContext: 'getEmployees' }
	)
})

// Get detailed employee information
export const getEmployeeDetails = cache(async (id: string): Promise<EmployeeDetails | null> => {
	return fetchWithGracefulFallback(
		async () => {
			const cookieHeader = await getAuthCookieHeader()
			const url = `${API_BASE_URL}/api/employees/${id}`

			const res = await fetch(url, {
				headers: {
					'Content-Type': 'application/json',
					...(cookieHeader && { Cookie: cookieHeader }),
				},
				next: { tags: [CacheTags.EMPLOYEES], revalidate: 60 },
			})

			if (!res.ok) {
				if (res.status === 404) return null
				throw new Error(`Failed to fetch employee details: ${res.status}`)
			}

			const emp = await res.json()
			
			// Map API response to EmployeeDetails interface
			return {
				id: String(emp.id || ''),
				employee_number: emp.employee_number || '',
				full_name: emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
				first_name: emp.first_name || '',
				last_name: emp.last_name || '',
				email: emp.email || '',
				job_title: emp.job_title || '',
				department: emp.department || '',
				employment_type: emp.employment_type || '',
				employment_status: emp.employment_status || 'active',
				is_active: emp.employment_status === 'active' || emp.is_active === true,
				hire_date: emp.hire_date || '',
				phone_primary: emp.phone_primary || '',
				created_at: emp.created_at || '',
				role: emp.role || '',
				secondary_phone: emp.secondary_phone || '',
				date_of_birth: emp.date_of_birth || '',
				address_line1: emp.address_line1 || '',
				address_line2: emp.address_line2 || '',
				city: emp.city || '',
				state: emp.state || '',
				postal_code: emp.postal_code || '',
				country: emp.country || '',
				emergency_contact_name: emp.emergency_contact_name || '',
				emergency_contact_phone: emp.emergency_contact_phone || '',
				emergency_contact_relationship: emp.emergency_contact_relationship || '',
				pay_type: emp.pay_type || '',
				pay_frequency: emp.pay_frequency || '',
				overtime_rate: emp.overtime_rate || '',
				standard_hours: emp.standard_hours || '',
			}
		},
		null,
		{ errorContext: 'getEmployeeDetails' }
	)
})

// Server Actions for mutations
type ActionResult = { errors: Record<string, string[]> } | { success: true; data?: unknown }

export async function createEmployeeAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
    // Debug: log incoming form entries
    try {
        const debugEntries: Record<string, unknown> = {}
        formData.forEach((v, k) => {
            debugEntries[k] = v
        })
        console.debug('[employees] createEmployeeAction formData', debugEntries)
    } catch {}

    const parsed = createEmployeeSchema.safeParse({
        full_name: formData.get('full_name') || '',
        email: formData.get('email') || '',
        employee_number: formData.get('employee_number') || undefined,
        job_title: formData.get('job_title') || undefined,
        department: formData.get('department') || undefined,
        employment_type: formData.get('employment_type') || undefined,
        employment_status: formData.get('employment_status') || undefined,
        is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
        primary_phone: formData.get('primary_phone') || undefined,
        secondary_phone: formData.get('secondary_phone') || undefined,
        address_line1: formData.get('address_line1') || undefined,
        address_line2: formData.get('address_line2') || undefined,
        city: formData.get('city') || undefined,
        state: formData.get('state') || undefined,
        postal_code: formData.get('postal_code') || undefined,
        country: formData.get('country') || undefined,
        hire_date: formData.get('hire_date') || undefined,
        date_of_birth: formData.get('date_of_birth') || undefined,
        pay_type: formData.get('pay_type') || undefined,
        pay_frequency: formData.get('pay_frequency') || undefined,
        overtime_rate: formData.get('overtime_rate') || undefined,
        standard_hours: formData.get('standard_hours') || undefined,
    })

	if (!parsed.success) {
        const flat = parsed.error.flatten().fieldErrors
        console.error('[employees] createEmployeeAction validation failed', flat)
        return { errors: flat }
	}

	try {
        const cookieHeader = await getAuthCookieHeader()
        // Ensure company_id is included as backend requires it
        const company = await getCompany().catch(() => null)
        const company_id = company?.id
        // Build payload mapping UI field names to API expectations
        const body = {
            // Required/account fields
            full_name: parsed.data.full_name,
            email: parsed.data.email,
            // Direct mappings
            employee_number: parsed.data.employee_number || undefined,
            job_title: parsed.data.job_title || undefined,
            employment_type: parsed.data.employment_type || undefined,
            employment_status: parsed.data.employment_status || 'active',
            is_active: parsed.data.is_active,
            // Map department (UI) to department_id (API)
            department_id: parsed.data.department || undefined,
            company_id,
            // Phone rename to API naming
            phone_primary: parsed.data.primary_phone || (formData.get('phone_primary') || undefined),
            phone_secondary: parsed.data.secondary_phone || (formData.get('phone_secondary') || undefined),
            // Address
            address_line1: parsed.data.address_line1 || undefined,
            address_line2: parsed.data.address_line2 || undefined,
            city: parsed.data.city || undefined,
            state: parsed.data.state || undefined,
            postal_code: parsed.data.postal_code || undefined,
            country: parsed.data.country || undefined,
            // Dates normalized to ISO UTC
            hire_date: optionalIsoUtc(parsed.data.hire_date),
            date_of_birth: optionalIsoUtc(parsed.data.date_of_birth),
            // Compensation (convert to numbers if provided)
            pay_type: parsed.data.pay_type || undefined,
            pay_frequency: parsed.data.pay_frequency || undefined,
            overtime_rate: parsed.data.overtime_rate !== undefined && parsed.data.overtime_rate !== '' ? Number(parsed.data.overtime_rate) : undefined,
            standard_hours: parsed.data.standard_hours !== undefined && parsed.data.standard_hours !== '' ? Number(parsed.data.standard_hours) : undefined,
        }
        console.debug('[employees] createEmployeeAction request body', body)
		const res = await fetch(`${API_BASE_URL}/api/employees`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { Cookie: cookieHeader }),
			},
			body: JSON.stringify(body),
		})

		if (!res.ok) {
            const text = await res.text().catch(() => '')
            let error: { message?: string } = {}
            try { error = text ? JSON.parse(text) : {} } catch {}
            console.error('[employees] createEmployeeAction failed', res.status, text)
            return { errors: { _form: [error.message || `Failed to create employee (${res.status})`] } }
		}

		const data = await res.json()
		// Revalidate employees and all dependent caches
		revalidateEntityMutation('EMPLOYEES')

		return { success: true, data }
    } catch (e) {
        console.error('[employees] createEmployeeAction threw', e)
        return { errors: { _form: ['Failed to create employee'] } }
	}
}

export async function updateEmployeeAction(id: string, prevState: unknown, formData: FormData): Promise<ActionResult> {
	const parsed = updateEmployeeSchema.safeParse({
		full_name: formData.get('full_name') || undefined,
		email: formData.get('email') || undefined,
		role: formData.get('role') || undefined,
		employee_number: formData.get('employee_number') || undefined,
		job_title: formData.get('job_title') || undefined,
		department: formData.get('department') || undefined,
		employment_type: formData.get('employment_type') || undefined,
		employment_status: formData.get('employment_status') || undefined,
		hire_date: toIsoUtc(String(formData.get('hire_date') || '')) || undefined,
		phone_primary: formData.get('phone_primary') || undefined,
		secondary_phone: formData.get('secondary_phone') || undefined,
		date_of_birth: toIsoUtc(String(formData.get('date_of_birth') || '')) || undefined,
		address_line1: formData.get('address_line1') || undefined,
		address_line2: formData.get('address_line2') || undefined,
		city: formData.get('city') || undefined,
		state: formData.get('state') || undefined,
		postal_code: formData.get('postal_code') || undefined,
		country: formData.get('country') || undefined,
		emergency_contact_name: formData.get('emergency_contact_name') || undefined,
		emergency_contact_phone: formData.get('emergency_contact_phone') || undefined,
		emergency_contact_relationship: formData.get('emergency_contact_relationship') || undefined,
		pay_type: formData.get('pay_type') || undefined,
		pay_frequency: formData.get('pay_frequency') || undefined,
		overtime_rate: formData.get('overtime_rate') || undefined,
		standard_hours: formData.get('standard_hours') || undefined,
		is_active: formData.get('is_active') ? formData.get('is_active') === 'true' || formData.get('is_active') === 'on' : undefined,
	})

	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	try {
		const cookieHeader = await getAuthCookieHeader()
		const res = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { Cookie: cookieHeader }),
			},
			body: JSON.stringify(parsed.data),
		})

		if (!res.ok) {
			const error = await res.json().catch(() => ({}))
			return { errors: { _form: [error.message || 'Failed to update employee'] } }
		}

		const data = await res.json()
		// Revalidate employees and all dependent caches
		revalidateEntityMutation('EMPLOYEES')

		return { success: true, data }
	} catch {
		return { errors: { _form: ['Failed to update employee'] } }
	}
}

export async function deleteEmployeeAction(id: string): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to delete employee')
	}

	// Revalidate employees and all dependent caches
	revalidateEntityMutation('EMPLOYEES')
}

export async function toggleEmployeeStatusAction(id: string, isActive: boolean): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		body: JSON.stringify({ is_active: isActive }),
	})

	if (!res.ok) {
		const error = await res.json().catch(() => ({}))
		throw new Error(error.message || 'Failed to toggle employee status')
	}

	// Revalidate employees and all dependent caches
	revalidateEntityMutation('EMPLOYEES')
}
