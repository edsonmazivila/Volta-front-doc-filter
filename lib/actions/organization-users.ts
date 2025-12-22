'use server'

import { createUser as createUserService } from '@/lib/services/users'
import { revalidatePath } from 'next/cache'

export interface CreateUserActionData {
	full_name: string
	email: string
	password?: string
	role: string
	company_id: string
	can_login: boolean
	department_id?: string
}

export interface UserActionResult {
	success?: boolean
	error?: string
	data?: {
		id: string
		email: string
		full_name: string
	}
}

/**
 * Server Action: Create new user for a company
 */
export async function createUserForCompanyAction(data: CreateUserActionData): Promise<UserActionResult> {
	try {
		const user = await createUserService(data)
		
		// Revalidate company users page
		revalidatePath(`/dashboard/organization/companies/${data.company_id}/users`)
		
		return {
			success: true,
			data: {
				id: user.id,
				email: user.email,
				full_name: user.full_name
			}
		}
	} catch (error) {
		console.error('[CREATE_USER_FOR_COMPANY_ACTION] Error:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Failed to create user'
		}
	}
}
