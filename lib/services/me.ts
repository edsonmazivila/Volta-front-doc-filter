'use server'
import { cache } from 'react'
import { API_BASE_URL } from '@/lib/config'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { z } from 'zod'
import { revalidateEntityMutation } from '@/lib/cache-utils'

export interface MeUser {
	email: string
	full_name: string
}

export interface MeEmployee {
	address_line1?: string | null
	address_line2?: string | null
	city?: string | null
	state?: string | null
	postal_code?: string | null
	country?: string | null
	phone_primary?: string | null
	phone_secondary?: string | null
	emergency_contact_name?: string | null
	emergency_contact_phone?: string | null
	emergency_contact_relationship?: string | null
}

export interface MeResponse {
	user: MeUser
	employee: MeEmployee
}

export const getProfile = cache(async (): Promise<MeResponse | null> => {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/me`, {
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		next: { tags: ['me'], revalidate: 60 },
	})
	if (!res.ok) return null
	const data = await res.json()
	const user = data.user || {}
	const employee = data.employee || {}
	return {
		user: {
			email: String(user.email || ''),
			full_name: String(user.full_name || ''),
		},
		employee: {
			address_line1: employee.address_line1 ?? null,
			address_line2: employee.address_line2 ?? null,
			city: employee.city ?? null,
			state: employee.state ?? null,
			postal_code: employee.postal_code ?? null,
			country: employee.country ?? null,
			phone_primary: employee.phone_primary ?? null,
			phone_secondary: employee.phone_secondary ?? null,
			emergency_contact_name: employee.emergency_contact_name ?? null,
			emergency_contact_phone: employee.emergency_contact_phone ?? null,
			emergency_contact_relationship: employee.emergency_contact_relationship ?? null,
		},
	}
})

const updateSchema = z.object({
	// User
	full_name: z.string().optional(),
	email: z.string().email('Invalid email').optional(),
	// Employee
	address_line1: z.string().optional(),
	address_line2: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	postal_code: z.string().optional(),
	country: z.string().optional(),
	phone_primary: z.string().optional(),
	phone_secondary: z.string().optional(),
	emergency_contact_name: z.string().optional(),
	emergency_contact_phone: z.string().optional(),
	emergency_contact_relationship: z.string().optional(),
})

export type ActionResult = { success?: boolean; data?: unknown; errors?: { _form?: string[]; [k: string]: string[] | undefined } }

export async function updateProfileAction(_prev: unknown, formData: FormData): Promise<ActionResult> {
	const payload = {
		full_name: formData.get('full_name') || undefined,
		email: formData.get('email') || undefined,
		address_line1: formData.get('address_line1') || undefined,
		address_line2: formData.get('address_line2') || undefined,
		city: formData.get('city') || undefined,
		state: formData.get('state') || undefined,
		postal_code: formData.get('postal_code') || undefined,
		country: formData.get('country') || undefined,
		phone_primary: formData.get('phone_primary') || undefined,
		phone_secondary: formData.get('phone_secondary') || undefined,
		emergency_contact_name: formData.get('emergency_contact_name') || undefined,
		emergency_contact_phone: formData.get('emergency_contact_phone') || undefined,
		emergency_contact_relationship: formData.get('emergency_contact_relationship') || undefined,
	}
	const parsed = updateSchema.safeParse(payload)
	if (!parsed.success) {
		return { errors: parsed.error.flatten().fieldErrors }
	}

	try {
		const cookieHeader = await getAuthCookieHeader()
		const res = await fetch(`${API_BASE_URL}/api/me`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				...(cookieHeader && { Cookie: cookieHeader }),
			},
			body: JSON.stringify(parsed.data),
		})
		if (!res.ok) {
			const err = await res.json().catch(() => ({}))
			return { errors: { _form: [err.message || 'Failed to update profile'] } }
		}
		const data = await res.json().catch(() => ({}))
		// Revalidate user-dependent data and the profile page/tag
		revalidateEntityMutation('USERS', { additionalTags: ['me'], additionalPaths: ['/dashboard/profile'] })
		return { success: true, data }
	} catch {
		return { errors: { _form: ['Failed to update profile'] } }
	}
}


